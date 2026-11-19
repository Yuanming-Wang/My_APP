import { useCallback, useEffect, useRef, useState } from 'react'
import type { AudioRecording } from '../types'

export const MAX_AUDIO_SECONDS = 30

export function useAudioRecorder(onComplete?: (recording: AudioRecording) => void) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef(0)
  const completeRef = useRef(onComplete)
  const unmountedRef = useRef(false)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }, [])

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recorder.stop()
  }, [])

  const start = useCallback(async () => {
    setError('')

    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('当前浏览器不支持录音，请换一个浏览器。')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ].find((type) => MediaRecorder.isTypeSupported(type)) || ''

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const duration = secondsRef.current
        const type = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'
        const file = new File([blob], `story-${Date.now()}.${ext}`, { type })
        const url = URL.createObjectURL(blob)

        cleanup()
        setRecording(false)

        if (!unmountedRef.current) {
          completeRef.current?.({ file, url, duration })
        }
      }

      recorderRef.current = recorder
      secondsRef.current = 0
      setSeconds(0)
      setRecording(true)
      recorder.start()

      timerRef.current = setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)
        if (secondsRef.current >= MAX_AUDIO_SECONDS) stop()
      }, 1000)

      return true
    } catch (err) {
      console.error('录音失败:', err)
      cleanup()
      setRecording(false)
      setError('无法使用麦克风，请检查浏览器权限。')
      return false
    }
  }, [cleanup, stop])

  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      cleanup()
    }
  }, [cleanup])

  return { recording, seconds, error, start, stop }
}
