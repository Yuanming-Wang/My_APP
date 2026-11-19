import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ErrorState } from '../ui/ErrorState'
import { draftsApi } from '../../lib/api'
import { MAX_STORY_LENGTH } from '../../lib/constants'

interface DraftPhoto {
  id: string
  image_url: string
  story: string
}

interface Draft {
  id: string
  owner_name: string
  status: string
  photos: DraftPhoto[]
}

export function CollaboratePage() {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const { draftId } = useParams<{ draftId: string }>()

  useEffect(() => {
    if (!draftId) {
      setError('链接无效，请让父母重新发送。')
      setLoading(false)
      return
    }

    loadDraft(draftId)
  }, [draftId])

  const loadDraft = async (id: string) => {
    try {
      setLoading(true)
      const res = await draftsApi.get(id)
      setDraft(res.data)
    } catch (err: any) {
      setError(err.message || '加载失败，请让父母重新发送链接。')
    } finally {
      setLoading(false)
    }
  }

  const handleStoryChange = (photoId: string, story: string) => {
    setDraft((current) => current ? {
      ...current,
      photos: current.photos.map((photo) => photo.id === photoId ? { ...photo, story } : photo),
    } : current)
  }

  const handleSaveStory = async (photoId: string, story: string) => {
    if (!draftId) return

    try {
      await draftsApi.updateStory(draftId, photoId, story)
    } catch (err: any) {
      alert('保存失败：' + (err.message || '请重试'))
    }
  }

  const handleComplete = async () => {
    if (!draftId || !draft) return

    try {
      setCompleting(true)
      await Promise.all(draft.photos.map((photo) => draftsApi.updateStory(draftId, photo.id, photo.story)))
      await draftsApi.complete(draftId)
      setCompleted(true)
    } catch (err: any) {
      alert('完成失败：' + (err.message || '请重试'))
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <TopBar title="帮忙编辑" />
        <div className="px-4 py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 skeleton rounded-[12px]" />
          ))}
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <TopBar title="帮忙编辑" />
        <ErrorState title="无法加载" message={error} onRetry={() => draftId && loadDraft(draftId)} />
      </PageContainer>
    )
  }

  if (completed) {
    return (
      <PageContainer>
        <TopBar title="帮忙编辑" />
        <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F6FFED] flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#52C41A" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">编辑完成！</h2>
          <p className="text-[14px] text-[#666] mb-8">纪念册已生成，父母可以在"我的收藏馆"中查看。</p>
        </div>
      </PageContainer>
    )
  }

  if (!draft) return null

  return (
    <PageContainer>
      <TopBar title={`帮忙编辑 · ${draft.owner_name}的纪念册`} />

      <div className="px-4 py-4 space-y-4">
        {/* 说明 */}
        <div className="flex items-start gap-3 p-3 bg-[#E6F7FF] rounded-[8px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1890FF" strokeWidth="2" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          <p className="text-[13px] text-[#1890FF]">
            请帮{draft.owner_name}为每张照片写一句话，完成后点击底部按钮。
          </p>
        </div>

        {/* 照片列表 */}
        {draft.photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <img
                src={photo.image_url}
                alt={`照片 ${index + 1}`}
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4">
                <p className="text-[13px] text-[#666] mb-3">
                  第 {index + 1} 张照片，请帮写一句话：
                </p>
                <textarea
                  value={photo.story}
                  onChange={(e) => handleStoryChange(photo.id, e.target.value)}
                  onBlur={(e) => void handleSaveStory(photo.id, e.target.value)}
                  placeholder="例如：这是我和老战友在公园重逢，那天聊了很多年轻时候的事。"
                  className="input min-h-[100px] resize-none"
                  maxLength={MAX_STORY_LENGTH}
                />
                <p className="text-[12px] text-[#999] mt-1 text-right">
                  {photo.story.length}/{MAX_STORY_LENGTH}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* 完成按钮 */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8E8] -mx-4 -mb-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={completing}
            onClick={handleComplete}
          >
            完成编辑，生成纪念册
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
