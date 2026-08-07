# 项目规范（模板总纲）

> 本文是模板项目的**总体规范**：讲清楚"用这个模板做出来的每个项目，长什么样、必须带什么、架构怎么分层、未来怎么扩展到网页端和小程序端"。
>
> 定位一句话：**一个跨端可扩展的"壳 + 小工具"模板。桌面端已就绪，网页端与小程序的架构预留已设计好。**

---

## 1. 项目定位

用本模板创建的项目 = **一个带可插拔功能体系的跨端应用**。

- 给用户：一个桌面应用（壳），里面是你要集成的各种小工具。
- 给你（开发者）：一套开箱即用的工程底座——开发、测试、打包、发布、文档网站全配好。
- 给未来：同一个核心，能再长出网页端、小程序端。

## 2. 每个项目的标配

无论做什么项目，模板默认都会交付这几样。**这是承诺，不是可选。**

### 2.1 桌面端（Electron）✅ 已完成

- 开发：`pnpm dev`（Vite + Electron，热更新）
- 打包：`pnpm build` → electron-builder 三平台（macOS / Windows / Linux）安装包
- 发布：打 `v*` 标签 → GitHub Release 自动发布 + 应用内自动更新
- 可插拔功能：`pnpm feature:new <id>` 加工具，`enabledFeatures` 开关

### 2.2 文档网站（Docusaurus）✅ 已完成

- 落地页 + 使用说明 + SEO，托管在 GitHub Pages，push 自动部署
- 中英双语，路径 `/zh-CN/`、`/en/`
- 网站源码在 `website/`，独立于主项目（不影响桌面端构建）

### 2.3 网页端（Web）🔜 规划（架构已预留）

- 复用桌面端的 React 组件层（`app/renderer`）与功能逻辑
- 用 Vite 单独构建静态站；禁用的能力（Electron IPC、文件系统）用网页实现替换

### 2.4 小程序端（Mini Program）🔜 规划（架构已预留）

- UI 用小程序框架（Taro / uni-app）重写，但**复用功能包里的业务逻辑、状态与数据协议**
- 只暴露小程序平台允许的能力

> 原则：**每一端都只是一个"壳"**。真正的产品逻辑住在共享的核心里，换端只换壳、不重写核心。

## 3. 总体架构（跨端分层）

### 3.1 分层模型

```
┌──────────────────────────────────────────────────────┐
│  功能层  packages/feature-*（可插拔，跨端复用）           │
│    · src/shared    领域逻辑 / 状态 / 数据协议（平台无关） │
│    · src/renderer  React UI（桌面 + 网页共享）           │
│    · src/main      桌面端主进程能力（仅桌面用）           │
│    · src/preload   桌面端桥（仅桌面用）                   │
├──────────────────────────────────────────────────────┤
│  共享 UI  app/renderer（React 页面 / 路由 / i18n）       │
│    —— 桌面与网页端直接复用                               │
├──────────────────────────────────────────────────────┤
│  平台壳（每端一个，只允许出现平台相关 API）                │
│    · app/electron   桌面壳（Electron 主进程 / preload）   │
│    · app/web        网页壳（Vite 静态站，规划中）         │
│    · app/mini       小程序壳（Taro / uni-app，规划中）    │
├──────────────────────────────────────────────────────┤
│  能力抽象（跨端接口）                                     │
│    · 存储 / 剪贴板 / 打开外部 / 通知 / 文件系统            │
│    · 定义统一接口，各端各自实现，核心只依赖接口            │
└──────────────────────────────────────────────────────┘
```

### 3.2 三条铁律

1. **壳-核心分离**：Electron API、`window` 浏览器 API、小程序 API **只允许出现在平台壳层**；`app/shared`、`packages/feature-*/src/shared` 这些核心代码**禁止 import 平台 API**。
2. **能力接口化**：凡是可能跨端的能力（存储、剪贴板、通知、打开外部链接…），先在"能力抽象层"定义接口，再为每个端写实现。核心代码只认接口。
3. **功能包跨端**：功能包的 `src/shared`（纯逻辑/协议）天然跨端复用；`src/renderer`（React UI）供桌面 + 网页；桌面专属的 `main/preload` 只活在桌面端。未来某端不需要某功能时，用该端的 `enabledFeatures` 开关即可。

### 3.3 目录映射

```
app/                 宿主源码
  renderer/          React UI（桌面 + 网页共享）—— 页面 / 组件 / i18n / 路由 / 功能加载
  electron/          桌面壳 —— 主进程 / preload / IPC
  web/               网页壳（规划）—— 复用 renderer，Vite 构建
  mini/              小程序壳（规划）—— Taro / uni-app
  shared/            跨进程 / 跨端共享配置（enabledFeatures 开关）
packages/
  feature-contract/  宿主 ↔ 功能注册契约（稳定接口）
  feature-ai-chat/   可选功能实现
  feature-example/   最小功能示例（写新模块时复制它）
website/             文档网站（Docusaurus，独立子项目）
scripts/             维护脚本（rename / icons / feature:new）
tests/               测试（Vitest / Playwright / 自动化）
```

### 3.4 可插拔功能的跨端延伸

现在的功能包三件套是 `renderer / main / preload`（面向桌面）。扩展到多端后，功能包会多出端适配目录：

```
packages/feature-<id>/
  src/
    shared/       纯逻辑 + 协议（所有端复用）✅ 已有
    renderer/     React UI（桌面 + 网页复用）✅ 已有
    main/         桌面主进程能力（仅桌面）✅ 已有
    preload/      桌面桥（仅桌面）✅ 已有
    web/          网页端适配（规划）
    mini/         小程序端适配（规划）
```

新增端时，**不推翻现有功能包结构**，只往里加对应端的适配目录，并在对应端的注册表里挂上 loader。

## 4. 当前进度

| 端 / 模块 | 状态 | 说明 |
|-----------|------|------|
| 桌面端（Electron） | ✅ 已完成 | 开发 / 三平台打包 / 自动更新 / 可插拔功能 |
| 文档网站（Docusaurus） | ✅ 已完成 | 落地页 / 使用说明 / SEO / GitHub Pages |
| 网页端（Web） | 🔜 规划 | 复用 `app/renderer`，接口已预留 |
| 小程序端（Mini） | 🔜 规划 | 复用核心逻辑，UI 走小程序框架 |

## 5. 质量要求（所有端共用）

- 代码规范：Biome（lint + format 单一工具），`pnpm lint` / `pnpm format:check`
- 类型：TypeScript 严格模式，`pnpm typecheck`
- 测试：Vitest 单元测试 + Playwright E2E，CI（`.github/workflows/quality.yml`）强制
- 新文案必须走 i18n（中英双语）
- 关键路径用统一 logger，禁止裸 `console.log`（规范见 `docs/logging-standard.md`）
- 新功能开发照 `docs/feature-development.md`，用 `pnpm feature:new` 生成骨架

## 6. 演进路线

1. **现在**：桌面端 + 文档网站已交付，可插拔功能体系稳定。
2. **下一步（网页端）**：抽出"能力抽象层"，用 Vite 建 `app/web` 壳复用 `app/renderer`；桌面专属能力在网页端给降级实现或隐藏。
3. **再下一步（小程序端）**：用 Taro / uni-app 建 `app/mini`，功能包的 `shared` 逻辑直接复用，UI 重写。
4. 每加一端，补该端的构建 / 打包 / 发布流程到 CI，并更新本文档与 `docs/decisions/` 的 ADR。

> 架构决策记录：见 `docs/decisions/004-cross-platform-architecture.md`。
