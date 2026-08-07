# app/ —— 宿主源码（壳）

这个模板的"壳"。**所有宿主代码都在这里，新代码一律放 app/ 下。**

| 目录 | 说明 |
|------|------|
| `renderer/` | React 界面层：页面、组件、i18n、路由、功能加载入口。**桌面 + 网页共享**。 |
| `electron/` | 桌面壳：Electron 主进程、preload、IPC。 |
| `shared/` | 跨进程 / 跨端共享配置：`features.ts` 是可插拔功能开关。 |

分层原则（跨端）：核心（`shared/` + 功能包 `src/shared`）不依赖平台 API；平台 API 只出现在 `electron/` 壳。

- 往壳里加工具：见 `docs/feature-development.md`
- 架构总纲：见 `docs/project-standards.md`
