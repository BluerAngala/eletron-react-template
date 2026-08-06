import { useEffect } from 'react'
import { Sun, Moon, FolderGit, ArrowUpRight, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createLogger } from '@/lib/logger'

const log = createLogger('home')

function getGreetingKey(): { key: string; icon: typeof Sun } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { key: 'greeting.morning', icon: Sun }
  if (hour >= 12 && hour < 18) return { key: 'greeting.afternoon', icon: Sun }
  return { key: 'greeting.evening', icon: Moon }
}

const techStack: { name: string; version: string }[] = [
  { name: 'Electron', version: '42' },
  { name: 'React', version: '19' },
  { name: 'TypeScript', version: '6' },
  { name: 'Vite', version: '8' },
  { name: 'TailwindCSS', version: 'v4' },
  { name: 'pnpm', version: '' },
]

export function Home() {
  const { t } = useTranslation('home')
  const { key: greetingKey, icon: GreetingIcon } = getGreetingKey()
  const greeting = t(greetingKey)

  useEffect(() => {
    log.info('page-view', { greeting, ts: Date.now() })
  }, [greeting])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      {/* 欢迎 Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 px-8 py-10 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 md:px-16 md:py-14">
        {/* 背景光晕 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20" />
          <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="relative space-y-5">
          <h1 className="animate-rise mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-4 text-4xl font-semibold tracking-tight text-slate-900 [animation-delay:80ms] dark:text-slate-100 md:text-5xl">
            <span className="inline-flex items-center gap-3">
              <GreetingIcon className="h-8 w-8 md:h-10 md:w-10" />
              {greeting}
            </span>
            <span>{t('welcomeBack')}</span>
          </h1>

          <p className="animate-rise mx-auto max-w-xl text-base leading-7 text-slate-600 [animation-delay:160ms] dark:text-slate-400 md:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* 项目信息 */}
      <section className="animate-rise space-y-6 [animation-delay:240ms]">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="min-w-0 space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('project.name')}
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {t('project.description')}
            </p>
          </div>
          <a
            href="https://github.com/BluerAngala/eletron-react-template"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600"
          >
            <FolderGit className="h-4 w-4" />
            {t('project.github')}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* 技术栈 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            <Layers className="h-4 w-4" />
            {t('techStack.title')}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {techStack.map(({ name, version }) => (
              <div
                key={name}
                className="flex items-baseline justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-700/60 dark:hover:border-cyan-600"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {name}
                </span>
                {version && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{version}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
