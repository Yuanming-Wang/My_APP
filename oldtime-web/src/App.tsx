import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { useStore } from './hooks/useStore'
import { Toast } from './components/ui/Toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ROUTES } from './lib/constants'

// 懒加载页面
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })))
const CreatePage = lazy(() => import('./components/pages/CreatePage').then(m => ({ default: m.CreatePage })))
const StoriesPage = lazy(() => import('./components/pages/StoriesPage').then(m => ({ default: m.StoriesPage })))
const GeneratingPage = lazy(() => import('./components/pages/GeneratingPage').then(m => ({ default: m.GeneratingPage })))
const ReaderPage = lazy(() => import('./components/pages/ReaderPage').then(m => ({ default: m.ReaderPage })))
const SharePage = lazy(() => import('./components/pages/SharePage').then(m => ({ default: m.SharePage })))
const CollaboratePage = lazy(() => import('./components/pages/CollaboratePage').then(m => ({ default: m.CollaboratePage })))

type View = typeof ROUTES[keyof typeof ROUTES] | 'collaborate'

function getInitialView(): View {
  const hash = window.location.hash
  if (hash.startsWith('#/help/')) return 'collaborate'
  if (hash.startsWith('#/share/')) return ROUTES.READER
  return ROUTES.HOME
}

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

export default function App() {
  const [view, setView] = useState<View>(getInitialView)
  const toast = useStore((s) => s.toast)
  const loadBooks = useStore((s) => s.loadBooks)
  const openBookBySlug = useStore((s) => s.openBookBySlug)

  useEffect(() => {
    const shareSlug = window.location.hash.match(/^#\/share\/(.+)$/)?.[1]
    if (!shareSlug) return

    void loadBooks().then(() => {
      if (!openBookBySlug(decodeURIComponent(shareSlug))) setView(ROUTES.HOME)
    })
  }, [loadBooks, openBookBySlug])

  const navigate = useCallback((v: string) => {
    setView(v as View)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // 协作页面
  if (view === 'collaborate') {
    return (
      <ErrorBoundary>
        <main className="max-w-[480px] mx-auto min-h-screen bg-[#F8F5EE]">
          <Suspense fallback={<PageLoader />}>
            <CollaboratePage />
          </Suspense>
        </main>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <main className="max-w-[480px] mx-auto min-h-screen bg-[#F8F5EE]">
        <Suspense fallback={<PageLoader />}>
          {view === ROUTES.HOME && <HomePage onNavigate={navigate} />}
          {view === ROUTES.CREATE && <CreatePage onNavigate={navigate} />}
          {view === ROUTES.STORIES && <StoriesPage onNavigate={navigate} />}
          {view === ROUTES.GENERATING && <GeneratingPage onNavigate={navigate} />}
          {view === ROUTES.READER && <ReaderPage onNavigate={navigate} />}
          {view === ROUTES.SHARE && <SharePage onNavigate={navigate} />}
        </Suspense>
        {toast && <Toast message={toast} onClose={() => useStore.setState({ toast: '' })} />}
      </main>
    </ErrorBoundary>
  )
}
