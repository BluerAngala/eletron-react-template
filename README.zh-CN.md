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
- 🎨 TailwindCSS v4 + 语义化 CSS Token 主题架构
- 🌓 多主题支持（浅色 / 暗色 / 可扩展），圆弧过渡动画
- 🌐 国际化，独立语言文件（zh-CN / en-US）
- 🧪 Vitest + Playwright
- 🔄 Electron 自动更新
- 📦 electron-builder 打包发布

## 快速开始

```sh
git clone https://github.com/BluerAngala/eletron-react-template.git
cd eletron-react-template
pnpm install
pnpm dev
```

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建并打包 |
| `pnpm test` | 单元测试 |
| `pnpm test:e2e` | E2E 测试 |
| `pnpm typecheck` | 类型检查 |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

## 项目结构

```tree
src/
├── styles/             样式文件
│   ├── index.css       入口（import 全部）
│   ├── tailwind.css    Tailwind 配置 + @theme token 注册
│   ├── tokens.css      主题变量定义（浅色/暗色/扩展）
│   ├── base.css        全局重置与基础样式
│   ├── scrollbar.css   自定义滚动条
│   └── animation.css   主题切换动画
├── i18n/               国际化
│   ├── index.ts        导出与配置
│   └── locales/        语言文件
│       ├── zh-CN.ts
│       └── en-US.ts
├── components/
│   ├── common/         通用组件（ErrorBoundary）
│   ├── layout/         布局（Sidebar、TopBar、AppLayout）
│   └── update/         自动更新 UI
├── contexts/           React Context（主题、语言）
├── pages/              页面组件
├── routes/             路由定义
├── types/              TypeScript 类型定义
├── assets/             SVG 与图片
└── demos/              演示模块
```

## 主题系统

使用 **CSS 自定义属性**作为语义化 Token，组件引用 Token（`bg-surface`、`text-foreground`），不写死颜色值。

### Token 架构

```
styles/tokens.css    →  定义 --token-* 变量（按主题）
styles/tailwind.css  →  注册为 Tailwind @theme 值
组件                 →  使用语义类名（bg-surface、text-foreground、border-border-default）
```

### 新增主题

在 `styles/tokens.css` 添加一个 class 块：

```css
html.sepia {
  --token-bg: #f5f0e8;
  --token-surface: #faf5ed;
  --token-text: #433422;
  /* ... */
}
```

组件无需任何改动。

### 主题切换

- 位置：侧边栏底部 →「选择主题」
- 选项：浅色 / 暗色 / 跟随系统
- 动画：`document.startViewTransition()` + `clip-path` 圆弧扩散
- 防闪烁：`index.html` 内联脚本在首次渲染前应用主题

## 国际化

- 语言：`zh-CN`、`en-US`
- 语言文件：`src/i18n/locales/{zh-CN,en-US}.ts`
- 使用：`const { t } = useLanguage(); t('home.hero.title')`
- 新增翻译键**必须**同时添加到两个语言文件

## IPC 通信

```typescript
// 渲染进程 → 主进程
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// 主进程监听
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

参考：`electron/main/update.ts`、`electron/preload/index.ts`

## 上游项目

基于 [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板开发，感谢原作者。

## 许可证

[MIT](LICENSE)
