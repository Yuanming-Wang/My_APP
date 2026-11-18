import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const roundedMap = {
  sm: 'rounded-[6px]',
  md: 'rounded-[12px]',
  lg: 'rounded-[16px]',
  full: 'rounded-full',
}

export function Skeleton({ className, width, height, rounded = 'sm' }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', roundedMap[rounded], className)}
      style={{ width, height }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-[#E8E8E8] rounded-[12px] overflow-hidden bg-white">
      <Skeleton height={200} />
      <div className="p-4 space-y-2">
        <Skeleton height={16} width="60%" />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
  )
}

export function BookCardSkeleton() {
  return (
    <div className="w-[180px] h-[264px] flex-shrink-0 border border-[#E8E8E8] rounded-[4px_12px_12px_4px] overflow-hidden bg-white">
      <div className="w-[28px] h-full float-left bg-gradient-to-r from-[#3d1a00] to-[#7a3b12]" />
      <Skeleton className="flex-1" height="100%" />
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
