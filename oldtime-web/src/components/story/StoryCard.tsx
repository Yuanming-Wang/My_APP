import { motion } from 'framer-motion'
import type { AudioRecording, DraftMedia } from '../../types'
import { MAX_AUDIO_SECONDS, useAudioRecorder } from '../../hooks/useAudioRecorder'
import { MAX_STORY_LENGTH } from '../../lib/constants'
import { Card } from '../ui/Card'

interface StoryCardProps {
  media: DraftMedia
  index: number
  onStoryChange: (id: string, story: string) => void
  onToggleNeedStory: (id: string) => void
  onAudioChange: (id: string, audio: AudioRecording | null) => void
}

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function StoryCard({
  media,
  index,
  onStoryChange,
  onToggleNeedStory,
  onAudioChange,
}: StoryCardProps) {
  const { recording, seconds, error, start, stop } = useAudioRecorder((audio) => {
    if (media.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(media.audioUrl)
    onAudioChange(media.id, audio)
  })

  const removeAudio = () => {
    if (media.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(media.audioUrl)
    onAudioChange(media.id, null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        {media.type === 'video' ? (
          <div className="relative">
            <video
              src={media.dataUrl}
              className="w-full h-[200px] object-cover"
              muted
              playsInline
              preload="metadata"
              poster={media.thumbnailUrl}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#1890FF] text-white text-[11px] font-medium">
              视频
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={media.dataUrl}
              alt={`照片 ${index + 1}`}
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#52C41A] text-white text-[11px] font-medium">
              照片
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8B4513] flex items-center justify-center text-white text-[12px] font-medium">
                {index + 1}
              </span>
              <span className="text-[14px] font-medium text-[#1A1A1A]">
                需要写故事吗？
              </span>
            </div>
            <button
              onClick={() => onToggleNeedStory(media.id)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                media.needStory ? 'bg-[#8B4513]' : 'bg-[#E8E8E8]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  media.needStory ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {media.needStory ? (
            <div className="flex items-center gap-2 p-2 bg-[#FFF8F0] rounded-[6px] mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-[12px] text-[#8B4513]">已开启，可以写一句，也可以直接说一段。</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-[#F5F5F5] rounded-[6px] mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-[12px] text-[#999]">已关闭，系统会自动生成描述。</span>
            </div>
          )}

          {media.needStory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                value={media.story}
                onChange={(event) => onStoryChange(media.id, event.target.value)}
                placeholder="例如：这是我和老战友在公园重逢，那天聊了很多年轻时候的事。"
                className="input min-h-[100px] resize-none"
                maxLength={MAX_STORY_LENGTH}
              />
              <p className="text-[12px] text-[#999] mt-1 text-right">
                {media.story.length}/{MAX_STORY_LENGTH}
              </p>
            </motion.div>
          )}

          <div className="mt-4 rounded-[12px] border border-[#E5DCD1] bg-[#FFF8F0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2">
                <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              <p className="text-[14px] font-medium text-[#2D2318]">直接说出来</p>
              <span className="text-[11px] text-[#999]">可选 · 最多 {MAX_AUDIO_SECONDS} 秒</span>
            </div>

            {recording ? (
              <>
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {Array.from({ length: 9 }).map((_, barIndex) => (
                    <span
                      key={barIndex}
                      className="w-1.5 rounded-full bg-[#8B4513] animate-pulse"
                      style={{
                        height: `${12 + (barIndex % 4) * 8}px`,
                        animationDelay: `${barIndex * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-center text-[13px] text-[#8B4513] mb-3">
                  正在讲述 · {formatSeconds(seconds)}
                </p>
                <button
                  onClick={stop}
                  className="w-full h-12 rounded-[10px] bg-[#8B4513] text-white text-[16px] font-semibold active:scale-[0.98] transition-transform"
                >
                  结束讲述
                </button>
              </>
            ) : media.audioUrl ? (
              <>
                <audio controls src={media.audioUrl} className="w-full" preload="metadata" />
                <p className="text-[12px] text-[#999] mt-2">
                  已录 {formatSeconds(media.audioDuration || 0)}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={removeAudio}
                    className="flex-1 h-10 rounded-[8px] border border-[#E8E8E8] text-[#666] text-[13px] bg-white"
                  >
                    删除录音
                  </button>
                  <button
                    onClick={() => void start()}
                    className="flex-1 h-10 rounded-[8px] border border-[#8B4513] text-[#8B4513] text-[13px] bg-white"
                  >
                    重新录音
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => void start()}
                className="w-full h-14 rounded-[12px] bg-gradient-to-r from-[#8B4513] to-[#A9713A] text-white text-[17px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
                开始讲述
              </button>
            )}

            {error && <p className="text-[12px] text-[#FF4D4F] mt-2">{error}</p>}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
