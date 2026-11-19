import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Button } from '../ui/Button'
import { HelpModal } from '../ui/HelpModal'
import { StoryCard } from '../story/StoryCard'
import { ROUTES } from '../../lib/constants'

export function StoriesPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const draftMedia = useStore((s) => s.draftMedia)
  const updateStory = useStore((s) => s.updateStory)
  const toggleNeedStory = useStore((s) => s.toggleNeedStory)
  const setMediaAudio = useStore((s) => s.setMediaAudio)
  const [submitting, setSubmitting] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const handleGenerate = () => {
    setSubmitting(true)
    onNavigate(ROUTES.GENERATING)
  }

  const storiesCount = draftMedia.filter((m) => m.needStory).length

  return (
    <PageContainer>
      <TopBar title="讲述故事" onBack={() => onNavigate(ROUTES.CREATE)} />

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-start gap-3 p-3 bg-[#FFF8F0] rounded-[8px]">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-[14px] font-medium text-[#1A1A1A]">可以写，也可以直接说</p>
            <p className="text-[13px] text-[#666] mt-1">
              每张照片都可以录一段原声；不想写字也没关系。
            </p>
          </div>
        </div>

        {draftMedia.map((media, index) => (
          <StoryCard
            key={media.id}
            media={media}
            index={index}
            onStoryChange={updateStory}
            onToggleNeedStory={toggleNeedStory}
            onAudioChange={setMediaAudio}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={() => setHelpOpen(true)}
            className="w-full h-11 mb-3 rounded-[10px] border border-[#D4AF37]/60 text-[#8B4513] text-[14px] font-medium active:scale-[0.98] transition-transform"
          >
            叫孩子帮忙写故事
          </button>
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

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </PageContainer>
  )
}
