import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../hooks/useStore'
import { PageContainer } from '../layout/PageContainer'
import { TopBar } from '../layout/TopBar'
import { Card } from '../ui/Card'
import { ROUTES, TEXTS } from '../../lib/constants'

// 沙漏图标组件
function HourglassIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none">
      <path d="M4 4L36 4L24 20L16 20Z" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M4 44L36 44L24 28L16 28Z" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round"/>
      <line x1="16" y1="20" x2="24" y2="20" stroke="#D4AF37" strokeWidth="1.5"/>
      <line x1="16" y1="28" x2="24" y2="28" stroke="#D4AF37" strokeWidth="1.5"/>
      <line x1="4" y1="3" x2="36" y2="3" stroke="#D4AF37" strokeWidth="2"/>
      <line x1="4" y1="45" x2="36" y2="45" stroke="#D4AF37" strokeWidth="2"/>
    </svg>
  )
}

// 登录页
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  const sendCode = () => {
    if (phone.length !== 11) return
    setSent(true)
    setCountdown(60)
    const t = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  const login = async () => {
    if (loading) return
    if (code !== '123456') return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onLogin()
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center px-6">
      <div className="w-full max-w-[360px] text-center">
        {/* 沙漏图标 */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3D1A00] to-[#1A0E08] flex items-center justify-center border border-[rgba(212,175,55,0.3)]">
            <HourglassIcon size={36} />
          </div>
          <h1 className="text-[28px] font-bold text-[#2D2318] font-serif tracking-wider">OldTime</h1>
          <p className="text-[14px] text-[#A89887] mt-1 font-serif">旧时光 · 新珍藏</p>
        </div>

        {/* 表单 */}
        <div className="text-left">
          <label className="text-[13px] text-[#5A4D3F] mb-2 block font-serif">手机号</label>
          <div className="flex items-center bg-white border border-[#E5DCD1] rounded-2xl px-4 h-14">
            <span className="text-[16px] text-[#2D2318] font-serif font-medium">+86</span>
            <div className="w-px h-6 bg-[#E5DCD1] mx-4" />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="flex-1 text-[16px] text-[#2D2318] outline-none font-serif"
              maxLength={11}
            />
          </div>

          {sent && (
            <div className="mt-5">
              <label className="text-[13px] text-[#5A4D3F] mb-2 block font-serif">验证码</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="请输入6位验证码"
                className="w-full bg-white border border-[#E5DCD1] rounded-2xl px-4 h-14 text-[20px] text-[#2D2318] outline-none font-serif tracking-widest text-center"
                maxLength={6}
              />
              <button onClick={sendCode} disabled={countdown > 0} className="text-[13px] text-[#8B4513] mt-2 font-serif">
                {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
              </button>
            </div>
          )}

          <button
            onClick={sent ? login : sendCode}
            disabled={sent ? code.length !== 6 : phone.length !== 11}
            className="w-full h-14 bg-[#8B4513] text-white rounded-2xl text-[16px] font-semibold font-serif mt-6 disabled:opacity-40 active:scale-[0.97] transition-transform"
          >
            {loading ? '登录中...' : sent ? '登录' : '发送验证码'}
          </button>
        </div>

        <p className="text-[11px] text-[#A89887] mt-8 font-serif">登录即表示同意《用户协议》和《隐私政策》</p>
      </div>
    </div>
  )
}

export function HomePage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const books = useStore((s) => s.books)
  const loadBooks = useStore((s) => s.loadBooks)
  const deleteBook = useStore((s) => s.deleteBook)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleDelete = () => {
    if (deleteId) {
      deleteBook(deleteId)
      setDeleteId(null)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 17 ? '下午好' : '晚上好'

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  return (
    <PageContainer>
      <TopBar
        title="OldTime"
        icon={<HourglassIcon size={24} />}
        right={
          <button
            onClick={() => onNavigate('profile')}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D4AF37] flex items-center justify-center overflow-hidden"
          >
            <span className="text-white text-sm font-medium font-serif">我</span>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* 问候 */}
        <p className="text-[22px] font-bold text-[#2D2318] font-serif">{greeting}，今天有藏品要入馆吗？</p>

        {/* 制作入口 */}
        <Card
          className="p-5 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate(ROUTES.CREATE)}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F8F5EE] flex items-center justify-center border border-[#E5DCD1]">
              <span className="text-2xl">📷</span>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-semibold text-[#2D2318] font-serif">开始制作回忆</p>
              <p className="text-[13px] text-[#A89887] mt-1 font-serif">挑选照片，讲述故事，入藏成册</p>
            </div>
            <span className="text-2xl text-[#A89887]">›</span>
          </div>
        </Card>

        {/* 收藏馆 */}
        <div>
          <h2 className="text-[18px] font-semibold text-[#2D2318] mb-3 font-serif">我的收藏馆</h2>
          {books.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5DCD1]">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F8F5EE] flex items-center justify-center border border-[#E5DCD1]">
                <span className="text-4xl">🏛️</span>
              </div>
              <p className="text-[16px] font-semibold text-[#2D2318] font-serif">你的收藏馆空空如也</p>
              <p className="text-[14px] text-[#A89887] mt-2 font-serif">点击上方按钮，制作你的第一本纪念册</p>
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      useStore.getState().openBook(book.id)
                      onNavigate(ROUTES.READER)
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="w-[80px] h-[110px] flex-shrink-0 rounded-lg overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-gradient-to-r from-[#3d1a00] to-[#7a3b12] z-10" />
                        <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#A89887] mb-1 font-serif tracking-wider">{book.archiveNo}</p>
                        <h3 className="text-[16px] font-semibold text-[#2D2318] mb-1 line-clamp-1 font-serif">{book.title}</h3>
                        <p className="text-[13px] text-[#5A4D3F] mb-2 line-clamp-1 font-serif">{book.subtitle}</p>
                        <div className="flex items-center gap-2 text-[12px] text-[#A89887] font-serif">
                          <span>{book.pages.length} 页</span>
                          <span>·</span>
                          <span>{book.ownerName}</span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteId(book.id) }}
                        className="self-start p-2 hover:bg-gray-100 rounded-full"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E5DCD1]">
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={() => onNavigate(ROUTES.CREATE)}
            className="w-full h-14 bg-[#8B4513] text-white rounded-2xl text-[16px] font-semibold font-serif border border-[rgba(212,175,55,0.3)] active:scale-[0.97] transition-transform"
          >
            开始制作
          </button>
        </div>
      </div>

      {/* 删除确认 */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 mx-4 max-w-[300px]"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-[16px] font-semibold text-[#2D2318] mb-2 font-serif">删除藏品</h3>
              <p className="text-[14px] text-[#5A4D3F] mb-4 font-serif">{TEXTS.DELETE_BOOK_CONFIRM}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-12 bg-white border border-[#E5DCD1] rounded-2xl text-[14px] font-serif">取消</button>
                <button onClick={handleDelete} className="flex-1 h-12 bg-[#FF4D4F] text-white rounded-2xl text-[14px] font-serif">删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
