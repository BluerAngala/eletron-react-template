## Overview

深色/浅色主题切换功能，支持系统跟随、手动切换、持久化用户偏好。

## Requirements

### 功能需求

1. **三种主题模式**
   - `system` — 跟随操作系统（默认）
   - `light` — 强制浅色
   - `dark` — 强制深色

2. **主题切换 UI**
   - 顶栏右侧的主题切换按钮
   - 点击循环切换：system → light → dark → system
   - 显示当前模式图标（太阳/月亮/自动）

3. **持久化**
   - 用户选择的主题模式保存到 `localStorage`
   - 下次启动自动应用

4. **系统主题监听**
   - `system` 模式下监听 `prefers-color-scheme` 变化
   - 系统主题改变时实时切换

### 技术需求

- React Context 管理主题状态
- 在 `<html>` 元素上切换 `class="dark"`
- TailwindCSS v4 的 `dark:` 变体生效
- `ThemeContext` + `useTheme` hook

## Acceptance Criteria

- [ ] 默认跟随系统主题
- [ ] 手动切换后持久化，重启生效
- [ ] system 模式下系统主题改变时实时响应
- [ ] 主题切换无闪烁（FOUC）
- [ ] 所有页面的 `dark:` 样式正确生效
