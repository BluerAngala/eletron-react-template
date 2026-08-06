import { NavLink } from 'react-router-dom'
import { Home, ScrollText, ChevronLeft, ChevronRight, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/contexts/ThemeContext'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/logs', icon: ScrollText, label: '日志' },
]

const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: '浅色' },
  { value: 'dark', icon: Moon, label: '暗色' },
  { value: 'system', icon: Monitor, label: '系统' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { theme, setTheme } = useTheme()

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

      {/* 底部区域：主题切换 + 折叠 */}
      <div className="space-y-1 border-t border-slate-200 p-2 dark:border-slate-700">
        {/* 主题切换 */}
        <div className={collapsed ? 'flex flex-col items-center gap-1' : 'grid grid-cols-3 gap-1'}>
          {themeOptions.map(({ value, icon: Icon, label }) => {
            const active = theme === value
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
          title={collapsed ? '展开菜单' : undefined}
          className={`flex w-full items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 ${
            collapsed ? '' : 'gap-2'
          }`}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span className="text-sm font-medium">折叠菜单</span>}
        </button>
      </div>
    </aside>
  )
}
