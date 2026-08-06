#!/bin/bash
# DeepSeek Chat 自动化脚本
# 用法: ./deepseek-chat.sh "你的问题"
# 功能:
#   1. 自动打开 DeepSeek Chat 页面
#   2. 检测登录状态，已登录则记录验证信息
#   3. 未登录则提示用户登录并退出
#   4. 自动新建对话、发送问题、获取回复

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
  echo -e "${RED}❌ 用法: $0 \"你的问题\"${NC}"
  echo -e "   示例: $0 \"你好，你是谁\""
  exit 1
fi

QUESTION="$1"
SESSION_ID="${PW_SESSION:-2}"  # 默认使用会话 2，可通过 PW_SESSION 环境变量覆盖
DEEPSEEK_URL="https://chat.deepseek.com"

echo -e "${BLUE}🚀 DeepSeek Chat 自动化${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "📝 问题: ${YELLOW}$QUESTION${NC}"
echo -e "🔗 会话ID: $SESSION_ID"
echo ""

# ============================================
# 步骤 0: 检查 Playwriter 扩展连接状态
# ============================================
echo -e "${BLUE}0️⃣  检查 Playwriter 连接状态...${NC}"

# 获取会话列表，检查是否有活跃的浏览器连接
SESSION_LIST=$(playwriter session list 2>&1)
if ! echo "$SESSION_LIST" | grep -q "Edge\|Chrome"; then
  echo -e "${RED}❌ 错误: 没有检测到活跃的浏览器连接${NC}"
  echo -e "${YELLOW}请确保:${NC}"
  echo "   1. 已安装 Playwriter 扩展"
  echo "   2. 在浏览器中点击了 Playwriter 扩展图标（图标变绿）"
  echo "   3. 浏览器已打开"
  exit 1
fi
echo -e "${GREEN}✅ Playwriter 已连接${NC}"

# ============================================
# 步骤 1: 打开 DeepSeek Chat 页面
# ============================================
echo ""
echo -e "${BLUE}1️⃣  打开 DeepSeek Chat 页面...${NC}"

