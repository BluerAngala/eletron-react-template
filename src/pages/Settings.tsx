import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LogViewer } from '@/components/log-viewer'

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t('settings.title')}</h2>
        <p className="mt-1 text-sm text-foreground-muted">{t('settings.desc')}</p>
      </div>

      {/* 主题设置 */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground-muted">
          {t('settings.theme.title')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                theme === value
                  ? 'border-accent bg-accent-subtle'
                  : 'border-border-default bg-surface hover:border-foreground-muted'
              }`}
            >
              <Icon
                className={`h-8 w-8 ${theme === value ? 'text-accent' : 'text-foreground-muted'}`}
              />
              <div className="text-center">
                <div
                  className={`text-sm font-medium ${
                    theme === value ? 'text-accent' : 'text-foreground-secondary'
                  }`}
                >
                  {label}
                </div>
                <div className="mt-1 text-xs text-foreground-muted">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 日志查看 */}
      <LogViewer />
    </div>
  )
}
