## Overview

React Router 路由系统，支持多页面导航和布局嵌套。

## Requirements

### 功能需求

1. **路由配置**
   - 集中路由配置文件 `src/routes/index.tsx`
   - 支持嵌套路由（布局 + 子页面）
   - 默认路由：首页

2. **导航**
   - 侧边栏导航菜单
   - 高亮当前激活的路由
   - 支持 `Link` 和 `useNavigate`

3. **示例页面**
   - 首页（现有 `App.tsx` 内容迁移）
   - 设置页（占位）
   - 关于页（占位）

### 技术需求

- `react-router-dom` v7
- 路由配置：`src/routes/index.tsx`
- 布局嵌套：`<AppLayout>` 包裹 `<Outlet />`

## Acceptance Criteria

- [ ] 侧边栏导航可切换页面
- [ ] 当前路由在侧边栏高亮
- [ ] 嵌套路由正确渲染
- [ ] 浏览器前进/后退正常工作
- [ ] 页面刷新后路由状态保持
