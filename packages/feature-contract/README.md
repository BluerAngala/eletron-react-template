# feature-contract —— 宿主 ↔ 功能注册契约

定义功能包必须实现的三个接口（不包含任何实现）：

- `RendererFeatureRegistration`：渲染层 —— routes / navigation / fullBleedPaths / locales
- `MainFeatureRegistration`：主进程 —— initialize()
- `PreloadFeatureRegistration`：preload —— expose()

功能包通过这三个接口把自己"插"进宿主；宿主只认契约，不认具体实现。

新增功能请参照 `feature-example`。**不要直接改这里**（契约要保持稳定）。
