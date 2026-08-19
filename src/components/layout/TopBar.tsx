interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="relative flex h-14 items-center border-b border-slate-200 bg-warm-white px-6 dark:border-slate-700 dark:bg-slate-800">
      {/* macOS 红绿灯区域 */}
      <div className="w-16 shrink-0" />
      {/* 标题：绝对居中于整个 header */}
      <h1 className="absolute inset-x-0 text-center text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h1>
    </header>
  )
}
