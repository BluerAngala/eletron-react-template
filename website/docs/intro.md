---
sidebar_position: 1
title: 介绍
description: 这是什么 —— 一个可插拔的桌面应用模板，一套壳装下你所有的小工具。
---

# 这是什么

**Electron + React + TypeScript 桌面应用模板。** 核心理念一句话：

> 一套壳，装下你所有的小工具。

- **壳**：窗口、侧边栏、路由、日志、打包，全部开箱即用。
- **工具**：每个功能是一个独立模块，一条命令生成骨架、配置即开关，互不干扰。

## 特性

- **可插拔功能**：`pnpm feature:new <id>` 一键生成功能包并自动接入宿主；改一行 `enabledFeatures` 即可上架 / 下架。
- **内置 i18n**：中英双语，运行时切换，文案按命名空间拆分。
- **统一日志**：主进程 + 渲染进程统一 logger，内置日志查看页。
- **主题系统**：亮色 / 暗色 / 跟随系统，Tailwind v4 变量驱动。
- **测试**：Vitest 单元测试 + Playwright E2E。
- **单一工具链**：Biome 同时管 lint 与 format。
- **一键发布**：electron-builder 三平台打包 + GitHub Release + 自动更新。

## 技术栈

Electron · React · TypeScript · Vite · TailwindCSS v4 · pnpm · Biome

## 适合谁

- 想快速起一个**桌面应用壳**，然后不断往里面加小工具的个人或小团队；
- 需要开箱即用的窗口、路由、日志、i18n、打包发布流程，不想从零搭。

## 下一步

- 想马上跑起来？→ [快速开始](./quickstart)
- 想加你的第一个工具？→ [功能开发指南](./feature-development)
