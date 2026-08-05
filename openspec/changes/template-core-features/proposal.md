## Why

当前模板只有基础的 Electron + React + Vite 骨架和自动更新功能。作为二次开发的模板项目，缺少几乎所有桌面应用都需要的核心基础设施（路由、布局、主题、通知等），导致每次开新项目都要从零搭建这些基础能力。

## What Changes

新增以下核心功能模块：

1. **窗口状态持久化** — 使用 `electron-store` 记住窗口大小和位置，下次启动自动恢复
2. **深色/浅色主题切换** — 基于 TailwindCSS v4 的 `dark:` 机制，支持系统跟随和手动切换，持久化用户偏好
3. **全局布局组件** — 侧边栏 + 顶栏 + 内容区的标准布局框架，支持折叠
4. **路由系统** — 集成 `react-router-dom`，支持多页面导航
5. **全局错误边界** — React ErrorBoundary，防止渲染错误导致白屏崩溃
6. **Toast 通知** — 轻量级消息提示组件（`sonner`）

## Capabilities

### New Capabilities

- `window-state`: 窗口状态持久化（大小、位置、最大化状态）
- `theme`: 深色/浅色主题切换与持久化
- `layout`: 全局布局组件（侧边栏 + 顶栏 + 内容区）
- `routing`: React Router 路由系统
- `error-boundary`: 全局错误边界
- `toast`: Toast 通知系统

### Modified Capabilities

无（本次为纯新增）
