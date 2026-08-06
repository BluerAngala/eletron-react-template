import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Languages,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { setLanguage, SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/', icon: Home, key: 'nav.home' },
  { to: '/logs', icon: ScrollText, key: 'nav.logs' },
]

const themeOptions: { value: Theme; icon: typeof Sun; key: string }[] = [
  { value: 'light', icon: Sun, key: 'theme.light' },
  { value: 'dark', icon: Moon, key: 'theme.dark' },
  { value: 'system', icon: Monitor, key: 'theme.system' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()

  // 当前语言与支持列表匹配（可扩展，自动匹配最接近的已支持语言）
  const currentLang = SUPPORTED_LANGUAGES.some((l) => l.code === i18n.language)
    ? (i18n.language as LanguageCode)
    : SUPPORTED_LANGUAGES[0].code

  const currentLabel = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.label ?? ''

  // 语言下拉：点击外部 / Escape 关闭
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!langOpen) return
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [langOpen])

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-800 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate-200 px-4 dark:border-slate-700">
        {!collapsed && (
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Template</span>
        )}
        {collapsed && <span className="mx-auto text-lg font-bold text-cyan-600">T</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ to, icon: Icon, key }) => {
          const label = t(key)
          return (
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
          )
        })}
      </nav>

      {/* 底部区域：语言 + 主题 + 折叠 */}
      <div className="space-y-1 border-t border-slate-200 p-2 dark:border-slate-700">
        {/* 语言切换 */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            title={t('language.title')}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
              langOpen
                ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
            } ${collapsed ? '' : 'border border-slate-200 dark:border-slate-700'}`}
          >
            <Languages className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>{currentLabel}</span>}
            {!collapsed && (
              <ChevronDown
                className={`h-3 w-3 shrink-0 transition-transform ${langOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {/* 下拉菜单：向上展开，避免超出窗口 */}
          {langOpen && (
            <div className="absolute bottom-full right-0 z-50 mb-1.5 min-w-[9rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {SUPPORTED_LANGUAGES.map(({ code, label }) => {
                const active = code === currentLang
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code as LanguageCode)
                      setLangOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{label}</span>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 主题切换 */}
        <div className={collapsed ? 'flex flex-col items-center gap-1' : 'grid grid-cols-3 gap-1'}>
          {themeOptions.map(({ value, icon: Icon, key }) => {
            const active = theme === value
            const label = t(key)
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={collapsed ? label : undefined}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </div>

        {/* 折叠切换 */}
        <button
          onClick={onToggle}
          title={collapsed ? t('nav.expandMenu') : undefined}
          className={`flex w-full items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 ${
            collapsed ? '' : 'gap-2'
          }`}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span className="text-sm font-medium">{t('nav.collapseMenu')}</span>}
        </button>
      </div>
    </aside>
  )
}
