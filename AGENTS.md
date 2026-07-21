# 仓库指南

基于 [electron-vite-react](https://github.com/electron-vite/electron-vite-react) 二次开发的 Electron + React 桌面应用模板。
技术栈：Electron 42 · React 19 · TypeScript 6 · Vite 8 · TailwindCSS v4 · pnpm

---

## 目录规范

```
src/                    渲染进程（React 组件、样式、类型）
  components/           可复用组件（每个组件一个目录，入口 index.tsx）
  demos/                功能演示代码（IPC、Node.js 调用等）
  type/                 全局类型定义（.d.ts）
  assets/               静态资源（SVG、图片）
electron/               主进程
  main/                 主进程逻辑（窗口、IPC、自动更新）
  preload/              Preload 脚本（contextBridge 暴露安全 API）
test/                   测试
  e2e/                  Playwright E2E 测试
  *.test.ts             Vitest 单元测试
public/                 公共静态资源（打包时原样复制）
docs/                   参考文档和模板存档
dev_docs/               开发日志（Build in Public）
```

**规则**：
- 新组件放 `src/components/<name>/index.tsx`，不要平铺到 `src/`
- 类型定义集中放 `src/type/`，不要散落在组件里
- Electron 主进程代码只放 `electron/`，渲染进程不要直接 import Node 模块

---

## 代码质量

### 当前状态
项目**尚未配置** ESLint、Prettier、Husky 等代码质量工具。提交前需手动检查。

### 推荐标准（待实施）
- **格式化**: Prettier（单引号、无分号、2 空格缩进）
- **Lint**: ESLint + `@typescript-eslint` + `eslint-plugin-react`
- **Git Hooks**: Husky + lint-staged（提交前自动格式化）
- **Commit**: 遵循 [Conventional Commits](https://www.conventionalcommits.org/)（`feat:` / `fix:` / `chore:`）

> 参考配置文件：`tsconfig.json`（严格模式已开启）

---

## 提交前预检清单

提交 GitHub 前，按顺序执行：

```bash
pnpm typecheck        # 1. TypeScript 类型检查（必须通过）
pnpm test             # 2. 单元测试
pnpm build            # 3. 确认构建不报错
```

**CI 会拦截的问题**（参见 `.github/workflows/`）：
- `pr-guard.yml`：禁止修改 lockfile（`pnpm-lock.yaml` 等由维护者管理）
- `ci.yml`：Markdown 文件变更时触发 markdownlint
- `build.yml`：push 到 main 时三平台（macOS/Linux/Windows）并行构建

---

## 开发命令速查

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发环境（Vite HMR + Electron） |
| `pnpm build` | 构建 + 打包（产物在 `release/`） |
| `pnpm test` | Vitest 单元测试 |
| `pnpm test:e2e` | Playwright E2E（先 build 再测试） |
| `pnpm typecheck` | TypeScript 类型检查 |

---

## IPC 通信约定

渲染进程通过 preload 暴露的 `window.ipcRenderer` 与主进程通信。

```typescript
// 渲染进程 → 主进程
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// 主进程监听
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

通道命名规范：`kebab-case`（如 `check-update`、`start-download`）

> 参考实现：`electron/main/update.ts`、`electron/preload/index.ts`、`src/components/update/index.tsx`

---

## 样式约定

- 使用 TailwindCSS v4 utility classes，不要写自定义 CSS（除非必要）
- 路径别名 `@/` → `src/`（配置在 `tsconfig.json` + `vite.config.ts`）
- 深色/浅色模式：禁止硬编码颜色值

> 参考：`src/index.css`（`@import "tailwindcss"` + `@theme` 自定义）

---

## 配置文件索引

| 文件 | 用途 |
|------|------|
| [`vite.config.ts`](vite.config.ts) | Vite + Electron 构建配置 |
| [`tsconfig.json`](tsconfig.json) | TypeScript 严格编译选项 |
| [`electron-builder.json`](electron-builder.json) | 打包发布配置 |
| [`vitest.config.ts`](vitest.config.ts) | 单元测试配置 |
| [`playwright.config.ts`](playwright.config.ts) | E2E 测试配置 |
| [`pnpm-workspace.yaml`](pnpm-workspace.yaml) | pnpm 工作空间 |
| [`.npmrc`](.npmrc) | npm 配置（shamefully-hoist） |
| [`.github/workflows/`](.github/workflows/) | CI/CD 流水线 |
