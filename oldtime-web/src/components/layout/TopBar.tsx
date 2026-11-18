interface TopBarProps {
  title: string
  onBack?: () => void
  right?: React.ReactNode
  icon?: React.ReactNode
  transparent?: boolean
}

export function TopBar({ title, onBack, right, icon, transparent }: TopBarProps) {
  return (
    <header
      className={`sticky top-0 z-50 px-4 h-[48px] flex items-center justify-between ${
        transparent ? '' : 'bg-white border-b border-[#E5DCD1]'
      }`}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-[#F8F5EE] transition-colors active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2318" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {icon}
        <h1 className="text-[18px] font-semibold text-[#2D2318] font-serif">{title}</h1>
      </div>
      {right || <div className="w-10" />}
    </header>
  )
}
