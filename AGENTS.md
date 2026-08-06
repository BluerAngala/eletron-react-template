# 仓库指南

Electron + React + TypeScript 桌面应用模板。
技术栈：Electron · React · TypeScript · Vite · TailwindCSS v4 · pnpm · Biome

---

## 开发前

- **页面/组件开发前先出设计系统**：用 `ui-ux-pro-max` 生成（脚本：`python3 /Users/bluer/.agents/skills/ui-ux-pro-max/scripts/search.py "<产品类型> <风格>" --design-system -p "项目名"`）
- 其他可参考技能：`gpt-taste`、`design-taste-frontend`（位置：`/Users/bluer/.agents/skills/`）
- 设计红线：不用模板化样式、不用 Emoji 当图标（用 lucide-react）、不硬编码颜色、标题不超 6 行

## 实现约定

- 组件 → `src/components/<name>/index.tsx`（shadcn 原子组件可单文件 `src/components/ui/<name>.tsx`）；页面 → `src/pages/<Name>.tsx`；路由 → `src/routes/index.tsx` 注册
- IPC 通道：kebab-case
- 样式：Tailwind v4，不硬编码颜色
- **i18n**：新文案必须走 i18n（`src/locales/` 按命名空间拆分，组件用 `useTranslation('ns')`，新增语言在 `src/i18n/index.ts` 注册）
- **日志**：关键路径用统一 logger（`electron/main/logger.ts` 与 `src/lib/logger.ts` 的 `createLogger(scope)`），禁止裸 `console.log`；规范见 `docs/logging-standard.md`

## 目录

```
src/      components/ pages/ contexts/ i18n/ locales/ lib/ routes/
electron/ main/ preload/
test/     e2e/ + vitest
docs/     logging-standard.md
```

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


