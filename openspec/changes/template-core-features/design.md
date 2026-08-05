## Context

当前项目基于 electron-vite-react 模板，已有：
- Electron 42 + React 19 + TypeScript 6 + Vite 8 + TailwindCSS v4
- 基础的自动更新功能（electron-updater）
- 单窗口架构，无路由、无布局框架

需要在此基础上添加桌面应用通用基础设施。

## Goals / Non-Goals

**Goals:**
- 窗口状态持久化（大小、位置、最大化状态）
- 深色/浅色主题切换（系统跟随 + 手动切换 + 持久化）
- 全局布局框架（侧边栏 + 顶栏 + 内容区）
- 路由导航系统
- 全局错误边界
- Toast 通知系统

**Non-Goals:**
- 不实现具体业务页面（只搭框架）
- 不引入状态管理库（React Context 足够）
- 不实现多窗口管理（后续独立功能）
- 不添加国际化（后续按需）

## Decisions

### 1. 窗口状态持久化
- 使用 `electron-store`（轻量、无需数据库）
- 存储：`windowBounds`（x, y, width, height）+ `isMaximized`
- 在 `BrowserWindow` 创建前读取，`close` 事件时保存

### 2. 主题切换
- TailwindCSS v4 的 `dark:` 变体 + `prefers-color-scheme` 媒体查询
- 三种模式：`system`（跟随系统）、`light`、`dark`
- 使用 React Context 管理主题状态
- 持久化到 `localStorage`
- 在 `<html>` 上切换 `class="dark"`

### 3. 全局布局
- `AppLayout` 组件：侧边栏（可折叠）+ 顶栏 + 内容区
- 侧边栏：导航菜单 + 折叠按钮
- 顶栏：窗口标题栏区域 + 主题切换按钮
- 使用 TailwindCSS grid/flex 布局

### 4. 路由系统
- `react-router-dom` v7
- 路由配置集中管理（`src/routes/index.tsx`）
- 布局嵌套路由（`<Outlet />`）

### 5. 错误边界
- React `ErrorBoundary` 组件
- 捕获渲染错误，显示友好的错误页面
- 提供"重新加载"按钮

### 6. Toast 通知
- `sonner`（轻量、TailwindCSS 友好、无依赖）
- 全局挂载 `<Toaster />`
- 提供 `toast.success()` / `toast.error()` / `toast.info()` API

## Risks / Trade-offs

- `electron-store` 增加了主进程依赖，但体积小（~50KB）
- 主题切换需要在 `<html>` 上操作 class，与 TailwindCSS 的 `dark:` 配合良好
- `react-router-dom` 增加了包体积（~30KB gzip），但路由是多页面应用的刚需
- `sonner` 比 `react-hot-toast` 更轻量，但功能略少（够用）
