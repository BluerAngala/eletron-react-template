# IPC 通信

## 基本模式

```typescript
// 渲染进程 → 主进程
const result = await window.ipcRenderer.invoke('channel-name', ...args)

// 主进程监听
ipcMain.handle('channel-name', (event, ...args) => { ... })
```

## 插件相关通道

| 通道 | 方向 | 说明 |
|---|---|---|
| `plugin:market-list` | 渲染 → 主 | 获取插件市场列表 |
| `plugin:market-install` | 渲染 → 主 | 安装插件 |
| `plugin:market-cancel` | 渲染 → 主 | 取消下载 |
| `plugin:market-readme` | 渲染 → 主 | 获取插件 README |
| `plugin:list` | 渲染 → 主 | 列出已安装插件 |
| `plugin:delete` | 渲染 → 主 | 卸载插件 |
| `plugin:launch` | 渲染 → 主 | 启动插件 |
| `plugin:close` | 渲染 → 主 | 关闭插件 |
| `plugin:running` | 渲染 → 主 | 获取运行中插件 |
| `plugin:import-from-file` | 渲染 → 主 | 从文件导入插件 |

## 事件广播

| 事件 | 方向 | 说明 |
|---|---|---|
| `plugins-changed` | 主 → 渲染 | 插件列表变更通知 |
| `plugin-market-download-progress` | 主 → 渲染 | 下载进度更新 |