import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUSAI from '@/locales/en-US/ai.json'
import enUSCommon from '@/locales/en-US/common.json'
import enUSErrors from '@/locales/en-US/errors.json'
import enUSHome from '@/locales/en-US/home.json'
import enUSLogs from '@/locales/en-US/logs.json'
import zhCNAI from '@/locales/zh-CN/ai.json'
import zhCNCommon from '@/locales/zh-CN/common.json'
import zhCNErrors from '@/locales/zh-CN/errors.json'
import zhCNHome from '@/locales/zh-CN/home.json'
import zhCNLogs from '@/locales/zh-CN/logs.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

const LANGUAGE_KEY = 'app-language'

function isSupported(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code)
}

function detectLanguage(): LanguageCode {
  // 1. 用户持久化偏好
  const stored = localStorage.getItem(LANGUAGE_KEY)
  if (stored && isSupported(stored)) return stored
  // 2. 跟随系统语言（取最接近的支持语言）
  const nav = (navigator.language ?? 'en-US').toLowerCase()
  const matched = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().startsWith(nav.slice(0, 2)))
  return matched ? matched.code : 'en-US'
}

export function getStoredLanguage(): LanguageCode | null {
  const stored = localStorage.getItem(LANGUAGE_KEY)
  return stored && isSupported(stored) ? stored : null
}

export function setLanguage(lang: LanguageCode): void {
  localStorage.setItem(LANGUAGE_KEY, lang)
  void i18n.changeLanguage(lang)
}

void i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': {
      common: zhCNCommon,
      home: zhCNHome,
      logs: zhCNLogs,
      ai: zhCNAI,
      errors: zhCNErrors,
    },
    'en-US': {
      common: enUSCommon,
      home: enUSHome,
      logs: enUSLogs,
      ai: enUSAI,
      errors: enUSErrors,
    },
  },
  lng: detectLanguage(),
  fallbackLng: 'zh-CN',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  // 防 FOUC：初始化完成前挂起 React 渲染
  react: {
    useSuspense: false,
  },
})

export default i18n
