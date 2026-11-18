import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../hooks/useStore'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ROUTES, MAX_STORY_LENGTH } from '../../lib/constants'

export function StoriesPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const draftMedia = useStore((s) => s.draftMedia)
  const updateStory = useStore((s) => s.updateStory)
  const toggleNeedStory = useStore((s) => s.toggleNeedStory)
  const [submitting, setSubmitting] = useState(false)

  const handleGenerate = () => {
    setSubmitting(true)
    onNavigate(ROUTES.GENERATING)
  }

  const storiesCount = draftMedia.filter((m) => m.needStory).length

  return (
    <PageContainer>
      <TopBar title="讲述故事" onBack={() => onNavigate(ROUTES.CREATE)} />

      <div className="px-4 py-4 space-y-4">
        {/* 说明 */}
        <div className="flex items-start gap-3 p-3 bg-[#FFF8F0] rounded-[8px]">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-[14px] font-medium text-[#1A1A1A]">选择哪些需要讲故事</p>
            <p className="text-[13px] text-[#666] mt-1">打开开关的需要写一句话，关闭的会自动生成描述。</p>
          </div>
        </div>

        {draftMedia.map((media, index) => (
          <motion.div
            key={media.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              {/* 媒体预览 */}
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
                {/* 开关 */}
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
                    onClick={() => toggleNeedStory(media.id)}
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

                {/* 状态说明 */}
                {media.needStory ? (
                  <div className="flex items-center gap-2 p-2 bg-[#FFF8F0] rounded-[6px] mb-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="text-[12px] text-[#8B4513]">已开启，请在下方写一句话。</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-[#F5F5F5] rounded-[6px] mb-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                    </svg>
                    <span className="text-[12px] text-[#999]">已关闭，系统会自动生成描述。</span>
                  </div>
                )}

                {/* 故事输入框 */}
                {media.needStory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    <textarea
                      value={media.story}
                      onChange={(e) => updateStory(media.id, e.target.value)}
                      placeholder="例如：这是我和老战友在公园重逢，那天聊了很多年轻时候的事。"
                      className="input min-h-[100px] resize-none"
                      maxLength={MAX_STORY_LENGTH}
                    />
                    <p className="text-[12px] text-[#999] mt-1 text-right">
                      {media.story.length}/{MAX_STORY_LENGTH}
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-[480px] mx-auto">
          <p className="text-[12px] text-[#999] text-center mb-2">
            {storiesCount > 0 ? `${storiesCount} 个需要写故事` : '所有内容将自动生成描述'}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={submitting}
            onClick={handleGenerate}
          >
            一键入藏
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
