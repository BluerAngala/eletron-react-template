import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiEvent, AiRenderMessage } from '@/lib/ai'

export interface UseAiChatOptions {
  provider: string
  model: string
  systemPrompt?: string
}

/**
 * 基于主进程 pi-ai 桥接的对话 hook：
 * - 维护消息历史与流式增量文本
 * - send() 发起流式对话；abort() 中断；reset() 清空
 */
export function useAiChat() {
  const [messages, setMessages] = useState<AiRenderMessage[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef<string | null>(null)
  const messagesRef = useRef<AiRenderMessage[]>([])
  // 供事件回调读取最新增量（闭包内引用）
  const streamingTextRef = useRef('')

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    streamingTextRef.current = streamingText
  }, [streamingText])

  useEffect(() => {
    const unsubscribe = window.ai?.onEvent((event: AiEvent) => {
      if (event.requestId !== requestIdRef.current) return
      switch (event.type) {
        case 'text_delta':
          setStreamingText((prev) => prev + event.delta)
          break
        case 'done':
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', content: event.text },
          ])
          setStreamingText('')
          setIsStreaming(false)
          requestIdRef.current = null
          break
        case 'error':
          if (event.reason === 'aborted') {
            // 手动中断：保留已生成的增量作为回答
            setMessages((prev) => [
              ...prev,
              ...(streamingTextRef.current
                ? [
                    {
                      id: crypto.randomUUID(),
                      role: 'assistant' as const,
                      content: streamingTextRef.current,
                    },
                  ]
                : []),
            ])
          } else {
            setError(event.message)
          }
          setStreamingText('')
          setIsStreaming(false)
          requestIdRef.current = null
          break
      }
    })
    return () => unsubscribe?.()
  }, [])

  const send = useCallback((prompt: string, options: UseAiChatOptions) => {
    if (!window.ai || !prompt.trim()) return
    const requestId = crypto.randomUUID()
    requestIdRef.current = requestId
    const userMessage: AiRenderMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    setError(null)
    setStreamingText('')
    setIsStreaming(true)
    window.ai.chat({
      requestId,
      provider: options.provider,
      model: options.model,
      systemPrompt: options.systemPrompt,
      // messagesRef 是渲染后同步的历史，当前这条用户消息要一起带上，
      // 否则首条消息发送时 payload 为空 → 400 Empty input messages
      messages: [...messagesRef.current, userMessage],
    })
  }, [])

  const abort = useCallback(() => {
    if (requestIdRef.current) window.ai?.abort(requestIdRef.current)
  }, [])

  const reset = useCallback(() => {
    requestIdRef.current = null
    setMessages([])
    setStreamingText('')
    setIsStreaming(false)
    setError(null)
  }, [])

  return { messages, streamingText, isStreaming, error, send, abort, reset }
}
