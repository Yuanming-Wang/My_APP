interface NavItem {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}

interface BottomNavProps {
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E8E8]">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-[56px] pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors active:scale-95 ${
              item.active ? 'text-[#8B4513]' : 'text-[#999]'
            }`}
          >
            <span className="w-6 h-6">{item.icon}</span>
            <span className="text-[11px]">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
