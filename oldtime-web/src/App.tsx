import { useCallback, useEffect, lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useStore } from './hooks/useStore'
import { Toast } from './components/ui/Toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ROUTES, ROUTE_PATHS } from './lib/constants'
import { booksApi } from './lib/api'
import { mapBook } from './lib/mappers'

// 懒加载页面
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })))
const CreatePage = lazy(() => import('./components/pages/CreatePage').then(m => ({ default: m.CreatePage })))
const StoriesPage = lazy(() => import('./components/pages/StoriesPage').then(m => ({ default: m.StoriesPage })))
const GeneratingPage = lazy(() => import('./components/pages/GeneratingPage').then(m => ({ default: m.GeneratingPage })))
const ReaderPage = lazy(() => import('./components/pages/ReaderPage').then(m => ({ default: m.ReaderPage })))
const SharePage = lazy(() => import('./components/pages/SharePage').then(m => ({ default: m.SharePage })))
const CollaboratePage = lazy(() => import('./components/pages/CollaboratePage').then(m => ({ default: m.CollaboratePage })))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[14px] text-[#A89887] font-serif">加载中...</p>
      </div>
    </div>
  )
}

function BooksSync() {
  const setBooks = useStore((s) => s.setBooks)
  const loadBooks = useStore((s) => s.loadBooks)
  const { data, isError } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await booksApi.list(1, 50)
      return res.data.map(mapBook)
    },
  })

  useEffect(() => {
    if (data) setBooks(data)
  }, [data, setBooks])

  useEffect(() => {
    if (isError) void loadBooks()
  }, [isError, loadBooks])

  return null
}

function SharedReaderRoute({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { slug } = useParams()
  const activeBook = useStore((s) => s.getActiveBook())
  const setSharedBook = useStore((s) => s.setSharedBook)
  const showToast = useStore((s) => s.showToast)
  const { data, isPending, isError } = useQuery({
    queryKey: ['shared-book', slug],
    queryFn: async () => {
      const res = await booksApi.getBySlug(slug || '')
      return mapBook(res.data)
    },
    enabled: Boolean(slug),
    retry: false,
  })

  useEffect(() => {
    if (data) setSharedBook(data)
  }, [data, setSharedBook])

  useEffect(() => {
    if (isError) {
      showToast('分享链接已失效')
      onNavigate(ROUTES.HOME)
    }
  }, [isError, showToast, onNavigate])

  if (isPending || isError || !activeBook) return <PageLoader />

  return <ReaderPage onNavigate={onNavigate} />
}

export default function App() {
  const navigate = useNavigate()
  const toast = useStore((s) => s.toast)

  const go = useCallback((v: string) => {
    navigate(ROUTE_PATHS[v] || ROUTE_PATHS[ROUTES.HOME])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  return (
    <ErrorBoundary>
      <main className="max-w-[480px] mx-auto min-h-screen bg-[#F8F5EE]">
        <BooksSync />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTE_PATHS[ROUTES.HOME]} replace />} />
            <Route path={ROUTE_PATHS[ROUTES.HOME]} element={<HomePage onNavigate={go} />} />
            <Route path={ROUTE_PATHS[ROUTES.CREATE]} element={<CreatePage onNavigate={go} />} />
            <Route path={ROUTE_PATHS[ROUTES.STORIES]} element={<StoriesPage onNavigate={go} />} />
            <Route path={ROUTE_PATHS[ROUTES.GENERATING]} element={<GeneratingPage onNavigate={go} />} />
            <Route path={ROUTE_PATHS[ROUTES.READER]} element={<ReaderPage onNavigate={go} />} />
            <Route path={ROUTE_PATHS[ROUTES.SHARE]} element={<SharePage onNavigate={go} />} />
            <Route path="/share/:slug" element={<SharedReaderRoute onNavigate={go} />} />
            <Route path="/help/:draftId" element={<CollaboratePage />} />
            <Route path="*" element={<Navigate to={ROUTE_PATHS[ROUTES.HOME]} replace />} />
          </Routes>
        </Suspense>
        {toast && <Toast message={toast} onClose={() => useStore.setState({ toast: '' })} />}
      </main>
    </ErrorBoundary>
  )
}
