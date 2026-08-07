# feature-example —— 最小功能示例

演示一个可插拔功能包的完整结构（页面 + IPC + 多语言 + 契约）。

写你自己的模块时：

1. 复制本目录为 `feature-<你的id>`
2. 改 `package.json` 的 name
3. 把 `renderer.tsx` 里的示例换成你的页面
4. 更省事的做法：用 `pnpm feature:new <id>` 从零生成骨架

结构：`src/renderer.tsx`（页面）、`src/main/`（主进程 IPC）、`src/preload/`（桥）、`src/shared/`（协议）、`src/locales/`（文案）。
