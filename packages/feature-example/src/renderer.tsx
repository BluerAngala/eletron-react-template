import type { RendererFeatureRegistration } from '@electron-template/feature-contract'
import { Puzzle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import type { ExampleBridge } from './renderer/bridge'

function ExamplePage() {
  const { t } = useTranslation('example')
  const [result, setResult] = useState('')

  const ping = async () => {
    // window.exampleBridge 由本功能的 preload 暴露；功能未启用时不存在
    if (!window.exampleBridge) {
      setResult(t('bridgeMissing'))
      return
    }
    const data: Awaited<ReturnType<ExampleBridge['ping']>> = await window.exampleBridge.ping()
    setResult(t('pongAt', { time: new Date(data.timestamp).toLocaleTimeString() }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 bg-white p-8 text-slate-900 dark:bg-black dark:text-white">
      <Puzzle className="size-8 opacity-70" />
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <p className="max-w-md text-center text-sm text-slate-500 dark:text-white/70">
        {t('description')}
      </p>
      <button
        type="button"
        onClick={() => void ping()}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        {t('pingButton')}
      </button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  )
}

export function createRendererFeature(): RendererFeatureRegistration {
  return {
    routes: [{ path: 'example', element: <ExamplePage /> }],
    navigation: [{ to: '/example', icon: Puzzle, key: 'nav.example', ns: 'example' }],
    fullBleedPaths: [],
    locales: {
      'zh-CN': { example: zhCN },
      'en-US': { example: enUS },
    },
  }
}
