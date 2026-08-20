# 插件 API 参考

插件通过全局对象 `window.ztools` 访问宿主应用提供的 API。

## 基础 API

### `ztools.getAppName()`
获取应用名称。

- **返回**: `string` — 固定返回 `'ZTools'`。

### `ztools.getAppVersion()`
获取应用版本号。

- **返回**: `string` — 应用版本号。

### `ztools.getPlatform()`
获取当前操作系统平台。

- **返回**: `string` — `'darwin'` | `'win32'` | `'linux'`。

### `ztools.isMacOs()` / `ztools.isMacOS()`
检测当前是否为 macOS 系统。

- **返回**: `boolean`

### `ztools.isWindows()`
检测当前是否为 Windows 系统。

- **返回**: `boolean`

### `ztools.isLinux()`
检测当前是否为 Linux 系统。

- **返回**: `boolean`

### `ztools.isDev()`
检查当前插件是否处于开发模式。

- **返回**: `boolean`

### `ztools.getWebContentsId()`
获取当前 WebContents ID。

- **返回**: `number`

### `ztools.getPathForFile(file)`
获取拖放文件的真实路径。

- **file**: `File` — 拖放事件中的 File 对象。
- **返回**: `string` — 文件的本地路径。

### `ztools.getPath(name)`
获取系统特殊路径。

- **name**: `string` — 路径名称（如 `'home'`、`'desktop'`、`'documents'` 等）。
- **返回**: `string` — 路径。

## 通知 API

### `ztools.showNotification(body)`
显示系统通知。

- **body**: `string` — 通知内容。

### `ztools.showToast(message, options)`
显示 Toast 提示。

- **message**: `string` — 提示消息。
- **options**: `object` — (可选) 配置项。

## 剪贴板 API

### `ztools.copyText(text)`
复制文本到剪贴板。

- **text**: `string` — 要复制的文本。
- **返回**: `boolean`

### `ztools.copyImage(image)`
复制图片到剪贴板。

- **image**: `string` — 图片 base64 Data URL 或文件路径。
- **返回**: `boolean`

### `ztools.copyFile(filePath)`
复制文件到剪贴板。

- **filePath**: `string` — 文件路径。
- **返回**: `boolean`

### `ztools.getCopyedFiles()`
获取已复制的文件列表。

- **返回**: `string[]`

## Shell API

### `ztools.shellOpenExternal(url)`
使用系统默认程序打开 URL。

- **url**: `string` — 要打开的 URL。
- **返回**: `boolean`

### `ztools.shellOpenPath(fullPath)`
使用系统默认方式打开文件或文件夹。

- **fullPath**: `string` — 文件或文件夹路径。
- **返回**: `boolean`

### `ztools.shellShowItemInFolder(fullPath)`
在文件管理器中显示文件。

- **fullPath**: `string` — 文件路径。
- **返回**: `boolean`

### `ztools.shellBeep()`
播放系统提示音。

## 对话框 API

### `ztools.showOpenDialog(options)`
弹出文件打开对话框。

- **options**: `object` — 对话框配置，与 Electron `showOpenDialogSync` 保持一致。
- **返回**: `string[] | undefined` — 选择的文件路径数组。用户取消则返回 `undefined`。

### `ztools.showSaveDialog(options)`
弹出文件保存对话框。

- **options**: `object` — 对话框配置，与 Electron `showSaveDialogSync` 保持一致。
- **返回**: `string | undefined` — 选择的路径。用户取消则返回 `undefined`。

## 窗口 API

### `ztools.createBrowserWindow(url, options, callback)`
创建独立子窗口。

- **url**: `string` — 窗口加载的 URL。
- **options**: `object` — 窗口选项，与 Electron `BrowserWindow` 构造函数选项保持一致。
- **callback**: `() => void` — (可选) 窗口加载完成后的回调函数。
- **返回**: `number | null` — 窗口 ID，创建失败返回 `null`。

### `ztools.outPlugin(isKill)`
退出插件应用。

- **isKill**: `boolean` — (可选) 为 `true` 时将结束进程。
- **返回**: `Promise<boolean>`

## 事件 API

### `ztools.onPluginEnter(callback)`
监听插件进入事件。当用户打开插件时触发。

- **callback**: `(param: LaunchParam) => void`

**LaunchParam 结构**:
- `payload`: `any` — 传递的数据
- `type`: `'text' | 'regex' | 'over'` — 命令类型
- `code`: `string` — 插件 Feature Code

### `ztools.onPluginReady(callback)`
兼容旧 API，功能与 `onPluginEnter` 相同。

### `ztools.onPluginOut(callback)`
监听插件退出事件。

- **callback**: `(isKill: boolean) => void`

## 显示器 API

### `ztools.getPrimaryDisplay()`
获取主显示器信息。

- **返回**: `object`

### `ztools.getAllDisplays()`
获取所有显示器。

- **返回**: `object[]`

### `ztools.getCursorScreenPoint()`
获取鼠标光标的屏幕坐标。

- **返回**: `{ x: number, y: number }`

## 数据库 API

插件拥有独立的数据库存储空间（Bucket），以插件名称隔离。

### `ztools.db.put(doc)`
保存数据。

- **doc**: `object` — 必须包含 `_id` 字段。
- **返回**: `object`

### `ztools.db.get(id)`
获取数据。

- **id**: `string` — 文档 ID。
- **返回**: `object | null`

### `ztools.db.remove(docOrId)`
删除数据。

- **docOrId**: `object | string` — 文档对象或文档 ID。
- **返回**: `object`

### `ztools.db.bulkDocs(docs)`
批量操作文档。

- **docs**: `object[]`
- **返回**: `object[]`

### `ztools.db.allDocs(key)`
获取所有文档或按 key 前缀查询。

- **key**: `string` — (可选) 文档 ID 前缀。
- **返回**: `object[]`

### `ztools.db.postAttachment(id, attachment, type)`
为文档添加附件。

- **id**: `string` — 文档 ID。
- **attachment**: `string | Buffer` — 附件内容。
- **type**: `string` — MIME 类型。

### `ztools.db.getAttachment(id)`
获取文档附件。

- **id**: `string` — 文档 ID。
- **返回**: `Buffer`

### `ztools.db.getAttachmentType(id)`
获取文档附件的 MIME 类型。

- **id**: `string` — 文档 ID。
- **返回**: `string`

### Promise API

数据库 API 还提供了 Promise 版本，位于 `window.ztools.db.promises` 下：

```javascript
await window.ztools.db.promises.put(doc)
await window.ztools.db.promises.get(id)
await window.ztools.db.promises.remove(docOrId)
await window.ztools.db.promises.bulkDocs(docs)
await window.ztools.db.promises.allDocs(key)
```

## 简易存储 API

类似 `localStorage` 的简化接口。

### `ztools.dbStorage.setItem(key, value)`
保存数据。

- **key**: `string` — 键名。
- **value**: `any` — 会自动序列化为 JSON。

### `ztools.dbStorage.getItem(key)`
获取数据。

- **key**: `string` — 键名。
- **返回**: `any`

### `ztools.dbStorage.removeItem(key)`
删除数据。

- **key**: `string` — 键名。

## 插件上下文

插件可以通过 `window.__PLUGIN_CONTEXT__` 获取自身信息：

```javascript
console.log(window.__PLUGIN_CONTEXT__)
// { name: "my-plugin", path: "/path/to/plugin" }
```