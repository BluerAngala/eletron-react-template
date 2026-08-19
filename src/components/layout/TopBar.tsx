interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="relative flex h-14 items-center justify-between border-b border-slate-200 bg-warm-white px-6 dark:border-slate-700 dark:bg-slate-800">
      {/* macOS 红绿灯区域 */}
      <div className="h-6 w-16" />
      {/* 居中标题 */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      {/* 右侧占位，保持 flex 对称 */}
      <div className="w-16" />
    </header>
  )
}
