# AI Chat Feature

This workspace package owns the optional AI chat feature. The host application only calls its public registration functions.

```text
src/
  main/       Electron main-process IPC, credentials, and model providers
  preload/    Narrow contextBridge API exposed to the renderer
  renderer/   React-facing registration and renderer bridge types
  shared/     Structured-clone-safe IPC protocol shared by main and preload
  locales/    Feature-owned language resources
```

Public entry points are `@electron-template/feature-ai-chat/renderer`, `/main`, and `/preload`. Do not import feature internals from the host application.