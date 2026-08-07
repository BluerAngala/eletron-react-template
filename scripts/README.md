# scripts/ —— 维护脚本

| 命令 | 脚本 | 用途 |
|------|------|------|
| `pnpm rename` | rename.mjs | 项目改名（name / appId / repo / README） |
| `pnpm icons` | generate-icons.mjs | 从 resources/assets/logo.svg 生成全套图标 |
| `pnpm feature:list` | feature.mjs | 列出可选功能模块 |
| `pnpm feature:new <id>` | new-feature.mjs | 生成新功能包骨架并自动接入宿主 |

约定：新脚本放这里，在 `package.json` 注册 `pnpm` 命令，并在上表加一行。
