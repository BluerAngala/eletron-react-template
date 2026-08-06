# eletron-react-template

[![GitHub stars](https://img.shields.io/github/stars/BluerAngala/eletron-react-template?color=fa6470)](https://github.com/BluerAngala/eletron-react-template/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/BluerAngala/eletron-react-template?color=d8b22d)](https://github.com/BluerAngala/eletron-react-template/issues)
[![GitHub license](https://img.shields.io/github/license/BluerAngala/eletron-react-template)](https://github.com/BluerAngala/eletron-react-template/blob/main/LICENSE)
[![Required Node.js >= 20.19.0 || >= 22.12.0](https://img.shields.io/static/v1?label=node&message=%3E=20.19.0%20||%20%3E=22.12.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

English | [简体中文](README.zh-CN.md)

## Overview

A desktop application template built on Electron + React + TypeScript, derived from [electron-vite-react](https://github.com/electron-vite/electron-vite-react).

### Features

- ⚡ Vite-powered fast development experience
- 🖥️ Electron main process + React renderer process
- 🎨 TailwindCSS v4 styling with dark mode support
- 🌍 Built-in i18n (i18next) with zh-CN / en-US and runtime switching
- 📝 Unified structured logging (main process + renderer) with a dedicated log viewer page
- 🧪 Vitest unit tests + Playwright E2E tests
- 🛡️ Biome for linting & formatting (single tool, zero config traps)
- 📦 electron-builder packaging with GitHub Release publishing + auto-update
- 🪄 One-command rename script + full icon set generation from a single SVG

## Quick Start

```sh
# Clone the repository
git clone https://github.com/BluerAngala/eletron-react-template.git

# Enter the project directory
cd eletron-react-template

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Create a New Project

```sh
# 1. Clone (or use as a GitHub template) then install deps
pnpm install

# 2. Rename the project — interactive by default, or pass flags
#    (--dry-run previews without writing)
pnpm rename --name my-app --appId com.example.myapp --repo owner/repo

# 3. Replace assets/logo.svg with your own icon (e.g. download from iconfont),
#    then generate the full icon set
pnpm icons
pnpm installer-assets  # installer branding (NSIS sidebar/header, DMG background)
```

`pnpm rename` rewrites name / productName / appId / repo / README in one pass.
`pnpm icons` generates `.icns` / `.ico` / favicon / multi-size PNGs from one SVG.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Build renderer + package the app |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | Biome code check (incl. import sorting) |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome format (write) |
| `pnpm format:check` | Biome format check |
| `pnpm rename` | Rename project (name / appId / repo) interactively |
| `pnpm icons` | Generate full icon set from assets/logo.svg |
| `pnpm installer-assets` | Generate installer branding (NSIS sidebar/header, DMG background) |

## Project Structure

```tree
├── docs/               Standards (e.g. logging-standard.md)
├── dist-electron/      Compiled Electron output
├── electron/           Main process & preload source
│   ├── main/           Window, IPC, logger, auto-update
│   └── preload/        contextBridge scripts
├── public/             Static assets
├── src/                Renderer process source
│   ├── components/     Reusable components
│   ├── pages/          Page components (Home / Logs)
│   ├── contexts/       React Context (Theme)
│   ├── i18n/           i18n init & language config
│   ├── locales/        Language resources (zh-CN / en-US)
│   ├── lib/            Utilities (logger)
│   └── routes/         Router config
└── test/               Tests
    ├── e2e/            Playwright E2E
    └── *.test.ts       Vitest unit tests
```

## CI / CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `quality.yml` | PR / push to `main` | Format + lint + typecheck + test + renderer build |
| `release.yml` | Push `v*` tag / manual | 3-platform packaging + GitHub Release publishing |

Quality gates must pass before changes can merge. Tag `v*` to trigger a release.

## Upstream

Built on top of [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react). Thanks to the original author.

## License

[MIT](LICENSE)
