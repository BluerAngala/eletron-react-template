---
sidebar_position: 2
title: 快速开始
description: 五分钟跑起来：安装、启动、改名、加第一个工具。
---

# 快速开始

## 环境要求

- Node.js ≥ 20.19 或 ≥ 22.12
- pnpm 11

## 安装并启动

```bash
# 克隆（或作为 GitHub 模板使用）
git clone https://github.com/BluerAngala/eletron-react-template.git
cd eletron-react-template

# 安装依赖
pnpm install

# 启动开发模式
pnpm dev
```

## 从模板创建你自己的项目

```bash
# 1. 安装依赖
pnpm install

# 2. 改名（name / appId / 仓库地址 / README 一次改写；--dry-run 只预览）
pnpm rename --name my-app --appId com.example.myapp --repo owner/repo

# 3. 换图标：替换 resources/assets/logo.svg 后生成全套图标
pnpm icons
```

## 加你的第一个工具

```bash
pnpm feature:new json-tools   # 生成功能包骨架，自动接入宿主
pnpm install                  # 链接依赖（只新建时做一次）
pnpm dev                      # 侧边栏出现 json-tools，点进去开始写
```

然后编辑 `packages/feature-json-tools/src/renderer.tsx`，把示例换成你的逻辑。详细说明见[功能开发指南](./feature-development)。

## 常用命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动应用（开发模式） |
| `pnpm build` | 构建渲染层并打包 |
| `pnpm feature:new <id>` | 新建一个功能模块 |
| `pnpm feature:list` | 列出可选功能模块 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` / `pnpm lint:fix` | 代码检查 / 自动修复 |
| `pnpm test` | 单元测试 |
| `pnpm test:e2e` | 端到端测试 |
| `pnpm rename` | 项目改名 |
| `pnpm icons` | 从 logo.svg 生成全套图标 |
