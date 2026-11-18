import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../hooks/useStore'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { ROUTES, TEXTS } from '../../lib/constants'

export function SharePage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const book = useStore((s) => s.getActiveBook())
  const showToast = useStore((s) => s.showToast)
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLink = useCallback(async () => {
    if (!book) return
    setCopying(true)
    try {
      const url = `${window.location.origin}${window.location.pathname}#/share/${book.shareSlug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      showToast(TEXTS.COPY_SUCCESS)
    } catch (err) {
      console.error('复制失败:', err)
      const url = `${window.location.origin}${window.location.pathname}#/share/${book.shareSlug}`
      window.prompt('请长按复制下面的分享链接', url)
      showToast(TEXTS.COPY_FAILED)
    } finally {
      setCopying(false)
    }
  }, [book, showToast])

  if (!book) {
    return (
      <PageContainer>
        <TopBar title="送出去" onBack={() => onNavigate(ROUTES.READER)} />
        <EmptyState
          icon="📤"
          title="未找到纪念册"
          description="请返回首页重新选择。"
          action={{ label: '返回首页', onClick: () => onNavigate(ROUTES.HOME) }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <TopBar title="送出去" onBack={() => onNavigate(ROUTES.READER)} />

      <div className="px-4 py-6 space-y-6">
        {/* 预览卡片 — 3D 效果 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="perspective-[800px]"
        >
          <motion.div
            className="relative"
            whileHover={{ rotateY: -5, rotateX: 3 }}
            transition={{ duration: 0.3 }}
          >
            <Card elevated className="p-5 overflow-hidden">
              {/* 装饰光效 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-full blur-xl" />

              <div className="relative flex gap-4">
                {/* 书籍封面 */}
                <div className="w-[100px] h-[140px] flex-shrink-0 rounded-[4px_8px_8px_4px] overflow-hidden relative shadow-md">
                  <div className="absolute left-0 top-0 bottom-0 w-[16px] bg-gradient-to-r from-[#3d1a00] to-[#7a3b12] z-10" />
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-[12px] text-[#999] mb-1">{book.archiveNo}</p>
                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-[13px] text-[#666] line-clamp-2">{book.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#999]">
                    <span>{book.pages.length} 页</span>
                    <span>·</span>
                    <span>{book.ownerName}</span>
                    <span>·</span>
                    <span>{book.createdAt}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* 标题 */}
        <div className="text-center">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">送给谁珍藏？</h2>
          <p className="text-[14px] text-[#999]">复制链接后，可以发到微信、短信或家庭群。</p>
        </div>

        {/* 分享选项 */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={copying}
            onClick={copyLink}
          >
            {copied ? '已复制 ✓' : '复制分享链接'}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => onNavigate(ROUTES.HOME)}
          >
            回到收藏馆
          </Button>
        </div>

        {/* 提示 */}
        <div className="flex items-start gap-3 p-3 bg-[#F6FFED] rounded-[8px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52C41A" strokeWidth="2" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
          <p className="text-[13px] text-[#52C41A]">
            收到链接的人，可以在手机上直接打开查看这本纪念册。
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
