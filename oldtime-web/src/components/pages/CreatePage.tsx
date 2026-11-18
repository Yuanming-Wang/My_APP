import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../hooks/useStore'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ROUTES, MAX_PHOTOS, MAX_VIDEOS, TEXTS } from '../../lib/constants'

export function CreatePage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const draftMedia = useStore((s) => s.draftMedia)
  const ownerName = useStore((s) => s.ownerName)
  const setOwnerName = useStore((s) => s.setOwnerName)
  const addMedia = useStore((s) => s.addMedia)
  const removeMedia = useStore((s) => s.removeMedia)
  const loading = useStore((s) => s.loading)
  const showToast = useStore((s) => s.showToast)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleNext = useCallback(() => {
    if (!ownerName.trim()) {
      showToast('请先填写珍藏人姓名。')
      return
    }
    onNavigate(ROUTES.STORIES)
  }, [onNavigate, ownerName, showToast])

  const imageCount = draftMedia.filter((m) => m.type === 'image').length
  const videoCount = draftMedia.filter((m) => m.type === 'video').length

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await addMedia(files)
    if (fileRef.current) fileRef.current.value = ''
  }, [addMedia])

  const handleDelete = useCallback(() => {
    if (deleteId) {
      removeMedia(deleteId)
      setDeleteId(null)
    }
  }, [deleteId, removeMedia])

  return (
    <PageContainer>
      <TopBar title="挑选藏品" onBack={() => onNavigate(ROUTES.HOME)} />

      <div className="px-4 py-4 space-y-4">
        {/* 珍藏人 */}
        <div>
          <label className="text-[13px] text-[#666] mb-2 block">珍藏人</label>
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="例如：张爷爷"
            className="input"
            maxLength={20}
          />
        </div>

        {/* 上传区 */}
        <Card
          onClick={() => fileRef.current?.click()}
          className="p-8 flex flex-col items-center justify-center gap-4 border-dashed cursor-pointer hover:border-[#8B4513] transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFF8F0] to-[#F5E6D3] flex items-center justify-center">
            {loading ? (
              <span className="w-6 h-6 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
          </div>
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#1A1A1A]">从手机里挑选照片或视频</p>
            <p className="text-[13px] text-[#999] mt-1">
              照片最多 {MAX_PHOTOS} 张 · 视频最多 {MAX_VIDEOS} 个
            </p>
          </div>
        </Card>

        {/* 统计 */}
        {draftMedia.length > 0 && (
          <div className="flex gap-4 text-[13px] text-[#666]">
            <span>📷 照片: {imageCount}/{MAX_PHOTOS}</span>
            <span>🎬 视频: {videoCount}/{MAX_VIDEOS}</span>
          </div>
        )}

        {/* 已选媒体 */}
        <AnimatePresence>
          {draftMedia.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-2 gap-3">
                {draftMedia.map((media, i) => (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="relative aspect-square overflow-hidden group">
                      {/* 缩略图 */}
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <img
                            src={media.thumbnailUrl || media.dataUrl}
                            alt={`视频 ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 播放图标 */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <polygon points="5,3 19,12 5,21" />
                              </svg>
                            </div>
                          </div>
                          {/* 时长 */}
                          {media.duration && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-[11px]">
                              {formatDuration(media.duration)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <img
                          src={media.dataUrl}
                          alt={`照片 ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}

                      {/* 编号 */}
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-[12px] font-medium">{i + 1}</span>
                      </div>

                      {/* 类型标记 */}
                      <div className="absolute top-2 left-9 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          background: media.type === 'video' ? '#1890FF' : '#52C41A',
                          color: 'white',
                        }}
                      >
                        {media.type === 'video' ? '视频' : '照片'}
                      </div>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => setDeleteId(media.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>

                      {/* 底部渐变 */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-[480px] mx-auto flex items-center justify-between">
          <p className="text-[13px] text-[#999]">
            已选 <span className="text-[#8B4513] font-medium">{draftMedia.length}</span> 个文件
          </p>
          <Button
            variant="primary"
            disabled={draftMedia.length === 0 || loading}
            onClick={handleNext}
          >
            下一步，讲故事
          </Button>
        </div>
      </div>

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除文件"
        message={TEXTS.DELETE_CONFIRM}
        confirmText="删除"
        danger
      />
    </PageContainer>
  )
}

// 格式化时长
function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
