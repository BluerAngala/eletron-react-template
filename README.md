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
- 🎨 TailwindCSS v4 with semantic CSS token theming
- 🌓 Multi-theme support (light / dark / extensible) with circular arc transition
- 🌐 i18n with separate locale files (zh-CN / en-US)
- 🧪 Vitest + Playwright
- 🔄 Electron auto-update
- 📦 electron-builder packaging

## Quick Start

```sh
git clone https://github.com/BluerAngala/eletron-react-template.git
cd eletron-react-template
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build and package |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | E2E tests |
| `pnpm typecheck` | Type check |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

## Project Structure

```tree
src/
├── styles/             Stylesheets
│   ├── index.css       Entry (imports all)
│   ├── tailwind.css    Tailwind config + @theme tokens
│   ├── tokens.css      Theme variable definitions
│   ├── base.css        Global reset and base styles
│   ├── scrollbar.css   Custom scrollbar
│   └── animation.css   Theme transition animation
├── i18n/               Internationalization
│   ├── index.ts        Exports and config
│   └── locales/        Locale files
│       ├── zh-CN.ts
│       └── en-US.ts
├── components/
│   ├── common/         Shared components (ErrorBoundary)
│   ├── layout/         Layout (Sidebar, TopBar, AppLayout)
│   └── update/         Auto-update UI
├── contexts/           React contexts (Theme, Language)
├── pages/              Page components
├── routes/             Route definitions
├── types/              TypeScript type definitions
├── assets/             SVG and images
└── demos/              Demo modules
```

## Theming

Uses **CSS custom properties** as semantic tokens. Components reference tokens (`bg-surface`, `text-foreground`), not raw colors.

### Token Architecture

```
styles/tokens.css    →  defines --token-* variables per theme
styles/tailwind.css  →  registers tokens as Tailwind @theme values
components           →  use semantic classes (bg-surface, text-foreground, border-border-default)
```

### Adding a New Theme

In `styles/tokens.css`, add a new class block:

```css
html.sepia {
  --token-bg: #f5f0e8;
  --token-surface: #faf5ed;
  --token-text: #433422;
  /* ... */
}
```

No component changes needed.

### Theme Switching

- Location: sidebar bottom → "选择主题" / "Choose Theme"
- Options: light / dark / system (follows OS)
- Animation: circular arc reveal via `document.startViewTransition()` + `clip-path`
- FOUC prevention: inline script in `index.html`

## Internationalization

- Languages: `zh-CN`, `en-US`
- Locale files: `src/i18n/locales/{zh-CN,en-US}.ts`
- Usage: `const { t } = useLanguage(); t('home.hero.title')`
- New keys must be added to **both** locale files

## IPC Communication

```typescript
// Renderer → Main
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// Main process
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

Reference: `electron/main/update.ts`, `electron/preload/index.ts`

## Upstream

Based on [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react). Thanks to the original authors.

## License

[MIT](LICENSE)
