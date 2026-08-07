# DeepSeek Chat 自动化脚本

通过 Playwriter CLI 自动化操作 DeepSeek Chat 页面。

## 功能特性

- ✅ **自动打开页面** - 自动导航到 DeepSeek Chat
- ✅ **登录状态检测** - 验证是否已登录，未登录则提示退出
- ✅ **新建对话** - 自动点击"开启新对话"
- ✅ **发送问题** - 输入并发送问题
- ✅ **获取回复** - 提取 DeepSeek 的回复内容

## 前提条件

1. **安装 Playwriter CLI**
   ```bash
   npm i -g playwriter
   ```

2. **安装浏览器扩展**
   - [Chrome 扩展](https://chromewebstore.google.com/detail/playwriter/jfeammnjpkecdekppnclgkkffahnhfhe)
   - Edge 也可用同一扩展

3. **激活扩展**
   - 打开浏览器
   - 点击 Playwriter 扩展图标（变绿 = 已连接）

## 使用方法

```bash
# 进入脚本目录
cd tests/playwriter/deepseek-chat

# 基础用法
./deepseek-chat.sh "你好，你是谁"

# 使用环境变量指定会话 ID
PW_SESSION=1 ./deepseek-chat.sh "解释一下量子计算"

# 保存输出到文件
./deepseek-chat.sh "什么是机器学习" > answer.md
```

## 脚本流程

```
0️⃣  检查 Playwriter 连接状态
      ↓
1️⃣  打开 DeepSeek Chat 页面
      ↓
2️⃣  检测登录状态
      ├─ ✅ 已登录 → 继续
      └─ ❌ 未登录 → 提示登录并退出
      ↓
3️⃣  点击「开启新对话」
      ↓
4️⃣  输入问题到文本框
      ↓
5️⃣  按 Enter 发送
      ↓
6️⃣  等待 DeepSeek 回复 (最多 30 秒)
      ↓
7️⃣  提取并输出回复内容
```

## 登录状态检测

脚本会检测以下指标来判断是否已登录：

| 检测项 | 说明 |
|--------|------|
| 输入框 | 是否有消息输入框 |
| 新建对话 | 是否有"开启新对话"按钮 |
| 用户信息 | 是否显示用户名 (如 "bluer") |
| 聊天记录 | 是否有历史对话记录 |
| URL 有效性 | 是否在 chat.deepseek.com |
| 非登录页 | 是否不是登录/注册页面 |

**未登录时的提示：**
```
❌ 未登录或登录状态异常！
请先在浏览器中登录 DeepSeek 账号:
   🔗 https://chat.deepseek.com
```

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `$1` | 要问的问题（必填） | - |
| `PW_SESSION` | Playwriter 会话 ID | `2` |

## 输出示例

```
🚀 DeepSeek Chat 自动化
━━━━━━━━━━━━━━━━━━━━━━━━
📝 问题: 5+5等于几
🔗 会话ID: 2

0️⃣  检查 Playwriter 连接状态...
✅ Playwriter 已连接

1️⃣  打开 DeepSeek Chat 页面...
✅ 已在 DeepSeek Chat 页面

2️⃣  检测登录状态...
=== 登录状态检测 ===
输入框: ✅ 有
新建对话: ✅ 有
用户信息: ✅ 有
聊天记录: ✅ 有
URL有效: ✅ 是
非登录页: ✅ 是
====================
STATUS:LOGGED_IN

✅ 登录状态验证通过！
   用户: bluer
   平台: DeepSeek Chat
   时间: 2026-08-06 23:42:19

3️⃣  点击「开启新对话」...
✅ 新对话已创建
4️⃣  输入问题...
✅ 问题已输入
5️⃣  发送消息...
✅ 消息已发送
6️⃣  等待 DeepSeek 回复...
✅ 回复已就绪
7️⃣  获取回复内容...
━━━━━━━━━━━━━━━━━━━━━━━━
5+5等于10。
━━━━━━━━━━━━━━━━━━━━━━━━
✅ 完成！
📅 时间: 2026-08-06 23:42:24
```

## 注意事项

- 确保浏览器已打开且 Playwriter 扩展已激活
- 如果使用不同的会话 ID，需设置 `PW_SESSION` 环境变量
- 脚本会自动等待回复，超时时间约 30 秒
- 首次使用需在浏览器中手动登录 DeepSeek
