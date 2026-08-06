import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const pageTitleKeys: Record<string, string> = {
  '/': 'pages.home',
  '/logs': 'pages.logs',
}

const SIDEBAR_KEY = 'sidebar-collapsed'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  })

  const { t } = useTranslation()
  const location = useLocation()
  const title = t(pageTitleKeys[location.pathname] ?? 'pages.unknown')
  // AI 对话页全屏沉浸（无内边距），其余页面保留 p-6
  const isFullBleed = location.pathname === '/ai'

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />

        <main className={`flex-1 overflow-auto ${isFullBleed ? '' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'dark:bg-[#1f1f1f] dark:text-white',
        }}
      />
    </div>
  )
}
