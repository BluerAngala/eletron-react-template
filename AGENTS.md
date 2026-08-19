# 仓库指南

基于 [electron-vite-react](https://github.com/electron-vite/electron-vite-react) 二次开发的 Electron + React 桌面应用模板。
技术栈：Electron 42 · React 19 · TypeScript 6 · Vite 8 · TailwindCSS v4 · pnpm

---

## 开发工作流（必须遵守）

### 1. 规划阶段

任何新功能、页面、组件开发前，必须先做规划，谋定后动。


### 2. 设计阶段：UI/UX 设计系统

前端页面/组件开发前，**必须先用设计技能生成设计系统**，禁止直接写代码。

**技能优先级**：
1. **`ui-ux-pro-max`** — 生成设计系统（配色、排版、风格、UX 规范）
2. **`gpt-taste`** — Awwwards 级别的设计工程（GSAP 动效、AIDA 结构、Bento 网格）
3. **`design-taste-frontend`** — 反模板化前端设计

**工作流**：
```bash
# 生成设计系统
python3 skills/ui-ux-pro-max/scripts/search.py "<产品类型> <风格>" --design-system -p "项目名"

# 查询具体领域
python3 skills/ui-ux-pro-max/scripts/search.py "<关键词>" --domain <style|color|typography|ux|landing>
```

**设计红线**：
- ❌ 禁止默认模板样式（无设计感的卡片、无聊的布局）
- ❌ 禁止 Emoji 作为图标（用 SVG）
- ❌ 禁止硬编码颜色值（用 CSS 变量或 Tailwind）
- ❌ 禁止 6 行以上的标题文字墙
- ✅ 必须有视觉层次、间距节奏、微交互动效
- ✅ 必须遵循 AIDA 结构（Attention → Interest → Desire → Action）

> 技能参考：`skill://ui-ux-pro-max`、`skill://gpt-taste`、`skill://design-taste-frontend`

### 3. 实现阶段：代码规范

规划和设计完成后，按以下规范实现：

- 新组件放 `src/components/<name>/index.tsx`
- 类型定义集中放 `src/type/`
- IPC 通道命名：`kebab-case`
- 样式：TailwindCSS v4，禁止硬编码颜色
- 提交前：`pnpm typecheck && pnpm lint && pnpm format:check`

---

## 目录规范

```
src/                    渲染进程（React 组件、样式、类型）
  components/           可复用组件（每个组件一个目录，入口 index.tsx）
  demos/                功能演示代码
  type/                 全局类型定义（.d.ts）
  assets/               静态资源（SVG、图片）
electron/               主进程
  main/                 主进程逻辑（窗口、IPC、自动更新）
  preload/              Preload 脚本（contextBridge）
test/                   测试
  e2e/                  Playwright E2E
  *.test.ts             Vitest 单元测试
public/                 公共静态资源
docs/                   参考文档和模板存档
dev_docs/               开发日志（Build in Public）
```

---

## 代码质量工具

| 工具 | 命令 | 用途 |
|------|------|------|
| ESLint | `pnpm lint` / `pnpm lint:fix` | 代码检查 |
| Prettier | `pnpm format` / `pnpm format:check` | 格式化 |
| TypeScript | `pnpm typecheck` | 类型检查 |
| Vitest | `pnpm test` | 单元测试 |
| Playwright | `pnpm test:e2e` | E2E 测试 |

**提交前预检**：
```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

---

## IPC 通信约定

```typescript
// 渲染进程 → 主进程
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// 主进程监听
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

> 参考：`electron/main/update.ts`、`electron/preload/index.ts`、`src/components/update/index.tsx`

---

## 主题系统

### 配色方案

| 模式 | 基础色 | CSS 变量 | 渐变光晕 |
|------|--------|----------|----------|
| 浅色 | `#faf8f5`（暖白） | `--color-warm-white` | 琥珀/橙色淡光晕 |
| 暗色 | `slate-900` | Tailwind 内置 | 蓝色调光晕 |

### 暖白色板（`index.css` @theme）

```css
--color-warm-white: #faf8f5;
--color-warm-50: #f7f4ef;
--color-warm-100: #f0ece4;
--color-warm-200: #e4ddd2;
```

### 暗色模式规范

- TailwindCSS v4 class 策略：`@custom-variant dark (&:where(.dark, .dark *));`
- 每个颜色工具类**必须**配对 `dark:` 变体
- 基础样式（背景、滚动条、代码块）在 `index.css` 的 `html.dark` 选择器中定义
- 切换动画：`document.startViewTransition()` + `clip-path: circle()` 从左下角扩散

### 新组件暗色模式清单

```tsx
// ✅ 正确：配对 dark 变体
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">

// ❌ 错误：只有浅色
<div className="bg-white text-slate-900 border-slate-200">
```

---

## 国际化

- 支持语言：`zh-CN`（中文）、`en-US`（English）
- 翻译键定义在 `src/contexts/LanguageContext.tsx`
- 使用方式：`const { t } = useLanguage(); t('sidebar.home')`
- 新增翻译键**必须**同时添加中英文

---

## 配置文件索引

| 文件 | 用途 |
|------|------|
| [`vite.config.ts`](vite.config.ts) | Vite + Electron 构建配置 |
| [`tsconfig.json`](tsconfig.json) | TypeScript 严格编译选项 |
| [`electron-builder.json`](electron-builder.json) | 打包发布配置 |
| [`eslint.config.js`](eslint.config.js) | ESLint 配置 |
| [`.prettierrc`](.prettierrc) | Prettier 配置 |
| [`.github/workflows/`](.github/workflows/) | CI/CD 流水线 |