playwriter -s "$SESSION_ID" -e '
  const currentUrl = page.url();
  
  // 如果当前不在 DeepSeek 页面，则导航过去
  if (!currentUrl.includes("chat.deepseek.com")) {
    console.log("📍 当前不在 DeepSeek，正在导航...");
    await page.goto("'${DEEPSEEK_URL}'", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    console.log("✅ 已打开 DeepSeek Chat");
  } else {
    console.log("✅ 已在 DeepSeek Chat 页面");
  }
  
  // 记录当前 URL 用于验证
  console.log("📍 当前URL: " + page.url());
'

# ============================================
# 步骤 2: 检测登录状态
# ============================================
echo ""
echo -e "${BLUE}2️⃣  检测登录状态...${NC}"

LOGIN_CHECK=$(playwriter -s "$SESSION_ID" -e '
  const content = await getPageMarkdown({ page, showDiffSinceLastCall: false });
  const currentUrl = page.url();
  
  // 使用多种方法检测登录状态
  const loginIndicators = {
    // 方法1: 检查是否有输入框（通过 getByRole）
    hasInputBox: await page.getByRole("textbox").count() > 0,
    
    // 方法2: 检查是否有 "开启新对话" 按钮
    hasNewChat: content.includes("开启新对话"),
    
    // 方法3: 检查是否有用户标识
    hasUserProfile: content.includes("bluer"),
    
    // 方法4: 检查是否有聊天记录
    hasChatHistory: content.includes("今天") || content.includes("昨天") || content.includes("7 天内"),
    
    // 方法5: URL 有效性
    urlIsValid: currentUrl.includes("chat.deepseek.com"),
    
    // 方法6: 检查是否没有登录页面特征（登录页面通常有大按钮和表单）
    noLoginPage: !content.includes("手机号") && !content.includes("验证码") && !content.includes("微信登录")
  };
  
  // 判断是否已登录：核心指标是输入框和新建对话按钮
  const isLoggedIn = loginIndicators.hasInputBox && 
                     loginIndicators.hasNewChat && 
                     loginIndicators.urlIsValid &&
                     loginIndicators.noLoginPage;
  
  // 输出检测结果
  console.log("=== 登录状态检测 ===");
  console.log("输入框: " + (loginIndicators.hasInputBox ? "✅ 有" : "❌ 无"));
  console.log("新建对话: " + (loginIndicators.hasNewChat ? "✅ 有" : "❌ 无"));
  console.log("用户信息: " + (loginIndicators.hasUserProfile ? "✅ 有" : "❌ 无"));
  console.log("聊天记录: " + (loginIndicators.hasChatHistory ? "✅ 有" : "❌ 无"));
  console.log("URL有效: " + (loginIndicators.urlIsValid ? "✅ 是" : "❌ 否"));
  console.log("非登录页: " + (loginIndicators.noLoginPage ? "✅ 是" : "❌ 否"));
  console.log("====================");
  
  if (isLoggedIn) {
    console.log("STATUS:LOGGED_IN");
  } else {
    console.log("STATUS:NOT_LOGGED_IN");
  }
' 2>&1)

echo "$LOGIN_CHECK"

# 检查登录状态
if echo "$LOGIN_CHECK" | grep -q "STATUS:LOGGED_IN"; then
  echo ""
  echo -e "${GREEN}✅ 登录状态验证通过！${NC}"
  echo -e "${GREEN}   用户: bluer${NC}"
  echo -e "${GREEN}   平台: DeepSeek Chat${NC}"
  echo -e "${GREEN}   时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
else
  echo ""
  echo -e "${RED}❌ 未登录或登录状态异常！${NC}"
  echo -e "${YELLOW}请先在浏览器中登录 DeepSeek 账号:${NC}"
  echo -e "   🔗 ${BLUE}${DEEPSEEK_URL}${NC}"
  echo ""
  echo -e "${YELLOW}登录后请确保:${NC}"
  echo "   1. 看到输入框「给 DeepSeek 发送消息」"
  echo "   2. 看到左侧「开启新对话」按钮"
  echo "   3. Playwriter 扩展图标变绿（已激活）"
  echo ""
  echo -e "${RED}脚本退出。${NC}"
  exit 1
fi

# ============================================
# 步骤 3: 点击新建对话
# ============================================
echo ""
echo -e "${BLUE}3️⃣  点击「开启新对话」...${NC}"

playwriter -s "$SESSION_ID" -e '
  await page.locator("text=开启新对话").click();
  await page.waitForTimeout(1000);
  console.log("✅ 新对话已创建");
'

# ============================================
# 步骤 4: 输入问题
# ============================================
echo -e "${BLUE}4️⃣  输入问题...${NC}"

# 对问题中的单引号进行转义
QUESTION_ESCAPED="${QUESTION//\'/\\\'}"

playwriter -s "$SESSION_ID" -e "
  const textbox = page.getByRole('textbox', { name: '给 DeepSeek 发送消息' });
  await textbox.click();
  await textbox.fill('${QUESTION_ESCAPED}');
  console.log('✅ 问题已输入');
"

# ============================================
# 步骤 5: 发送消息
# ============================================
echo -e "${BLUE}5️⃣  发送消息...${NC}"

playwriter -s "$SESSION_ID" -e '
  await page.keyboard.press("Enter");
  console.log("✅ 消息已发送");
'

# ============================================
# 步骤 6: 等待回复 (最多等 30 秒)
# ============================================
echo -e "${BLUE}6️⃣  等待 DeepSeek 回复...${NC}"

playwriter -s "$SESSION_ID" -e '
  // 等待回复出现 (最多 30 秒)
  let retries = 0;
  const maxRetries = 30;
  while (retries < maxRetries) {
    await page.waitForTimeout(1000);
    const content = await getPageMarkdown({ page, showDiffSinceLastCall: false });
    // 检查是否包含新的回复 (非思考过程)
    if (content.includes("内容由 AI 生成") || content.includes("深度思考")) {
      // 再等一下确保完整
      await page.waitForTimeout(2000);
      break;
    }
    retries++;
  }
  console.log("✅ 回复已就绪");
'

# ============================================
# 步骤 7: 获取回复内容
# ============================================
echo -e "${BLUE}7️⃣  获取回复内容...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

playwriter -s "$SESSION_ID" -e '
  const content = await getPageMarkdown({ page, showDiffSinceLastCall: false });
  const lines = content.split("\n");
  
  // 找到用户问题的位置
  let questionIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("'${QUESTION_ESCAPED}'") || lines[i].includes("你好，你是谁")) {
      questionIdx = i;
      break;
    }
  }
  
  // 从问题之后开始找回复
  let reply = [];
  let capture = false;
  let skipThinking = true;
  
  for (let i = questionIdx >= 0 ? questionIdx : lines.length - 100; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过用户输入和元信息
    if (line.includes("'${QUESTION_ESCAPED}'") || 
        line.includes("开启新对话") ||
        line.includes("置顶") ||
        line.includes("今天") ||
        line.includes("昨天") ||
        line.includes("快速模式") ||
        line.includes("bluer") ||
        line === "") {
      continue;
    }
    
    // 遇到思考过程标记，开始捕获
    if (line.includes("已思考") || line.includes("深度思考")) {
      capture = true;
      continue;
    }
    
    // 遇到结束标记，停止
    if (line.includes("内容由 AI 生成") || 
        line.includes("本回答由 AI 生成")) {
      break;
    }
    
    // 捕获回复内容
    if (capture) {
      // 跳过思考过程 (如果有)
      if (skipThinking && (line.includes("解析用户请求") || 
          line.includes("确定身份") ||
          line.includes("起草回复") ||
          line.includes("让我们"))) {
        continue;
      }
      skipThinking = false;
      reply.push(line);
    }
  }
  
  if (reply.length > 0) {
    console.log(reply.join("\n"));
  } else {
    // 如果提取失败，返回最后 30 行作为备选
    console.log("--- 回复内容 ---");
    console.log(lines.slice(-30).join("\n"));
  }
'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 完成！${NC}"
echo -e "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
