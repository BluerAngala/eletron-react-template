import { useState } from 'react'
import { toast } from 'sonner'
import UpdateElectron from '@/components/update'
import logoVite from '@/assets/logo-vite.svg'
import logoElectron from '@/assets/logo-electron.svg'
import logoTailwind from '@/assets/logo-tailwindcss.svg'

export function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white/90 shadow-[0_24px_70px_-40px_rgba(14,116,144,0.35)] backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <div className="grid gap-8 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-cyan-800 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400">
                Electron + Vite + React + Tailwind
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
                  Modern starter, cleaner rhythm, unified visual language.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
                  Refined spacing, balanced contrast, and consistent cards make the page feel more
                  polished while keeping all demo functionality intact.
                </p>
              </div>
            </div>

            <a
              href="https://github.com/BluerAngala/eletron-react-template"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-fit items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md dark:border-slate-600 dark:bg-slate-700 dark:hover:border-cyan-600"
            >
              <span className="relative flex h-10 w-10 items-center justify-center">
                <img src={logoVite} className="h-8 w-8" alt="Vite logo" />
                <img
                  src={logoElectron}
                  className="absolute h-8 w-8 motion-safe:animate-spin [animation-duration:20s]"
                  alt="Electron logo"
                />
              </span>
              <span className="pr-2 text-sm font-semibold text-slate-700 transition-colors group-hover:text-cyan-700 dark:text-slate-300 dark:group-hover:text-cyan-400">
                Open project repository
              </span>
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-linear-to-br from-cyan-50 to-white p-6 dark:border-slate-600 dark:from-cyan-900/20 dark:to-slate-800">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-200/60 blur-2xl dark:bg-cyan-800/40" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Counter demo
                </div>
                <img src={logoTailwind} className="h-6 w-6 opacity-90" alt="Tailwind CSS logo" />
              </div>
              <div className="text-5xl font-semibold text-slate-900 dark:text-slate-100">
                {count}
              </div>
              <button
                onClick={() => {
                  setCount((v) => v + 1)
                  toast.success(`计数: ${count + 1}`)
                }}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-white transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
              >
                Increment counter
              </button>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Edit <code>src/App.tsx</code> and save to test HMR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <div className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Public assets
          </div>
          <p className="mt-3 text-base leading-7">
            Place static files into the <code>/public</code> folder.
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-sky-50 p-6 text-slate-800 shadow-[0_18px_36px_-28px_rgba(14,116,144,0.4)] dark:border-cyan-800 dark:from-cyan-900/20 dark:to-sky-900/20 dark:text-slate-200">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-400">
            <img src={logoTailwind} className="h-5 w-5" alt="Tailwind CSS logo" />
            Tailwind system
          </div>
          <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
            Unified utility classes now drive layout, hierarchy, and component consistency across
            the app.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <div className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Update panel
          </div>
          <p className="mt-3 text-base leading-7">
            Built-in updater UI follows the same spacing and typography rules for a more harmonious
            experience.
          </p>
        </div>
      </section>

      <UpdateElectron />
    </div>
  )
}
