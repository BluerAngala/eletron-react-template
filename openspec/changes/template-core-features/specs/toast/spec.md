## Overview

轻量级 Toast 通知系统，提供全局消息提示能力。

## Requirements

### 功能需求

1. **通知类型**
   - `success` — 成功（绿色）
   - `error` — 错误（红色）
   - `info` — 信息（蓝色）
   - `warning` — 警告（黄色）

2. **使用方式**
   - `toast.success('操作成功')` — 函数式调用
   - 支持自定义持续时间（默认 3 秒）
   - 支持手动关闭

3. **展示位置**
   - 默认右上角
   - 可配置位置（top-right, top-left, bottom-right, bottom-left）

4. **样式**
   - 跟随主题（深色/浅色）
   - 支持 TailwindCSS 自定义样式
   - 进入/退出动画

### 技术需求

- 使用 `sonner` 库
- 全局挂载 `<Toaster />` 在布局组件中
- 导出 `toast` 工具函数

## Acceptance Criteria

- [ ] `toast.success()` / `toast.error()` / `toast.info()` 可用
- [ ] 通知自动消失（默认 3 秒）
- [ ] 支持手动关闭
- [ ] 深色/浅色主题下样式正确
- [ ] 通知堆叠时正确排列
- [ ] 动画流畅
