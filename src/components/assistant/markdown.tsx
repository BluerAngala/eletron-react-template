import { MarkdownTextPrimitive, useIsMarkdownCodeBlock } from '@assistant-ui/react-markdown'
import type { ComponentPropsWithoutRef } from 'react'
import remarkGfm from 'remark-gfm'

/** 代码渲染：行内代码 vs 代码块样式区分（hook 在顶层组件调用，满足 lint 规则） */
function Code({ className, ...props }: ComponentPropsWithoutRef<'code'>) {
  const isCodeBlock = useIsMarkdownCodeBlock()
  return (
    <code
      className={
        !isCodeBlock
          ? `rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-slate-800 ${className ?? ''}`
          : className
      }
      {...props}
    />
  )
}

/**
 * 消息内 Markdown 渲染（基于 @assistant-ui/react-markdown），
 * 样式用项目自身的 Tailwind 色板，与整体主题一致。
 */
export function MarkdownText() {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      defer
      className="text-sm leading-relaxed text-slate-800 dark:text-white"
      components={{
        h1: ({ className, ...props }) => (
          <h1
            className={`mt-4 mb-2 text-xl font-semibold first:mt-0 ${className ?? ''}`}
            {...props}
          />
        ),
        h2: ({ className, ...props }) => (
          <h2
            className={`mt-4 mb-2 text-lg font-semibold first:mt-0 ${className ?? ''}`}
            {...props}
          />
        ),
        h3: ({ className, ...props }) => (
          <h3
            className={`mt-3 mb-1.5 text-base font-semibold first:mt-0 ${className ?? ''}`}
            {...props}
          />
        ),
        p: ({ className, ...props }) => (
          <p
            className={`my-2.5 leading-relaxed first:mt-0 last:mb-0 ${className ?? ''}`}
            {...props}
          />
        ),
        a: ({ className, ...props }) => (
          <a
            className={`text-cyan-600 underline underline-offset-2 hover:text-cyan-500 dark:text-cyan-400 ${className ?? ''}`}
            {...props}
          />
        ),
        ul: ({ className, ...props }) => (
          <ul className={`my-2.5 ms-5 list-disc [&>li]:mt-1 ${className ?? ''}`} {...props} />
        ),
        ol: ({ className, ...props }) => (
          <ol className={`my-2.5 ms-5 list-decimal [&>li]:mt-1 ${className ?? ''}`} {...props} />
        ),
        li: ({ className, ...props }) => (
          <li className={`leading-relaxed ${className ?? ''}`} {...props} />
        ),
        strong: ({ className, ...props }) => (
          <strong className={`font-semibold ${className ?? ''}`} {...props} />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={`my-2.5 border-s-2 border-slate-300 ps-4 text-slate-500 dark:border-slate-600 dark:text-white ${className ?? ''}`}
            {...props}
          />
        ),
        hr: ({ className, ...props }) => (
          <hr
            className={`my-3 border-slate-200 dark:border-slate-700 ${className ?? ''}`}
            {...props}
          />
        ),
        pre: ({ className, ...props }) => (
          <pre
            className={`my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-3.5 text-[13px] leading-relaxed dark:border-slate-700 dark:bg-slate-900 ${className ?? ''}`}
            {...props}
          />
        ),
        code: Code,
        table: ({ className, ...props }) => (
          <table className={`my-2.5 w-full ${className ?? ''}`} {...props} />
        ),
        th: ({ className, ...props }) => (
          <th className={`px-3 py-1.5 text-start font-medium ${className ?? ''}`} {...props} />
        ),
        td: ({ className, ...props }) => (
          <td
            className={`border-s border-b border-slate-200 px-3 py-1.5 text-start dark:border-slate-700 ${className ?? ''}`}
            {...props}
          />
        ),
      }}
    />
  )
}
