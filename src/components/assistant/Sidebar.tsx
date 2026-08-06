import type { ThreadListItemState } from '@assistant-ui/react'
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAui,
  useAuiState,
} from '@assistant-ui/react'
import type { TFunction } from 'i18next'
import { MessageSquare, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * 复刻官方 AI SDK Chat Persistence 示例的左侧 sidebar：
 * - 顶部 "New chat" 主按钮
 * - 会话列表（当前 active 高亮）
 * - 每个 item 上 hover 显示操作区（rename / archive / delete）
 * - 隐藏时只显示一个 MessageSquare 折叠图标按钮
 */
export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { t } = useTranslation('ai')

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={t('openSidebar')}
        className="flex h-8 w-8 items-center justify-center self-start rounded-lg text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
      >
        <MessageSquare className="size-4" />
      </button>
    )
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#111111]">
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-white">
          {t('threads')}
        </span>
        <button
          type="button"
          onClick={onToggle}
          title={t('closeSidebar')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-black transition-colors hover:bg-black/10 hover:text-black dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      <ThreadListPrimitive.Root className="flex min-h-0 flex-1 flex-col gap-0.5 px-2 pt-2">
        <ThreadListPrimitive.New className="mb-2 flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-black dark:hover:bg-slate-300">
          <Plus className="size-4" />
          {t('newChat')}
        </ThreadListPrimitive.New>

        <ThreadListPrimitive.Items>{() => <ThreadListItem t={t} />}</ThreadListPrimitive.Items>
      </ThreadListPrimitive.Root>
    </aside>
  )
}

function ThreadListItem({ t }: { t: TFunction<'ai', undefined> }) {
  const aui = useAui()
  const item = useAuiState<ThreadListItemState>((s) => (s as any).threadListItem)
  const isMain = item.isMain
  const title = item.title ?? ''

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(title)
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, title])

  const commit = () => {
    const next = draft.trim()
    if (next && next !== title) {
      aui.threads.item({ id: item.id }).rename(next)
    }
    setEditing(false)
  }

  return (
    <ThreadListItemPrimitive.Root
      data-active={isMain ? '' : undefined}
      className="group/thread relative mb-0.5 flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-black transition-colors hover:bg-black/10 data-[active]:bg-black/10 dark:text-white dark:hover:bg-white/10 dark:data-[active]:bg-white/10"
    >
      <ThreadListItemPrimitive.Trigger className="flex flex-1 items-center gap-2 truncate text-left">
        <MessageSquare className="size-3.5 shrink-0 text-slate-400 dark:text-white" />
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setEditing(false)
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-black/10 bg-white px-1.5 py-0.5 text-xs outline-none dark:border-white/10 dark:bg-[#1f1f1f]"
          />
        ) : (
          <span className="truncate">
            <ThreadListItemPrimitive.Title fallback={t('newChat')} />
          </span>
        )}
      </ThreadListItemPrimitive.Trigger>

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/thread:opacity-100 data-[active]:opacity-100">
        <button
          type="button"
          title={t('rename')}
          onClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-black/10 hover:text-black dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
        <ThreadListItemPrimitive.Archive
          title={t('archive')}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-black/10 hover:text-black dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
        >
          <MoreHorizontal className="size-3.5" />
        </ThreadListItemPrimitive.Archive>
        <ThreadListItemPrimitive.Delete
          title={t('delete')}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:text-white dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <Trash2 className="size-3.5" />
        </ThreadListItemPrimitive.Delete>
      </div>
    </ThreadListItemPrimitive.Root>
  )
}
