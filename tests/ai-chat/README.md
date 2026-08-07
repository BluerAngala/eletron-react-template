# AI Chat 自动化脚本

通过 Playwriter 自动化各大 AI 平台的对话。

## 前置条件

1. 安装 Playwriter：`npm i -g playwriter`
2. Chrome 已登录对应 AI 平台（通义千问未登录也可匿名对话，但回复可能受限）
3. 启动 Playwriter 会话：`playwriter serve`

## 使用方式

```bash
# 豆包
node tests/ai-chat/doubao.mjs "解释一下量子计算"

# Kimi
node tests/ai-chat/kimi.mjs "帮我总结这篇文章"

# 元宝
node tests/ai-chat/yuanbao.mjs "用Python写一个爬虫"

# 通义千问
node tests/ai-chat/tongyi.mjs "翻译这段英文"

# 文心一言
node tests/ai-chat/wenxin.mjs "写一首诗"

# DeepSeek
node tests/ai-chat/deepseek.mjs "写一个冒泡排序"

# 统一入口
node tests/ai-chat/cli.mjs doubao "解释量子计算"
node tests/ai-chat/cli.mjs --list
```

默认使用 Playwriter 会话 1。若要指定其他会话（避免与其它任务抢占标签页）：

```bash
PW_SESSION=2 node tests/ai-chat/cli.mjs kimi "你好"
```

## 平台列表

| 平台 | 脚本 | 网址 |
|------|------|------|
| 豆包 | doubao.mjs | www.doubao.com |
| Kimi | kimi.mjs | www.kimi.com（原 moonshot.cn 已迁移） |
| 元宝 | yuanbao.mjs | yuanbao.tencent.com |
| 通义千问 | tongyi.mjs | www.qianwen.com |
| 文心一言 | wenxin.mjs | wenxin.baidu.com |
| DeepSeek | deepseek.mjs | chat.deepseek.com |

## 工作原理

1. Playwriter 连接到你已打开的 Chrome 浏览器（复用登录状态）
2. 导航到对应的 AI 平台（每个脚本使用独立标签页，不抢占其它任务）
3. 定位输入框并输入问题
4. 点击发送按钮（或回车）
5. 等待 AI 回复完成（停止按钮消失 + 内容稳定双重判断）
6. 从平台各自的回复容器提取内容并输出

## 实现说明

- 平台配置（URL / 输入框 / 发送按钮 / 回复容器选择器）集中在 `shared.mjs` 的 `PLATFORMS`，`cli.mjs` 与各平台脚本共用，修改一处即可。
- 回复提取只从平台自己的回复容器取（如豆包 `[data-message-id]`、DeepSeek `.ds-assistant-message-main-content`），不做全局兜底，避免抓到提示文案/按钮/思考链。
