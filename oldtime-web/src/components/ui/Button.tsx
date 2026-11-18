import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variants = {
  primary: 'bg-[#8B4513] text-white hover:bg-[#A0522D] active:bg-[#6C2F00]',
  secondary: 'bg-white text-[#8B4513] border border-[#8B4513] hover:bg-[#FFF8F0]',
  ghost: 'bg-transparent text-[#666] hover:bg-[#F5F5F5]',
  danger: 'bg-[#FF4D4F] text-white hover:bg-[#FF7875]',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-12 px-6 text-[16px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[6px] font-medium',
        'transition-all duration-150 ease-out',
        'active:scale-[0.97] active:duration-100',
        'disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100',
        'select-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
