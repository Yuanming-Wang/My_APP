import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../hooks/useStore'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { ROUTES } from '../../lib/constants'

export function ReaderPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const book = useStore((s) => s.getActiveBook())
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const totalPages = book ? book.pages.length + 2 : 0

  const goNext = useCallback(() => {
    if (page < totalPages - 1) { setDirection(1); setPage((p) => p + 1) }
  }, [page, totalPages])

  const goPrev = useCallback(() => {
    if (page > 0) { setDirection(-1); setPage((p) => p - 1) }
  }, [page])

  if (!book) {
    return (
      <PageContainer>
        <TopBar title="翻阅藏品" onBack={() => onNavigate(ROUTES.HOME)} />
        <EmptyState icon="📖" title="未找到纪念册" description="请返回首页重新选择。" action={{ label: '返回首页', onClick: () => onNavigate(ROUTES.HOME) }} />
      </PageContainer>
    )
  }

  const renderMedia = (pageData: any) => {
    if (pageData.mediaType === 'video') {
      return (
        <video
          src={pageData.mediaUrl}
          className="w-full h-[240px] object-cover"
          controls
          playsInline
          preload="metadata"
          poster={pageData.thumbnailUrl}
        />
      )
    }
    return (
      <img
        src={pageData.mediaUrl}
        alt={pageData.chapterTitle}
        className="w-full h-[240px] object-cover"
      />
    )
  }

  const renderPage = () => {
    if (page === 0) {
      return (
        <Card elevated className="overflow-hidden">
          <div className="relative">
            <img src={book.coverImageUrl} alt={book.title} className="w-full h-[300px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white/70 text-[12px] mb-1">{book.archiveNo}</p>
              <h2 className="text-white text-[22px] font-semibold">{book.title}</h2>
              <p className="text-white/80 text-[14px] mt-1">{book.subtitle}</p>
            </div>
          </div>
        </Card>
      )
    }

    if (page === totalPages - 1) {
      return (
        <Card elevated className="p-6 text-center">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-gradient-to-b from-[#D4AF37]/10 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFF8F0] to-[#F5E6D3] flex items-center justify-center">
                <span className="text-2xl">🏅</span>
              </div>
              <p className="text-[12px] text-[#999] mb-2">收藏证书</p>
              <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-4">{book.title}</h2>
              <p className="text-[14px] text-[#666] leading-relaxed mb-6">{book.certificateText}</p>
              <div className="pt-4 border-t border-[#E8E8E8]">
                <p className="text-[15px] font-medium text-[#1A1A1A]">{book.ownerName} 珍藏</p>
                <p className="text-[12px] text-[#999] mt-1">{book.archiveNo} · {book.createdAt}</p>
              </div>
            </div>
          </div>
        </Card>
      )
    }

    const pageData = book.pages[page - 1]
    if (!pageData) return null

    return (
      <Card elevated className="overflow-hidden">
        <div className="relative">
          {renderMedia(pageData)}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="text-white text-[11px]">{String(pageData.pageIndex).padStart(2, '0')}/{book.pages.length}</span>
          </div>
          {pageData.mediaType === 'video' && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-[#1890FF] rounded-full">
              <span className="text-white text-[11px] font-medium">视频</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-[16px] font-medium text-[#1A1A1A] mb-3">{pageData.chapterTitle}</h3>
          <p className="text-[15px] text-[#666] leading-[1.8]">{pageData.polishedStory}</p>
        </div>
      </Card>
    )
  }

  return (
    <PageContainer>
      <TopBar title="翻阅藏品" onBack={() => onNavigate(ROUTES.HOME)} />

      <div className="px-4 py-4">
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 翻页指示器 */}
        <div className="flex items-center justify-center gap-1.5 my-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > page ? 1 : -1); setPage(i) }}
              className={`transition-all duration-200 rounded-full ${
                i === page ? 'w-6 h-2 bg-[#8B4513]' : 'w-2 h-2 bg-[#E8E8E8] hover:bg-[#D0D0D0]'
              }`}
            />
          ))}
        </div>

        {/* 翻页按钮 */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={goPrev} disabled={page === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            上一页
          </Button>
          <span className="text-[13px] text-[#999]">{page + 1} / {totalPages}</span>
          <Button variant="ghost" onClick={goNext} disabled={page === totalPages - 1}>
            下一页
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </Button>
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={() => onNavigate(ROUTES.SHARE)}>
          送出去
        </Button>
      </div>
    </PageContainer>
  )
}
