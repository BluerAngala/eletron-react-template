# eletron-react-template

[![GitHub stars](https://img.shields.io/github/stars/BluerAngala/eletron-react-template?color=fa6470)](https://github.com/BluerAngala/eletron-react-template/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/BluerAngala/eletron-react-template?color=d8b22d)](https://github.com/BluerAngala/eletron-react-template/issues)
[![GitHub license](https://img.shields.io/github/license/BluerAngala/eletron-react-template)](https://github.com/BluerAngala/eletron-react-template/blob/main/LICENSE)
[![Required Node.js >= 20.19.0 || >= 22.12.0](https://img.shields.io/static/v1?label=node&message=%3E=20.19.0%20||%20%3E=22.12.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

[English](README.md) | 简体中文

## 概览

基于 [electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板二次开发的 Electron + React + TypeScript 桌面应用模板。

### 特性

- ⚡ Vite 构建，HMR 快速热更新
- 🖥️ Electron 主进程 + React 渲染进程
- 🎨 TailwindCSS v4 样式方案，暖白浅色主题 + 暗色模式
- 🌓 主题切换带圆弧扩散过渡动画（View Transition API）
- 🌐 国际化支持（中文 / English）
- 🧪 Vitest 单元测试 + Playwright E2E 测试
- 🔄 Electron 自动更新
- 📦 electron-builder 打包发布

## 快速开始

```sh
# 克隆项目
git clone https://github.com/BluerAngala/eletron-react-template.git

# 进入项目目录
cd eletron-react-template

# 安装依赖
pnpm install

# 启动开发
pnpm dev
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 构建渲染进程并打包应用 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm test:e2e` | 运行 Playwright 端到端测试 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm format` | Prettier 格式化 |

## 项目结构

```tree
├── docs/               模板参考文件
├── dev_docs/           开发文档
├── dist-electron/      编译后的 Electron 输出
├── electron/           主进程和 preload 源码
│   ├── main/
│   └── preload/
├── public/             静态资源
├── src/                渲染进程源码
│   ├── assets/         SVG 和图片资源
│   ├── components/     可复用组件
│   │   ├── layout/     布局组件（Sidebar、TopBar、AppLayout）
│   │   ├── ui/         UI 基础组件
│   │   └── update/     自动更新 UI
│   ├── contexts/       React Context（主题、语言）
│   ├── demos/          演示模块
│   ├── pages/          页面组件
│   ├── routes/         路由定义
│   └── type/           TypeScript 类型定义
└── test/               测试
    └── e2e/
```

## 主题系统

应用支持**浅色**和**暗色**主题，切换时带圆弧扩散过渡动画。

### 浅色主题 — 暖白

采用柔和的暖白色调（`#faf8f5`），配合淡琥珀色渐变光晕，所有组件使用协调的暖色系。

### 暗色主题

基于深石板色（`slate-900`），配合蓝色调渐变光晕，所有组件均有完整的 `dark:` 变体样式。

### 主题切换

- **位置**：侧边栏底部 →「选择主题」
- **选项**：浅色 / 暗色 / 跟随系统
- **动画**：从左下角圆弧扩散，使用 `document.startViewTransition()` + `clip-path` 动画
- **防闪烁**：通过 `index.html` 内联脚本在首次渲染前应用主题

### 为新组件添加暗色模式

每个颜色工具类都需配对暗色变体：

```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  内容
</div>
```

## 国际化

- **语言**：中文（`zh-CN`）、English（`en-US`）
- **切换位置**：侧边栏底部 →「选择语言」
- **翻译键**：定义在 `src/contexts/LanguageContext.tsx`
- **使用方式**：`const { t } = useLanguage(); t('key.name')`

## IPC 通信

```typescript
// 渲染进程 → 主进程
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// 主进程监听
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

参考：`electron/main/update.ts`、`electron/preload/index.ts`、`src/components/update/index.tsx`

## 上游项目

基于 [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板开发，感谢原作者。

## 许可证

[MIT](LICENSE)
