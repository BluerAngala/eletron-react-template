# packages/ —— 可插拔功能包

每个功能是一个独立 workspace 包（`feature-<id>/`），自带页面、IPC、多语言，互不干扰。

| 包 | 说明 |
|----|------|
| `feature-contract/` | 宿主 ↔ 功能注册契约（稳定接口，不实现功能） |
| `feature-ai-chat/` | 可选功能：AI 聊天 |
| `feature-example/` | 最小功能示例 —— 写新模块时复制它 |

用法：

- 新增：`pnpm feature:new <id>`（自动生成骨架并接入宿主）
- 开关：改 `app/shared/features.ts` 的 `enabledFeatures`
- 开发手册：见 `docs/feature-development.md`
