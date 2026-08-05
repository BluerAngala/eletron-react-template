import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const themes = [
  { value: 'system' as const, icon: Monitor, label: '跟随系统', desc: '自动匹配操作系统主题' },
  { value: 'light' as const, icon: Sun, label: '浅色模式', desc: '明亮清爽的界面风格' },
  { value: 'dark' as const, icon: Moon, label: '深色模式', desc: '护眼舒适的暗色风格' },
]

export function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">设置</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">管理应用外观和偏好</p>
      </div>

      {/* 主题设置 */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          外观主题
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                theme === value
                  ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-900/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
              }`}
            >
              <Icon
                className={`h-8 w-8 ${
                  theme === value
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <div className="text-center">
                <div
                  className={`text-sm font-medium ${
                    theme === value
                      ? 'text-cyan-700 dark:text-cyan-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {label}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
