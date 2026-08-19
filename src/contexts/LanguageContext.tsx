import { createContext, useContext, useState, useCallback, useEffect } from 'react'

type Language = 'zh-CN' | 'en-US'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = 'language'

const translations: Record<Language, Record<string, string>> = {
  'zh-CN': {
    // 侧边栏
    'sidebar.home': '首页',
    'sidebar.settings': '设置',
    'sidebar.about': '关于',
    'sidebar.collapse': '折叠',
    'sidebar.expand': '展开',

    // 主题
    'theme.light': '浅色',
    'theme.dark': '暗色',
    'theme.system': '系统',
    'theme.select': '选择主题',

    // 语言
    'language.zh-CN': '中文',
    'language.en-US': 'English',
    'language.select': '选择语言',

    // 页面标题
    'page.home': '首页',
    'page.settings': '设置',
    'page.about': '关于',

    // 通用
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
  },
  'en-US': {
    // Sidebar
    'sidebar.home': 'Home',
    'sidebar.settings': 'Settings',
    'sidebar.about': 'About',
    'sidebar.collapse': 'Collapse',
    'sidebar.expand': 'Expand',

    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.select': 'Choose Theme',

    // Language
    'language.zh-CN': '中文',
    'language.en-US': 'English',
    'language.select': 'Choose Language',

    // Page titles
    'page.home': 'Home',
    'page.settings': 'Settings',
    'page.about': 'About',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh-CN' || stored === 'en-US') return stored
    return 'zh-CN'
  })

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem(STORAGE_KEY, newLanguage)
    document.documentElement.lang = newLanguage
  }, [])

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key
    },
    [language],
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return <LanguageContext value={{ language, setLanguage, t }}>{children}</LanguageContext>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
