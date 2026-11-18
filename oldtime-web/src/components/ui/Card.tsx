import { cn } from '../../lib/utils'
import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  elevated?: boolean
  onClick?: () => void
}

export function Card({ children, className, style, elevated = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[12px] overflow-hidden',
        elevated
          ? 'border border-[#F0F0F0] shadow-sm'
          : 'border border-[#E8E8E8]',
        onClick && 'cursor-pointer transition-all duration-150 hover:border-[#D0D0D0] active:scale-[0.99]',
        className
      )}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <h3 className="text-[16px] font-medium text-[#1A1A1A]">{title}</h3>
        {subtitle && <p className="text-[13px] text-[#999] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-4 pb-4', className)}>{children}</div>
}
