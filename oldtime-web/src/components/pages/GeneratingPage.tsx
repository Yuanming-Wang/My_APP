import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../hooks/useStore'
import { ErrorState } from '../ui/ErrorState'
import { TEXTS, ROUTES, GENERATING_PHASE_DURATION } from '../../lib/constants'

const phases = [
  { label: TEXTS.COLLECTING, icon: '📷' },
  { label: TEXTS.POLISHING, icon: '✍️' },
  { label: TEXTS.GENERATING, icon: '🎨' },
  { label: TEXTS.COMPLETE, icon: '✨' },
]

export function GeneratingPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const draftMedia = useStore((s) => s.draftMedia)
  const generate = useStore((s) => s.generate)
  const [phase, setPhase] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 1-3
    for (let i = 1; i <= 3; i++) {
      timers.push(setTimeout(() => setPhase(i), i * GENERATING_PHASE_DURATION))
    }

    // 生成并跳转
    timers.push(setTimeout(() => {
      try {
        if (draftMedia.length === 0) {
          setError('没有选择文件，请返回重试。')
          return
        }
        void generate().then((book) => {
          if (book) onNavigate(ROUTES.READER)
          else setError(TEXTS.GENERATE_FAILED)
        })
      } catch (err) {
        console.error('生成失败:', err)
        setError(TEXTS.GENERATE_FAILED)
      }
    }, 3 * GENERATING_PHASE_DURATION + 500))

    return () => timers.forEach(clearTimeout)
  }, [draftMedia.length, generate, onNavigate])

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <ErrorState
          title="生成失败"
          message={error}
          onRetry={() => onNavigate(ROUTES.HOME)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-6">
      {/* 书页动画 */}
      <motion.div
        className="relative w-[140px] h-[180px] mb-10"
        style={{ perspective: 800 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full h-full rounded-[4px_12px_12px_4px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #3d1a00, #6C2F00)',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
          animate={phase >= 2 ? { rotateY: [-5, 5, -5] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[#D4AF37] text-2xl font-serif">旧时光</span>
        </motion.div>
      </motion.div>

      {/* 阶段指示 */}
      <div className="space-y-3 mb-8">
        {phases.map((p, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: phase >= i ? 1 : 0.3,
              x: phase >= i ? 0 : -10,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg">{p.icon}</span>
            <span className={`text-[15px] ${phase === i ? 'text-white' : 'text-white/50'}`}>
              {p.label}
            </span>
            {phase > i && (
              <motion.span
                className="text-[#D4AF37] text-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* 进度条 */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#8B4513] to-[#D4AF37] rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(phase + 1) * 25}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}
