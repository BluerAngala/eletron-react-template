---
sidebar_position: 4
title: 架构概览
description: 一分钟看懂目录结构 —— 壳在哪、功能包在哪、开关在哪。
---

# 架构概览

不需要掌握所有细节，但知道下面这张地图，你就能快速定位代码。

## 心智模型

- **`app/` = 壳**（宿主应用）：窗口、侧边栏、路由、日志，新代码主要放这里。
- **`packages/` = 小工具**（可插拔功能包）：每个工具一个独立包，互不干扰。
- **`app/shared/features.ts` = 开关**：改这个数组决定"壳里装哪些工具"。

## 目录结构

```tree
├── app/                  ★ 宿主应用源码（壳）
│   ├── renderer/         React 界面 — 页面、组件、i18n、路由、功能加载入口
│   ├── electron/         主进程、preload 与 IPC
│   └── shared/           跨进程共享配置（含 features.ts 开关）
├── packages/             ★ 可插拔功能包
│   ├── feature-contract/ 宿主↔功能包的稳定注册契约
│   ├── feature-ai-chat/  可选 AI 功能
│   └── feature-example/  最小功能示例（写新模块时复制它）
├── resources/            源图 + 静态资源
├── scripts/              维护脚本（rename / icons / feature:new）
├── tests/                Vitest、E2E 与自动化脚本
└── docs/                 规范与架构决策
```

> `build/`、`dist/`、`dist-electron/`、`release/`、`test-results/` 是构建 / 测试产物，自动生成、可随时删除，不用管。

## 可插拔是怎么工作的

1. 每个功能是一个独立的 workspace 包（`packages/feature-<id>/`），自带页面、IPC、preload 桥与多语言。
2. 宿主为每个进程维护一张很薄的"注册表"（`app/renderer/features/*`、`app/electron/*/features.ts`），把功能 id 映射到加载器。
3. `app/shared/features.ts` 的 `enabledFeatures` 数组是唯一开关：有就装配，删掉就不装配。

用 `pnpm feature:new <id>` 新建的功能会自动完成 1~3 的所有接线。

## 跨端架构（桌面 / 网页 / 小程序）

这个模板不止于桌面：**每个项目标配桌面端 + 文档网站，未来可扩展网页端和小程序端**。整体采用"壳–核心分离"：

- **核心（平台无关）**：`app/shared`、功能包的 `src/shared` —— 纯逻辑、状态、数据协议，禁止 import 平台 API。
- **共享 UI**：`app/renderer`（React）—— 桌面 + 网页复用。
- **平台壳（每端一个）**：`app/electron`（桌面，已完成）、`app/web`（规划）、`app/mini`（规划）—— 平台 API 只在这里。
- **能力抽象**：存储 / 剪贴板 / 通知 / 打开外部等定义成接口，各端实现，核心只依赖接口。

加一个新端 = 加一个壳 + 各能力的端实现，**不重写核心**。

| 端 | 状态 |
|----|------|
| 桌面（Electron） | 已完成 |
| 文档网站（Docusaurus） | 已完成 |
| 网页（Web） | 规划中 |
| 小程序（Mini） | 规划中 |

完整规范见仓库根 `docs/project-standards.md`，决策见 ADR-004。

## 架构决策记录

想深入了解设计取舍，见仓库 `docs/decisions/` 下的 ADR：

- `001` 功能包化（可插拔模块的设计来源）
- `002` 宿主目录布局
- `003` 配置驱动开关
- `004` 壳–核心分离（跨端架构）
