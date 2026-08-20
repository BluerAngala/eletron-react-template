# 目录结构

```
├── src/                      # 前端源码
│   ├── styles/               # 样式文件（Token、基础样式）
│   ├── i18n/                 # 国际化
│   │   └── locales/          # 按语言拆分（zh-CN.ts, en-US.ts）
│   ├── components/
│   │   ├── common/           # 通用组件（ErrorBoundary）
│   │   ├── layout/           # 布局组件（Sidebar、AppLayout）
│   │   ├── plugin/           # 插件相关组件（PluginDetailModal, ImportPluginButton）
│   │   └── update/           # 自动更新 UI
│   ├── contexts/             # React Context（ThemeContext、LanguageContext）
│   ├── pages/                # 页面组件（Home、PluginMarket、MyPlugins）
│   ├── routes/               # 路由定义
│   ├── types/                # TypeScript 类型定义
│   └── assets/               # 静态资源（SVG）
├── electron/                 # Electron 主进程
│   ├── main/
│   │   ├── plugin/           # 插件子系统（市场、安装、运行、注册）
│   │   ├── index.ts          # 主进程入口
│   │   └── update.ts         # 自动更新
│   └── preload/              # Preload 脚本
├── test/                     # 测试
│   └── e2e/                  # Playwright E2E 测试
├── public/                   # 公共静态资源
├── docs/                     # 文档站（VitePress）
├── scripts/                  # 开发脚本
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
├── electron-builder.json     # 打包配置
└── eslint.config.js          # ESLint 配置
```