interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-slate-200 bg-white px-6 dark:border-white/10 dark:bg-black">
      {/* macOS 红绿灯区域 */}
      <div className="flex h-6 w-16" /> {/* macOS 红绿灯留白 */}
      <h1 className="justify-self-center text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h1>
      {/* 右侧占位保持标题居中 */}
      <div />
    </header>
  )
}
