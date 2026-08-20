---
title: "主题系统"
description: "采用语义化 Token 架构，组件只用语义类名，不写死颜色值。"
---

# 主题系统

采用语义化 Token 架构，组件只用语义类名，不写死颜色值。

## 核心原则

**组件只用语义类名，不写死颜色值。** 加新主题只需改 CSS 变量，组件零改动。

## Token 流转

```
styles/tokens.css    →  --token-* 变量（按主题 class 切换）
styles/tailwind.css  →  @theme 注册为 Tailwind 值
组件                 →  bg-surface、text-foreground、border-border-default
```

## 可用 Token

| Tailwind 类名 | 用途 | 对应变量 |
|---|---|---|
| `bg-background` | 页面背景 | `--token-bg` |
| `bg-surface` | 卡片/侧边栏 | `--token-surface` |
| `bg-surface-hover` | 悬停状态 | `--token-surface-hover` |
| `text-foreground` | 主文字 | `--token-text` |
| `text-foreground-secondary` | 次要文字 | `--token-text-secondary` |
| `text-foreground-muted` | 弱化文字 | `--token-text-muted` |
| `border-border-default` | 边框 | `--token-border` |
| `bg-accent` / `text-accent` | 强调色 | `--token-accent` |
| `text-accent-foreground` | 强调色上文字 | `--token-accent-text` |
| `bg-accent-subtle` | 强调色浅底 | `--token-accent-subtle` |

## 默认主题

内置 `light` 和 `dark` 两套主题，均使用 **暖石 Warm Stone** 色板（暖灰背景 + 暗灰强调色）。

## 新增主题

在 `src/styles/tokens.css` 添加 class 块：

```css
html.sepia {
  --token-bg: #f5f0e8;
  --token-surface: #faf5ed;
  --token-text: #433422;
  --token-accent: #b08947;
}
```

## 主题切换

- 侧边栏切换 `light` / `dark` / `system`
- `ThemeContext` 切换 `html` 上的 class
- `index.html` 内联脚本防 FOUC
- `document.startViewTransition()` + `clip-path` 圆弧动画