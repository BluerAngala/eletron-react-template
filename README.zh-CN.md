# eletron-react-template

[![GitHub stars](https://img.shields.io/github/stars/BluerAngala/eletron-react-template?color=fa6470)](https://github.com/BluerAngala/eletron-react-template/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/BluerAngala/eletron-react-template?color=d8b22d)](https://github.com/BluerAngala/eletron-react-template/issues)
[![GitHub license](https://img.shields.io/github/license/BluerAngala/eletron-react-template)](https://github.com/BluerAngala/eletron-react-template/blob/main/LICENSE)
[![Required Node.js >= 20.19.0 || >= 22.12.0](https://img.shields.io/static/v1?label=node&message=%3E=20.19.0%20||%20%3E=22.12.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

[English](README.md) | 简体中文

## 概览

基于 [electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板二次开发的 Electron + React + TypeScript 桌面应用模板。

### 特性

- ⚡ Vite 构建，开发体验流畅
- 🖥️ Electron 主进程 + React 渲染进程
- 🎨 TailwindCSS v4 样式方案，支持暗色模式
- 🌍 内置国际化（i18next），zh-CN / en-US 运行时切换
- 📝 统一结构化日志（主进程 + 渲染进程），含日志查看页面
- 🧪 Vitest 单元测试 + Playwright E2E 测试
- 🛡️ Biome 统一代码检查与格式化（单一工具，零配置陷阱）
- 📦 electron-builder 打包 + GitHub Release 发布 + 自动更新
- 🪄 一键改名脚本 + 图标生成脚本（单个 SVG 生成全套图标）

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

## 从模板创建新项目

```sh
# 1. 克隆（或作为 GitHub 模板使用）后安装依赖
pnpm install

# 2. 改名（默认交互式引导，也可直接传参；--dry-run 仅预览不写入）
pnpm rename --name my-app --appId com.example.myapp --repo owner/repo

# 3. 将 resources/assets/logo.svg 替换为自己的图标（可从 iconfont 下载），再生成全套图标
pnpm icons
```

`pnpm rename` 一次性改写 name / productName / appId / 仓库地址 / README。
`pnpm icons` 从一个 SVG 生成 `.icns` / `.ico` / favicon / 多尺寸 PNG。

## 可选功能

> 📖 **功能开发指南**：[`docs/feature-development.md`](docs/feature-development.md) —— 三步加一个自己的小工具，不用懂架构。

可选功能放在 `packages/feature-*` 独立 workspace 包中——每个包自带页面、IPC、preload 桥、多语言与专属依赖，宿主保持精简。启用/禁用只需**改一个配置文件**，不需要任何命令。

**开关**：`app/shared/features.ts` 的 `enabledFeatures`：

```ts
export const enabledFeatures = ['ai-chat', 'example'] as const
```

- 数组里有某 id = 该功能**启用**。
- 从数组移除某 id = 该功能**禁用**（其路由、导航、IPC 与 preload 桥都不会注册）。
- 新建 `packages/feature-<id>` 并把 id 加进来 = 出现新模块。
- 改完**重启 `pnpm dev`** 生效（主进程改动需要重启）。

查看可选模块（自动扫描 `packages/feature-*`）：

```bash
pnpm feature:list
```

新建一个功能模块（生成 `packages/feature-<id>` 骨架并自动接入宿主——开关、四处注册表、workspace 依赖一步到位）：

```bash
pnpm feature:new <id>
```

宿主对每个进程只维护一张很薄的注册表（`app/renderer/features/*` 与 `app/electron/*/features.ts`），把 id 映射到加载器。每个新模块只需在每张注册表加一行。

- `packages/feature-ai-chat` — AI 聊天功能（页面、IPC、preload 桥、凭据存储、`pi-ai`）。开发 AI 只改这个包；未来可发布到私有 registry 独立升级。
- `packages/feature-example` — 最小可插拔功能示例（页面 + IPC + i18n）。写自己的模块时可复制它当起点。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 构建渲染进程并打包应用 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm test:e2e` | 运行 Playwright 端到端测试 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | Biome 代码检查（含导入排序） |
| `pnpm lint:fix` | Biome 自动修复 |
| `pnpm format` | Biome 格式化（写入） |
| `pnpm format:check` | Biome 格式化检查 |
| `pnpm rename` | 交互式改名（包名 / appId / 仓库等） |
| `pnpm icons` | 从 resources/assets/logo.svg 生成全套图标 |
| `pnpm feature:list` | 列出可插拔模块（自动扫描 packages/feature-*） |
| `pnpm feature:new <id>` | 生成新功能包骨架并自动接入宿主 |

## 项目结构

> 两行读懂：**`app/` 是你要日常改的宿主应用；`packages/` 是可选功能包，改一个配置文件即可插拔。**

```tree
eletron-react-template/
├── app/                  ★ 宿主应用源码
│   ├── renderer/         React 界面 — 页面、组件、i18n、路由
│   ├── electron/         主进程、preload 与 IPC
│   └── shared/           跨进程共享配置
├── packages/             ★ 可插拔功能包（app/shared/features.ts 一键开关）
│   ├── feature-contract/ 宿主↔功能包的稳定注册契约
│   ├── feature-ai-chat/  可选 AI 功能 — 页面、IPC、preload、凭据
│   └── feature-example/  最小可插拔功能示例 — 页面 + IPC + i18n
├── resources/            源图 + Vite 静态资源
├── scripts/              维护脚本（rename / icons / feature）
├── tests/                单元 + E2E + 自动化测试
├── docs/                 规范与架构决策（ADRs）
├── build/                ⚙ 打包图标 — 由 `pnpm icons` 再生成
├── dist/                 ⚙ 编译后的渲染进程 — 自动生成
├── dist-electron/        ⚙ 编译后的 Electron — 自动生成
├── release/              ⚙ 打包产物安装包 — 自动生成
└── test-results/         ⚙ Playwright 产物 — 自动生成
```

> ⚙ = 构建/工具自动生成的产物，随时可删。这些目录已在 `.vscode/settings.json` 的 `files.exclude` 中从资源管理器隐藏，让侧边栏保持清爽——想重新看到它们，删掉对应条目即可。其余根目录文件（`package.json`、`vite.config.ts`、`tsconfig.json` 等）是必须留在根目录的工具配置。

### 为什么是"可插拔"

模板不会把可选功能写死在宿主里，每个生成的项目都保持精简：

- 一个功能包在自己的 `packages/feature-<id>/` 内**拥有一切**：UI、IPC 处理、preload 桥、多语言与专属依赖。
- `packages/feature-contract/` 定义宿主加载功能所用的稳定接口。
- 开关是**纯配置**：`app/shared/features.ts` 里的 `enabledFeatures` 是唯一开关，各进程的注册表把 id 映射到加载器。

**想加一个新能力**：复制 `packages/feature-example/` 当脚手架，实现契约，在三处注册表各加一行，再把 id 加进 `enabledFeatures`——不需要任何命令，也不需要 `pnpm install`。

## CI / CD

| 工作流 | 触发 | 用途 |
|--------|------|------|
| `quality.yml` | PR / push 到 main | 格式化 + lint + 类型检查 + 测试 + 渲染层构建 |
| `release.yml` | push `v*` 标签 / 手动 | 三平台打包 + 发布 GitHub Release |

质量门禁通过后才能合并。打 `v*` 标签触发发布。

## 上游项目

本项目基于 [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板开发，感谢原作者。

## 许可证

[MIT](LICENSE)
