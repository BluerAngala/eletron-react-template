# 仓库指南

Electron + React + TypeScript 桌面应用模板。
技术栈：Electron · React · TypeScript · Vite · TailwindCSS v4 · pnpm · Biome

---

## 开发前

- **页面/组件开发前先出设计系统**：用 `ui-ux-pro-max` 生成（脚本：`python3 /Users/bluer/.agents/skills/ui-ux-pro-max/scripts/search.py "<产品类型> <风格>" --design-system -p "项目名"`）
- 其他可参考技能：`gpt-taste`、`design-taste-frontend`（位置：`/Users/bluer/.agents/skills/`）
- 设计红线：不用模板化样式、不用 Emoji 当图标（用 lucide-react）、不硬编码颜色、标题不超 6 行

## 实现约定

- 组件 → `app/renderer/components/<name>/index.tsx`（shadcn 原子组件可单文件 `app/renderer/components/ui/<name>.tsx`）；页面 → `app/renderer/pages/<Name>.tsx`；路由 → `app/renderer/routes/index.tsx` 注册
- IPC 通道：kebab-case
- 样式：Tailwind v4，不硬编码颜色
- **i18n**：新文案必须走 i18n（`app/renderer/locales/` 按命名空间拆分，组件用 `useTranslation('ns')`，新增语言在 `app/renderer/i18n/index.ts` 注册）
- **日志**：关键路径用统一 logger（`app/electron/main/logger.ts` 与 `app/renderer/lib/logger.ts` 的 `createLogger(scope)`），禁止裸 `console.log`；规范见 `docs/logging-standard.md`

## 目录

```
app/       宿主应用源码（唯一源码入口，新代码一律放这里）
	renderer/ React 页面、组件、i18n、路由与功能加载入口
	electron/ Electron main、preload 与 IPC
	shared/   跨进程共享配置
packages/  可插拔功能包（pnpm feature:add|remove 一键增删）
	feature-contract/ 宿主↔功能注册契约（稳定）
	feature-ai-chat/  可选功能实现（AI）
resources/ assets/ 源图与 public/ 静态资源
scripts/   项目脚本（rename / icons / feature）
tests/     Vitest、E2E 与自动化脚本
docs/      规范与架构决策
```

根目录其余成员（`build/`、`dist/`、`dist-electron/`、`release/`、`test-results/`）都是构建/测试产物，自动生成、可随时删除，一律不要手动改。

## 质量检查

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

- Biome（lint + format）：`pnpm lint` / `pnpm lint:fix` / `pnpm format` / `pnpm format:check`
- CI 会强制同样检查（`.github/workflows/quality.yml`），不过不给推送合并

## 发布

打 `v*` 标签触发 `.github/workflows/release.yml`，三平台打包发布 GitHub Release：

```bash
pnpm version patch   # 或 minor / major
git push --tags
```

## 配置索引

| 文件 | 用途 |
|------|------|
| `vite.config.ts` | Vite + Electron 构建 |
| `tsconfig.json` | TS 编译 |
| `electron-builder.json` | 打包发布 |
| `biome.json` | Biome 配置 |
| `.github/workflows/` | CI/CD（quality / release） |


