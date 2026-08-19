interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-warm-white px-6 dark:border-slate-700 dark:bg-slate-800">
      {/* macOS 红绿灯区域 */}
      <div className="w-16 shrink-0" />
      {/* 标题铺满 */}
      <h1 className="flex-1 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h1>
    </header>
  )
}
