# plugin.json 配置

`plugin.json` 是插件最核心的配置文件，定义了插件如何与宿主应用集成。

## 完整示例

```json
{
  "name": "example",
  "title": "示例插件",
  "description": "这是一个示例插件",
  "version": "1.0.0",
  "main": "index.html",
  "logo": "logo.png",
  "preload": "preload.js",
  "features": [
    {
      "code": "hello",
      "explain": "hello world",
      "cmds": ["hello", "你好"]
    }
  ]
}
```

## 基础字段

### `name`
- **类型**: `string` **必填**: 是
- 插件唯一标识（ID），用于在系统中唯一标识该插件。命名建议使用小写英文 + 连字符（如 `my-plugin`）。

### `title`
- **类型**: `string` **必填**: 是
- 插件显示名称，展示给用户看的标题。

### `description`
- **类型**: `string` **必填**: 否
- 插件描述，显示在插件详情中。

### `version`
- **类型**: `string` **必填**: 否
- 插件版本号，遵循语义化版本规范（如 `1.0.0`）。

### `main`
- **类型**: `string` **必填**: 是
- 插件入口文件，可以是一个相对于 `plugin.json` 的相对路径的 `.html` 文件，或者是一个在线地址。

### `logo`
- **类型**: `string` **必填**: 是
- 插件图标，必须为 PNG 或 JPG 文件。

### `preload`
- **类型**: `string` **必填**: 是
- 预加载 JS 文件，可在此文件内调用 Node.js 和 Electron 提供的 API。详见 [Preload 脚本指南](./preload-js.md)。

## 功能字段

### `features`
- **类型**: `Array<Feature>` **必填**: 否
- 插件功能列表，定义插件支持的功能及其触发方式。

### `feature.code`
- 功能唯一标识，用于区分不同功能。

### `feature.explain`
- 功能说明，显示在搜索结果中。

### `feature.cmds`
- 触发指令列表。可以是简单的字符串，也可以是匹配对象。

### `feature.platform`
- **必填**: 否
- 支持的平台，可选值：`win32`、`darwin`、`linux`。不填则默认支持所有平台。

## 指令类型

### 文本指令（String）
最简单的触发方式，用户输入完全匹配该文本时触发：

```json
{
  "cmds": ["hello", "你好"]
}
```

### 正则表达式指令
```json
{
  "cmds": [{
    "type": "regex",
    "label": "颜色预览",
    "match": "/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/i",
    "minLength": 4
  }]
}
```

### 全局匹配指令
匹配任意文本，适用于翻译、搜索等插件：

```json
{
  "cmds": [{
    "type": "over",
    "label": "翻译",
    "exclude": "/^exclude/i",
    "minLength": 1,
    "maxLength": 1000
  }]
}
```

### 图片匹配指令
用户粘贴图片时触发：

```json
{
  "cmds": [{
    "type": "img",
    "label": "图片处理"
  }]
}
```

### 文件匹配指令
用户粘贴文件或文件夹时触发：

```json
{
  "cmds": [{
    "type": "files",
    "label": "批量重命名",
    "fileType": "file",
    "extensions": ["txt", "md", "json"],
    "minLength": 1,
    "maxLength": 100
  }]
}
```