import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50" style={{ animation: 'fadeIn 200ms ease' }} />

      {/* 内容 */}
      <div
        className="relative w-full max-w-[480px] bg-white rounded-t-[16px] max-h-[80vh] overflow-auto"
        style={{ animation: 'slideUp 200ms ease' }}
      >
        {title && (
          <div className="sticky top-0 bg-white border-b border-[#E8E8E8] px-4 py-3 flex items-center justify-between">
            <h3 className="text-[16px] font-medium text-[#1A1A1A]">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
