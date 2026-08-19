# eletron-react-template

[![GitHub stars](https://img.shields.io/github/stars/BluerAngala/eletron-react-template?color=fa6470)](https://github.com/BluerAngala/eletron-react-template/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/BluerAngala/eletron-react-template?color=d8b22d)](https://github.com/BluerAngala/eletron-react-template/issues)
[![GitHub license](https://img.shields.io/github/license/BluerAngala/eletron-react-template)](https://github.com/BluerAngala/eletron-react-template/blob/main/LICENSE)
[![Required Node.js >= 20.19.0 || >= 22.12.0](https://img.shields.io/static/v1?label=node&message=%3E=20.19.0%20||%20%3E=22.12.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

English | [简体中文](README.zh-CN.md)

## Overview

An Electron + React + TypeScript desktop application template based on [electron-vite-react](https://github.com/electron-vite/electron-vite-react).

### Features

- ⚡ Vite build with fast HMR
- 🖥️ Electron main process + React renderer
- 🎨 TailwindCSS v4 styling with warm white light theme and dark mode
- 🌓 Theme switching with circular arc transition animation (View Transition API)
- 🌐 i18n support (Chinese / English)
- 🧪 Vitest unit tests + Playwright E2E tests
- 🔄 Electron auto-update
- 📦 electron-builder packaging

## Quick Start

```sh
# Clone the repo
git clone https://github.com/BluerAngala/eletron-react-template.git

# Enter project directory
cd eletron-react-template

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Build renderer and package app |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm typecheck` | Run TypeScript type check |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## Project Structure

```tree
├── docs/               Template reference files
├── dev_docs/           Development documentation
├── dist-electron/      Compiled Electron output
├── electron/           Main process and preload source
│   ├── main/
│   └── preload/
├── public/             Static assets
├── src/                Renderer source
│   ├── assets/         SVG and image assets
│   ├── components/     Reusable components
│   │   ├── layout/     Layout components (Sidebar, TopBar, AppLayout)
│   │   ├── ui/         UI primitives
│   │   └── update/     Auto-update UI
│   ├── contexts/       React contexts (Theme, Language)
│   ├── demos/          Demo modules
│   ├── pages/          Page components
│   ├── routes/         Route definitions
│   └── type/           TypeScript type definitions
└── test/               Tests
    └── e2e/
```

## Theming

The app supports **light** and **dark** themes with a smooth circular arc transition.

### Light Theme — Warm White

A subtle warm-toned white (`#faf8f5`) with soft amber gradient overlays. All components use coordinated warm tones for a cohesive look.

### Dark Theme

A deep slate-based dark palette (`slate-900`) with blue-tinted gradient overlays. All components have proper `dark:` variant styles.

### Theme Switching

- **Location**: Sidebar bottom → "选择主题" / "Choose Theme"
- **Options**: Light / Dark / System (follows OS preference)
- **Animation**: Circular arc reveal from bottom-left corner using `document.startViewTransition()` + `clip-path` animation
- **FOUC prevention**: Theme is applied before first paint via inline script in `index.html`

### Adding Dark Mode to New Components

Every color utility must be paired with its dark variant:

```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  Content
</div>
```

## Internationalization

- **Languages**: Chinese (`zh-CN`), English (`en-US`)
- **Location**: Sidebar bottom → "选择语言" / "Choose Language"
- **Translation keys**: Defined in `src/contexts/LanguageContext.tsx`
- **Usage**: `const { t } = useLanguage(); t('key.name')`

## IPC Communication

```typescript
// Renderer → Main
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// Main process listener
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

Reference: `electron/main/update.ts`, `electron/preload/index.ts`, `src/components/update/index.tsx`

## Upstream

Based on [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react). Thanks to the original authors.

## License

[MIT](LICENSE)
