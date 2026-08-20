---
title: "目录结构"
description: "项目目录结构总览：src 渲染进程、electron 主进程、plugins 插件、test 测试的组织方式"
---

# 目录结构

```
├── src/                      # 前端源码
│   ├── styles/               # 样式（tokens.css, base.css, animation.css）
│   ├── i18n/locales/          # 国际化（zh-CN.ts, en-US.ts）
│   ├── components/
│   │   ├── common/           # 通用组件
│   │   ├── layout/           # 布局（Sidebar, TopBar, AppLayout）
│   │   ├── log-viewer/       # 实时日志查看器
│   │   └── plugin/           # 插件相关（PluginDetailModal, ImportPluginButton）
│   ├── contexts/             # React Context（ThemeContext, LanguageContext）
│   ├── pages/                # 页面（Home, PluginMarket, MyPlugins, Settings）
│   ├── routes/               # 路由定义
│   ├── types/                # 类型定义
│   └── utils/                # 工具（logger.ts 渲染进程日志捕获）
├── electron/
│   ├── main/
│   │   ├── plugin/
│   │   │   ├── index.ts      # 入口，初始化所有子系统
│   │   │   ├── shared.ts     # 共享类型/工具
│   │   │   ├── store.ts      # KV 存储
│   │   │   ├── physicalFs.ts # 物理文件系统（ASAR）
│   │   │   ├── plugin-preload.js  # 插件运行时 preload（ZTools 兼容）
│   │   │   ├── builtin.ts    # 内置插件扫描
│   │   │   ├── api/          # 插件 API（dispatcher, services, 各模块）
│   │   │   ├── installer/    # 安装（installer, download, market, zpx）
│   │   │   └── runtime/      # 运行时（registry, runner, http）
│   │   ├── index.ts          # 主进程入口
│   │   └── update.ts         # 自动更新
│   └── preload/              # Preload 脚本
├── test/                     # 测试（Vitest + Playwright）
├── plugins/                  # 内置插件源码
├── resources/lib/            # 原生模块（.node / .dylib）
├── docs/                     # 文档站（VitePress）
└── vite.config.ts / tsconfig.json / electron-builder.json
```

## 关键目录说明

| 目录 | 说明 |
|------|------|
| `electron/main/plugin/api/` | 插件 API 模块，每个模块自注册 IPC handler |
| `electron/main/plugin/installer/` | 插件安装分发（市场下载、本地导入、ZPX 解析） |
| `electron/main/plugin/runtime/` | 插件运行时管理（注册表、运行器、HTTP 客户端） |
| `resources/lib/` | 原生模块 `.node` 文件（macOS + Windows） |
| `plugins/` | 内置插件源码，启动时自动扫描注册 |
| `src/utils/logger.ts` | 渲染进程日志捕获，拦截 console 发送到主进程 |