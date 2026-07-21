import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface TopBarProps {
  title: string
}

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

const themeLabels = {
  system: '跟随系统',
  light: '浅色模式',
  dark: '深色模式',
}

export function TopBar({ title }: TopBarProps) {
  const { theme, cycleTheme } = useTheme()
  const Icon = themeIcons[theme]

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800">
      {/* macOS 红绿灯区域 */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-16" /> {/* macOS 红绿灯留白 */}
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      {/* 右侧操作 */}
      <div className="flex items-center gap-2">
        <button
          onClick={cycleTheme}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          title={themeLabels[theme]}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{themeLabels[theme]}</span>
        </button>
      </div>
    </header>
  )
}
