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

# 3. 将 assets/logo.svg 替换为自己的图标（可从 iconfont 下载），再生成全套图标
pnpm icons
```

`pnpm rename` 一次性改写 name / productName / appId / 仓库地址 / README。
`pnpm icons` 从一个 SVG 生成 `.icns` / `.ico` / favicon / 多尺寸 PNG。

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
| `pnpm icons` | 从 assets/logo.svg 生成全套图标 |

## 项目结构

```tree
├── docs/               规范文档（如 logging-standard.md）
├── dist-electron/      编译后的 Electron 输出
├── electron/           主进程和 preload 源码
│   ├── main/           窗口、IPC、日志、自动更新
│   └── preload/        contextBridge 脚本
├── public/             静态资源
├── src/                渲染进程源码
│   ├── components/     可复用组件
│   ├── pages/          页面组件（Home / Logs）
│   ├── contexts/       React Context（主题）
│   ├── i18n/           i18n 初始化与语言配置
│   ├── locales/        语言资源（zh-CN / en-US）
│   ├── lib/            工具库（logger）
│   └── routes/         路由配置
└── test/               测试
    ├── e2e/            Playwright E2E
    └── *.test.ts       Vitest 单元测试
```

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
