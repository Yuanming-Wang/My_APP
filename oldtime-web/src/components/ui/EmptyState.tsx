import { motion } from 'framer-motion'
import { Button } from './Button'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 图标 */}
      <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-5">
        <span className="text-4xl">{icon}</span>
      </div>

      {/* 文案 */}
      <h3 className="text-[16px] font-medium text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-[14px] text-[#999] mb-6 max-w-[280px] leading-relaxed">{description}</p>

      {/* 操作按钮 */}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
