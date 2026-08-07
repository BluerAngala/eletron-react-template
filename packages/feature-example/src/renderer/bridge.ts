export interface ExampleBridge {
  ping(): Promise<{ pong: boolean; timestamp: string }>
}

declare global {
  interface Window {
    exampleBridge?: ExampleBridge
  }
}
