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

# 3. Replace resources/assets/logo.svg with your own icon (e.g. download from iconfont),
#    then generate the full icon set
pnpm icons
```

`pnpm rename` rewrites name / productName / appId / repo / README in one pass.
`pnpm icons` generates `.icns` / `.ico` / favicon / multi-size PNGs from one SVG.

## Optional Features

> 📖 **Feature development guide:** [`docs/feature-development.md`](docs/feature-development.md) — add your own tool in 3 steps, no architecture knowledge needed.

Optional functionality lives in independent workspace packages under `packages/feature-*` — each owns its page, IPC handlers, preload bridge, locales, and dependencies, so the host stays lean. Enable or disable them by editing **one config file** — no commands needed.

**The switch:** `app/shared/features.ts` → `enabledFeatures`:

```ts
export const enabledFeatures = ['ai-chat', 'example'] as const
```

- An id in the array = that feature is **enabled**.
- Remove an id = that feature is **disabled** (its route, nav entry, IPC handlers, and preload bridge are simply not registered).
- Add a new package `packages/feature-<id>` plus its id here = a new module appears.
- Restart `pnpm dev` after editing (main-process changes need a restart).

List available modules (auto-discovered from `packages/feature-*`):

```bash
pnpm feature:list
```

Scaffold a new feature (generates `packages/feature-<id>` and wires it into the host — switch, registries, workspace dependency):

```bash
pnpm feature:new <id>
```

The host only knows one thin "registry" per process (`app/renderer/features/*` and `app/electron/*/features.ts`), mapping each id to a loader. Every new module adds one line per registry.

- `packages/feature-ai-chat` — the AI chat feature (page, IPC, preload bridge, credential storage, `pi-ai`). Develop AI only inside this package; it can later be published to a private registry and upgraded independently.
- `packages/feature-example` — a minimal pluggable-feature sample (page + IPC + i18n). Copy it as the starting point for your own module.

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
| `pnpm icons` | Generate full icon set from resources/assets/logo.svg |
| `pnpm feature:list` | List pluggable modules (auto-scans packages/feature-*) |
| `pnpm feature:new <id>` | Scaffold a new feature package and wire it into the host |

## Project Structure

> Two lines to get oriented: **`app/` is the host application you edit day-to-day; `packages/` are optional, pluggable feature modules you toggle in one config file.**

```tree
eletron-react-template/
├── app/                  ★ Host application source
│   ├── renderer/         React UI — pages, components, i18n, routes
│   ├── electron/         Main process, preload, and IPC
│   └── shared/           Cross-process shared configuration
├── packages/             ★ Pluggable feature packages (toggle in app/shared/features.ts)
│   ├── feature-contract/ Stable host↔feature registration contract
│   ├── feature-ai-chat/  Optional AI feature — page, IPC, preload, credentials
│   └── feature-example/  Minimal pluggable-feature sample (page + IPC + i18n)
├── resources/            Source artwork + Vite static assets
├── scripts/              Maintenance scripts (rename / icons / feature)
├── tests/                Unit + E2E + automation tests
├── docs/                 Standards & architecture decisions (ADRs)
├── build/                ⚙ Packaging icons — regenerated by `pnpm icons`
├── dist/                 ⚙ Compiled renderer — auto-generated
├── dist-electron/        ⚙ Compiled Electron main/preload — auto-generated
├── release/              ⚙ Packaged installers — auto-generated
└── test-results/         ⚙ Playwright artifacts — auto-generated
```

> ⚙ = generated output, safe to delete anytime. These folders are hidden from the VS Code explorer via `.vscode/settings.json` (`files.exclude`) so the sidebar stays clean — remove those entries to show them again. Everything else at the root (`package.json`, `vite.config.ts`, `tsconfig.json`, ...) is tool configuration that must live there.

### Why "pluggable"

The template never bakes optional functionality into the host, so every generated project stays lean:

- A feature owns **everything** inside its own `packages/feature-<id>/`: UI, IPC handlers, preload bridge, locales, and its dependencies.
- `packages/feature-contract/` defines the stable interfaces the host uses to load a feature.
- Toggling is **pure configuration**: `enabledFeatures` in `app/shared/features.ts` is the single switch; the per-process registries map each id to its loader.

**To add a new capability:** copy `packages/feature-example/` as a scaffold, implement the contract, register it in the three registries, and add its id to `enabledFeatures` — no command, no `pnpm install`.

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
