## Tasks

### Phase 1: 依赖安装

- [ ] 1.1 安装 `electron-store`（主进程数据持久化）
- [ ] 1.2 安装 `react-router-dom`（路由）
- [ ] 1.3 安装 `sonner`（Toast 通知）
- [ ] 1.4 安装 `lucide-react`（图标库，侧边栏和按钮用）

### Phase 2: 窗口状态持久化

- [ ] 2.1 在 `electron/main/index.ts` 中集成 `electron-store`
- [ ] 2.2 实现窗口状态保存逻辑（`close` 事件）
- [ ] 2.3 实现窗口状态恢复逻辑（`createWindow`）
- [ ] 2.4 添加边界保护（屏幕范围检测、最小尺寸）

### Phase 3: 主题系统

- [ ] 3.1 创建 `src/contexts/ThemeContext.tsx`（主题 Context + Provider）
- [ ] 3.2 实现三种模式：system / light / dark
- [ ] 3.3 实现系统主题监听（`matchMedia`）
- [ ] 3.4 实现 localStorage 持久化
- [ ] 3.5 在 `src/index.css` 添加防 FOUC 脚本
- [ ] 3.6 更新 `index.html` 添加防 FOUC 脚本

### Phase 4: 全局布局

- [ ] 4.1 创建 `src/components/layout/AppLayout.tsx`（主布局）
- [ ] 4.2 创建 `src/components/layout/Sidebar.tsx`（侧边栏）
- [ ] 4.3 创建 `src/components/layout/TopBar.tsx`（顶栏）
- [ ] 4.4 实现侧边栏折叠/展开 + 动画
- [ ] 4.5 实现折叠状态持久化
- [ ] 4.6 适配 macOS 红绿灯区域
- [ ] 4.7 添加主题切换按钮到顶栏

### Phase 5: 路由系统

- [ ] 5.1 创建 `src/routes/index.tsx`（路由配置）
- [ ] 5.2 创建首页 `src/pages/Home.tsx`（迁移现有 App 内容）
- [ ] 5.3 创建设置页 `src/pages/Settings.tsx`（占位）
- [ ] 5.4 创建关于页 `src/pages/About.tsx`（占位）
- [ ] 5.5 侧边栏导航菜单集成路由
- [ ] 5.6 高亮当前激活路由

### Phase 6: 错误边界 + Toast

- [ ] 6.1 创建 `src/components/ErrorBoundary.tsx`
- [ ] 6.2 在路由最外层包裹 ErrorBoundary
- [ ] 6.3 在布局中挂载 `<Toaster />`
- [ ] 6.4 导出 `toast` 工具函数

### Phase 7: 收尾

- [ ] 7.1 运行 `pnpm typecheck` 确保类型正确
- [ ] 7.2 运行 `pnpm lint` 修复 lint 问题
- [ ] 7.3 运行 `pnpm dev` 验证功能
- [ ] 7.4 更新 AGENTS.md（如有新的约定）
- [ ] 7.5 提交推送
