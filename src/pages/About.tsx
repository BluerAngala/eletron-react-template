import { useLanguage } from '@/contexts/LanguageContext'

export function About() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {t('about.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('about.desc')}</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('about.name')}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('about.intro')}</p>

        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {t('about.stack')}
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {['Electron 42', 'React 19', 'TypeScript 6', 'Vite 8', 'TailwindCSS v4', 'pnpm'].map(
              (tech) => (
                <div
                  key={tech}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                >
                  {tech}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-6">
          <a
            href="https://github.com/BluerAngala/eletron-react-template"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            {t('about.repo')} →
          </a>
        </div>
      </section>
    </div>
  )
}
