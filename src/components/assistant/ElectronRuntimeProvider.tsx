import {
  AssistantRuntimeProvider,
  type ChatModelAdapter,
  InMemoryThreadListAdapter,
  useLocalRuntime,
  useRemoteThreadListRuntime,
} from '@assistant-ui/react'
import { DevToolsModal } from '@assistant-ui/react-devtools'
import { type ReactNode, useMemo } from 'react'
import type { AssistantStreamMessage } from '@/lib/assistant'
import { useAssistantConfig } from '@/lib/assistant-config'

/**
 * 官方 Electron「本地主进程」模式（Pattern 2）的 assistant-ui 适配器：
 * - 通过 window.assistantAI（MessagePort 桥）把请求发给主进程 pi-ai
 * - 把 delta 流累积成完整快照 yield 给 assistant-ui（LocalRuntime 要求 yield 完整内容）
 * - 端口清理 / AbortSignal → 主进程 AbortController
 */
const ipcChatModel: ChatModelAdapter = {
  async *run({ messages, context, abortSignal }) {
    abortSignal.throwIfAborted()

    const config = useAssistantConfig.getState()
    const system: string[] = []
    if (context.system) system.push(context.system)
    if (config.systemPrompt) system.push(config.systemPrompt)

    const serialized: AssistantStreamMessage[] = []
    for (const message of messages) {
      const text = message.content
        .flatMap((part) => (part.type === 'text' ? [part.text] : []))
        .join('\n')
      if (!text) continue
      if (message.role === 'user') serialized.push({ role: 'user', content: text })
      if (message.role === 'assistant') serialized.push({ role: 'assistant', content: text })
    }

    if (!window.assistantAI) throw new Error('assistantAI bridge unavailable')
    const systemText = system.filter(Boolean).join('\n\n')

    let stop: (() => void) | undefined
    const stream = new ReadableStream<string>({
      start(controller) {
        let settled = false
        const close = () => {
          if (settled) return
          settled = true
          controller.close()
        }
        const fail = (error: unknown) => {
          if (settled) return
          settled = true
          controller.error(error)
        }

        stop = window.assistantAI?.streamChat(
          {
            ...(systemText ? { system: systemText } : {}),
            provider: config.provider,
            model: config.model,
            messages: serialized,
          },
          (event) => {
            if (event.type === 'delta') controller.enqueue(event.text)
            else if (event.type === 'done') close()
            else fail(new Error(event.message))
          },
        )

        const onAbort = () => {
          stop?.()
          fail(abortSignal.reason)
        }
        abortSignal.addEventListener('abort', onAbort, { once: true })
        if (abortSignal.aborted) onAbort()
      },
      cancel() {
        stop?.()
      },
    })

    const reader = stream.getReader()
    let fullText = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) return
        fullText += value
        yield { content: [{ type: 'text', text: fullText }] }
      }
    } finally {
      stop?.()
      reader.releaseLock()
    }
  },
}

export function ElectronRuntimeProvider({ children }: { children: ReactNode }) {
  // 多线程列表：每个线程独立 useLocalRuntime（共享同一个 ChatModelAdapter）
  const adapter = useMemo(() => new InMemoryThreadListAdapter(), [])
  const runtime = useRemoteThreadListRuntime({
    adapter,
    runtimeHook: () => useLocalRuntime(ipcChatModel),
  })
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {/* DevTools：仅开发构建生效，右下角启动器可检查运行时状态/上下文/事件；生产构建自动剥离 */}
      <DevToolsModal />
      {children}
    </AssistantRuntimeProvider>
  )
}
