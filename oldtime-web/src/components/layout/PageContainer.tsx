import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  noBottomPadding?: boolean
}

export function PageContainer({ children, className, noBottomPadding }: PageContainerProps) {
  return (
    <div
      className={`min-h-screen bg-[#F5F5F5] ${!noBottomPadding ? 'pb-[80px]' : ''} ${className || ''}`}
    >
      {children}
    </div>
  )
}
