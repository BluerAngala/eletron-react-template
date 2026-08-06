import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import {
  ArrowUp,
  Calendar,
  Check,
  Clipboard,
  Code,
  FolderOpen,
  GraduationCap,
  Pencil,
  PenLine,
  RefreshCw,
  Square,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { MarkdownText } from './markdown'

// GPT 风格色板（中性灰、无暖色）
const MESSAGE_BTN =
  'flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:text-white dark:hover:bg-white/10 dark:hover:text-white'

const ChatMessage: FC = () => (
  <MessagePrimitive.Root className="group/message relative flex w-full flex-col py-2.5">
    {/* 用户消息：纯文本、无气泡（ChatGPT 风格） */}
    <AuiIf condition={(s) => s.message.role === 'user'}>
      <div className="flex flex-col gap-1">
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-900 dark:text-white">
          <MessagePrimitive.Parts>
            {({ part }) => (part.type === 'text' ? <MarkdownText /> : null)}
          </MessagePrimitive.Parts>
        </div>
        <ActionBarPrimitive.Root className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
          <ActionBarPrimitive.Edit className={MESSAGE_BTN}>
            <Pencil className="size-4" />
          </ActionBarPrimitive.Edit>
          <ActionBarPrimitive.Copy className={MESSAGE_BTN}>
            <AuiIf condition={(s) => s.message.isCopied}>
              <Check className="size-4" />
            </AuiIf>
            <AuiIf condition={(s) => !s.message.isCopied}>
              <Clipboard className="size-4" />
            </AuiIf>
          </ActionBarPrimitive.Copy>
        </ActionBarPrimitive.Root>
      </div>
    </AuiIf>

    {/* AI 消息：全宽、无气泡、无衬线（ChatGPT 风格） */}
    <AuiIf condition={(s) => s.message.role === 'assistant'}>
      <div className="flex flex-col">
        <div className="break-words text-[15px] leading-relaxed text-slate-900 dark:text-white">
          <MessagePrimitive.Parts>
            {({ part }) => (part.type === 'text' ? <MarkdownText /> : null)}
          </MessagePrimitive.Parts>
          <AuiIf condition={(s) => s.thread.isRunning && s.message.isLast}>
            <span className="inline-block h-4 w-0.5 animate-pulse rounded-full bg-slate-400 align-middle" />
          </AuiIf>
        </div>
        <ActionBarPrimitive.Root className="mt-2 flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
          <ActionBarPrimitive.Copy className={MESSAGE_BTN}>
            <AuiIf condition={(s) => s.message.isCopied}>
              <Check className="size-4" />
            </AuiIf>
            <AuiIf condition={(s) => !s.message.isCopied}>
              <Clipboard className="size-4" />
            </AuiIf>
          </ActionBarPrimitive.Copy>
          <ActionBarPrimitive.FeedbackPositive className={MESSAGE_BTN} aria-label="Helpful">
            <ThumbsUp className="size-4" />
          </ActionBarPrimitive.FeedbackPositive>
          <ActionBarPrimitive.FeedbackNegative className={MESSAGE_BTN} aria-label="Not helpful">
            <ThumbsDown className="size-4" />
          </ActionBarPrimitive.FeedbackNegative>
          <ActionBarPrimitive.Reload className={MESSAGE_BTN}>
            <RefreshCw className="size-4" />
          </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
      </div>
    </AuiIf>
  </MessagePrimitive.Root>
)

/** Composer：圆形主动作（取消 / 发送） */
const ComposerPrimaryAction: FC = () => (
  <>
    <AuiIf condition={(s) => s.thread.isRunning}>
      <ComposerPrimitive.Cancel
        className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-black dark:hover:bg-slate-300"
        aria-label="Cancel"
      >
        <Square className="size-3 fill-current" />
      </ComposerPrimitive.Cancel>
    </AuiIf>
    <AuiIf condition={(s) => !s.thread.isRunning && !s.composer.isEmpty}>
      <ComposerPrimitive.Send
        className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-slate-300"
        aria-label="Send"
      >
        <ArrowUp className="size-4" />
      </ComposerPrimitive.Send>
    </AuiIf>
  </>
)

const Composer: FC = () => {
  const { t } = useTranslation('ai')
  return (
    <ComposerPrimitive.Root className="flex w-full flex-col gap-2 rounded-3xl border border-black/10 bg-white px-4 pt-3.5 pb-3 shadow-sm dark:border-white/10 dark:bg-[#1f1f1f]">
      <ComposerPrimitive.Input
        rows={1}
        placeholder={t('placeholder')}
        className="block max-h-72 min-h-6 w-full resize-none bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/60"
      />
      <div className="flex w-full items-center justify-end gap-1">
        <ComposerPrimaryAction />
      </div>
    </ComposerPrimitive.Root>
  )
}

/** 模式 chips（Welcome 态可见）：Write / Learn / Code / From Drive / From Calendar */
const ModeTabs: FC = () => {
  const { t } = useTranslation('ai')
  const tabs = [
    { label: t('modeWrite'), Icon: PenLine },
    { label: t('modeLearn'), Icon: GraduationCap },
    { label: t('modeCode'), Icon: Code },
    { label: t('modeDrive'), Icon: FolderOpen },
    { label: t('modeCalendar'), Icon: Calendar },
  ]
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {tabs.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 text-sm whitespace-nowrap text-slate-700 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <Icon className="size-3.5 text-slate-400 dark:text-white" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

/** Welcome 态：居中标题 + Composer + 模式 chips（ChatGPT 视觉） */
const ThreadWelcome: FC = () => {
  const { t } = useTranslation('ai')
  return (
    <div className="flex grow flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-stretch gap-6">
        <h1 className="text-center text-2xl font-medium text-slate-900 sm:text-3xl dark:text-white">
          {t('welcome')}
        </h1>
        <Composer />
        <ModeTabs />
      </div>
    </div>
  )
}

export function ThreadView() {
  const { t } = useTranslation('ai')
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col items-stretch bg-white font-sans text-slate-900 dark:bg-black dark:text-white">
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <ThreadWelcome />
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="flex grow flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl flex-1 py-6">
            <ThreadPrimitive.Messages>{() => <ChatMessage />}</ThreadPrimitive.Messages>
          </div>
          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto w-full max-w-2xl px-4 pt-4 pb-3">
            <Composer />
            <p className="pt-2 text-center text-xs text-slate-400 dark:text-white">
              {t('disclaimer')}
            </p>
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </AuiIf>
    </ThreadPrimitive.Root>
  )
}
