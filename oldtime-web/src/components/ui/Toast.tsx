import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({ message, duration = 2500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 200)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div className="px-4 py-3 bg-black/75 text-white text-[14px] rounded-[8px] max-w-[280px] text-center">
        {message}
      </div>
    </div>,
    document.body
  )
}
