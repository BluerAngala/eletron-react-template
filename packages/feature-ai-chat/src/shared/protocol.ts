export const AI_STREAM_CHANNEL = 'feature-ai-chat:stream'

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiRequest {
  provider: string
  model: string
  system?: string
  messages: AiMessage[]
}

export type AiEvent =
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export function isAiRequest(value: unknown): value is AiRequest {
  if (typeof value !== 'object' || value === null) return false
  const request = value as Record<string, unknown>
  return (
    typeof request.provider === 'string' &&
    typeof request.model === 'string' &&
    (request.system === undefined || typeof request.system === 'string') &&
    Array.isArray(request.messages) &&
    request.messages.every(
      (message) =>
        typeof message === 'object' &&
        message !== null &&
        ((message as Record<string, unknown>).role === 'user' ||
          (message as Record<string, unknown>).role === 'assistant') &&
        typeof (message as Record<string, unknown>).content === 'string',
    )
  )
}
