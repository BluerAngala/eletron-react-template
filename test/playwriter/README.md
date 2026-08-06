# Playwriter 测试脚本

基于 [Playwriter](https://playwriter.dev/) 的浏览器自动化测试脚本集合。

## 目录结构

```
test/playwriter/
├── README.md                 # 本文件
├── SKILL.md                  # Playwriter 技能文件 (AI 操作指南)
├── deepseek-chat/            # DeepSeek Chat 自动化
│   ├── deepseek-chat.sh      # 主脚本
│   └── README.md             # 使用说明
├── [未来功能]/
│   └── ...
```

## 功能列表

| 功能 | 状态 | 说明 |
|------|------|------|
| [deepseek-chat](./deepseek-chat/) | ✅ 完成 | 自动化 DeepSeek Chat 对话 |

## 前提条件

1. **安装 Playwriter CLI**
   ```bash
   npm i -g playwriter
   ```

2. **安装浏览器扩展**
   - [Chrome/Edge 扩展](https://chromewebstore.google.com/detail/playwriter/jfeammnjpkecdekppnclgkkffahnhfhe)

3. **激活扩展**
   - 在浏览器中点击 Playwriter 扩展图标（变绿 = 已连接）

## 添加新功能

1. 在 `test/playwriter/` 下创建新文件夹
2. 添加主脚本和 README.md
3. 更新本文件的功能列表

## 参考

- [Playwriter 官方文档](https://playwriter.dev/)
- [Playwriter GitHub](https://github.com/remorses/playwriter)
