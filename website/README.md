# website/ —— 文档网站（Docusaurus）

独立的文档站点：落地页 + 使用说明 + SEO，部署在 GitHub Pages（`/eletron-react-template/`）。

- 启动：`cd website && pnpm install --ignore-workspace && pnpm dev`
- 构建：`pnpm build`（产物在 build/，已被 gitignore）
- 部署：push 到 main 后 `.github/workflows/deploy-docs.yml` 自动发布
- 内容：`docs/`（中文使用说明）、`i18n/en/`（英文）、`src/pages/`（落地页）

> 这是独立子项目，不属于 pnpm workspace，install 时用 `--ignore-workspace`。
