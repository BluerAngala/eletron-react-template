# 插件系统

三层插件来源：**内置插件**（随应用打包）→ **插件市场**（ZTools 在线市场）→ **本地导入**（`.zpx`/`.zip`）。

## 插件来源

| 来源 | 路径 | 说明 |
|------|------|------|
| 内置插件 | `plugins/` | 随应用打包，自动注册，不可卸载 |
| 市场插件 | 在线下载 | 从 ZTools 市场安装到 `userData/plugins/` |
| 本地导入 | `.zpx`/`.zip` | 用户手动选择文件导入 |

同名插件，用户安装的版本优先于内置版本。

## 插件市场

- 分类浏览、搜索、一键安装/卸载
- 详情弹窗（README、指令列表）
- 5 分钟缓存，手动刷新清缓存

## 我的插件

- 启动/停止（独立 BrowserWindow，背景色固定白色）
- 卸载 / 导入 `.zpx`/`.zip`
- 内置插件显示 `内置` 标签

## 插件格式

- **ZPX**: ASAR 压缩格式，支持版本管理
- **ZIP**: 普通压缩包，根目录必须包含 `plugin.json`

## ZTools 兼容

插件通过 `window.ztools` 调用宿主 API，接口与 ZTools 完全一致：

```javascript
// 截图 → OCR
ztools.screenCapture(async (base64) => {
  const text = await ztools.ai({ prompt: '识别图片文字', messages: [...] })
  ztools.copyText(text)
})
```

支持的全部 API 见 [插件 API 参考](/plugin-dev/plugin-api)。

## 插件窗口

独立 BrowserWindow 运行，`backgroundColor: '#ffffff'` 不受宿主主题影响。