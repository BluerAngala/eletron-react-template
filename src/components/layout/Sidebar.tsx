import { NavLink } from 'react-router-dom'
import {
  Home,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Globe,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const navItems = [
    { to: '/', icon: Home, label: t('sidebar.home') },
    { to: '/settings', icon: Settings, label: t('sidebar.settings') },
    { to: '/about', icon: Info, label: t('sidebar.about') },
  ]

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: t('theme.light') },
    { value: 'dark' as const, icon: Moon, label: t('theme.dark') },
    { value: 'system' as const, icon: Monitor, label: t('theme.system') },
  ]

  const languageOptions = [
    { value: 'zh-CN' as const, label: t('language.zh-CN') },
    { value: 'en-US' as const, label: t('language.en-US') },
  ]

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-warm-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-800 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b border-slate-200 px-4 dark:border-slate-700">
        {!collapsed && (
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Template</span>
        )}
        {collapsed && <span className="text-lg font-bold text-cyan-600">T</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Theme and Language Settings */}
      <div className="border-t border-slate-200 p-2 dark:border-slate-700">
        {/* Theme Selection */}
        <div className="mb-2">
          {!collapsed && (
            <div className="py-1 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('theme.select')}
            </div>
          )}
          <div className={`flex gap-1 ${collapsed ? 'flex-col' : 'flex-row'}`}>
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                  theme === value
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                } ${collapsed ? 'w-full' : 'flex-1'}`}
                title={label}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="ml-1 text-xs">{label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-2">
          {!collapsed && (
            <div className="py-1 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('language.select')}
            </div>
          )}
          <div className={`flex gap-1 ${collapsed ? 'flex-col' : 'flex-row'}`}>
            {languageOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                  language === value
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                } ${collapsed ? 'w-full' : 'flex-1'}`}
                title={label}
              >
                {collapsed ? (
                  <span className="text-xs font-medium">{value === 'zh-CN' ? '中' : 'EN'}</span>
                ) : (
                  <span className="text-xs">{label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2 text-sm">{t('sidebar.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
