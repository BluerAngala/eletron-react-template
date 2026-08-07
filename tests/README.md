# tests/ —— 测试

| 目录 / 文件 | 说明 |
|-------------|------|
| `unit/` | Vitest 单元测试 |
| `e2e/` | Playwright 端到端测试 |
| `ai-chat/` | AI 平台自动化脚本（deepseek / kimi / tongyi / wenxin / doubao / yuanbao） |
| `automation/` | 浏览器自动化 |
| `playwriter/` | Playwriter 技能（操作浏览器） |
| `*.test.ts` | 顶层测试（features / index） |

运行：`pnpm test`（单元）、`pnpm test:e2e`（端到端）。CI（`.github/workflows/quality.yml`）会自动跑。
