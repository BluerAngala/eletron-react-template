import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  const themes = [
    {
      value: 'system' as const,
      icon: Monitor,
      label: t('settings.theme.system'),
      desc: t('settings.theme.system.desc'),
    },
    {
      value: 'light' as const,
      icon: Sun,
      label: t('settings.theme.light'),
      desc: t('settings.theme.light.desc'),
    },
    {
      value: 'dark' as const,
      icon: Moon,
      label: t('settings.theme.dark'),
      desc: t('settings.theme.dark.desc'),
    },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {t('settings.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-white">{t('settings.desc')}</p>
      </div>

      {/* 主题设置 */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-white">
          {t('settings.theme.title')}
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
                      : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {label}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-white">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
