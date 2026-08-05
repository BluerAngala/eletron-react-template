# eletron-react-template

[![GitHub stars](https://img.shields.io/github/stars/BluerAngala/eletron-react-template?color=fa6470)](https://github.com/BluerAngala/eletron-react-template/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/BluerAngala/eletron-react-template?color=d8b22d)](https://github.com/BluerAngala/eletron-react-template/issues)
[![GitHub license](https://img.shields.io/github/license/BluerAngala/eletron-react-template)](https://github.com/BluerAngala/eletron-react-template/blob/main/LICENSE)
[![Required Node.js >= 20.19.0 || >= 22.12.0](https://img.shields.io/static/v1?label=node&message=%3E=20.19.0%20||%20%3E=22.12.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

English | [简体中文](README.zh-CN.md)

## Overview

基于 [electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板二次开发的 Electron + React + TypeScript 桌面应用模板。

### 特性

- ⚡ Vite 构建，开发体验流畅
- 🖥️ Electron 主进程 + React 渲染进程
- 🎨 TailwindCSS v4 样式方案
- 🧪 Vitest 单元测试 + Playwright E2E 测试
- 🔄 Electron 自动更新
- 📦 electron-builder 打包发布

## Quick Start

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

## Available Scripts

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 构建渲染进程并打包应用 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm test:e2e` | 运行 Playwright 端到端测试 |
| `pnpm typecheck` | TypeScript 类型检查 |

## Project Structure

```tree
├── docs/               模板参考文件
├── dev_docs/           开发文档
├── dist-electron/      编译后的 Electron 输出
├── electron/           主进程和 preload 源码
│   ├── main/
│   └── preload/
├── public/             静态资源
├── src/                渲染进程源码
│   ├── assets/
│   ├── components/
│   ├── demos/
│   └── type/
└── test/               测试
    └── e2e/
```

## Upstream

本项目基于 [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react) 模板开发，感谢原作者。

## License

[MIT](LICENSE)
