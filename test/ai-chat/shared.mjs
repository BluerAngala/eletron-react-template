/**
 * AI Chat 自动化 - 共享工具模块
 *
 * 提供与 Playwriter 交互的通用函数，供各平台脚本复用。
 */

import { execSync } from 'node:child_process';

/**
 * 各平台配置（URL、输入框/发送/回复选择器、停止按钮选择器）
 * 单点维护：cli.mjs 与各平台脚本共用，避免选择器散落重复。
 */
export const PLATFORMS = {
  doubao: {
    key: 'doubao',
    name: '豆包',
    url: 'https://www.doubao.com/chat/',
    stopSelector: 'button:has-text("停止"), button:has-text("Stop"), [data-testid="stop-button"]',
    inputSelectors: [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      '.chat-input textarea',
      '#chat-input',
    ],
    sendSelectors: [
      'button[data-testid="send-button"]',
      'button:has(svg[data-testid="send"])',
      'button:has-text("发送")',
      'button:has-text("Send")',
      'button[type="submit"]',
      '.send-button',
      '[aria-label="发送"]',
    ],
    // 每条消息带 data-message-id，取最后一条即为最新回复
    replySelectors: ['[data-message-id]'],
  },
  kimi: {
    key: 'kimi',
    name: 'Kimi',
    // moonshot.cn 已迁移到 www.kimi.com，官网首页即聊天入口
    url: 'https://www.kimi.com/',
    stopSelector: 'button:has-text("停止"), button:has-text("Stop")',
    inputSelectors: [
      '.chat-input-editor',
      '[data-testid="msh-chatinput-editor"]',
      'div[contenteditable="true"]',
      'textarea[placeholder]',
      'textarea',
      '.chat-input textarea',
      '#chat-input',
    ],
    sendSelectors: [
      '[data-testid="msh-chatinput-send-button"]',
      'button:has-text("发送")',
      'button:has-text("Send")',
      'button[type="submit"]',
      'button[aria-label="发送"]',
    ],
    replySelectors: ['.segment-assistant .markdown', '.chat-content-item-assistant .markdown', '.markdown'],
  },
  yuanbao: {
    key: 'yuanbao',
    name: '元宝',
    url: 'https://yuanbao.tencent.com/',
    stopSelector: 'button:has-text("停止"), button:has-text("Stop")',
    inputSelectors: [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      '#chat-input',
      '.chat-input textarea',
    ],
    sendSelectors: [
      'button:has-text("发送")',
      'button:has-text("Send")',
      'button[type="submit"]',
      'button[aria-label="发送"]',
      '.send-btn',
    ],
    replySelectors: ['.agent-chat__list__item--ai', '.agent-chat__bubble--ai'],
  },
  tongyi: {
    key: 'tongyi',
    name: '通义千问',
    url: 'https://www.qianwen.com/',
    stopSelector: 'button:has-text("停止"), button:has-text("Stop")',
    inputSelectors: [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      '#chat-input',
      '.chat-input textarea',
      'textarea[class*="input"]',
    ],
    sendSelectors: [
      'button:has-text("发送")',
      'button:has-text("Send")',
      'button[type="submit"]',
      'button[aria-label="发送"]',
      'button[class*="send"]',
    ],
    replySelectors: ['.chat-answers-card-wrap', '[class*="answers-card"]'],
  },
  wenxin: {
    key: 'wenxin',
    name: '文心一言',
    url: 'https://wenxin.baidu.com/',
    stopSelector: 'button:has-text("停止"), button:has-text("Stop")',
    inputSelectors: [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      '#chat-input',
      '.chat-input textarea',
    ],
    sendSelectors: [
      'button:has-text("发送")',
      'button:has-text("Send")',
      'button[type="submit"]',
      'button[aria-label="发送"]',
      'button[class*="send"]',
    ],
    replySelectors: ['.last-answer-box .answer-container', '.answer-box .answer-container', '.answer-container'],
  },
  deepseek: {
    key: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    stopSelector: 'button:has-text("停止"), button:has-text("Stop"), [data-testid="stop-button"]',
    inputSelectors: [
      'textarea[placeholder]',
      'textarea',
      '[contenteditable="true"]',
      'div[role="textbox"]',
      '.chat-input textarea',
      '#chat-input',
    ],
    sendSelectors: [
      'button[data-testid="send-button"]',
      'button:has(svg[data-testid="send"])',
      'button:has-text("发送")',
      'button:has-text("Send")',
      'button[type="submit"]',
      '.send-button',
      '[aria-label="发送"]',
      '[aria-label="Send"]',
    ],
    // 最终回复容器（排除思考链 .ds-think 等）
    replySelectors: ['.ds-assistant-message-main-content'],
  },
};

/**
 * 执行 playwriter 命令
 * @param {string} code - 要执行的 Playwright 代码
 * @param {object} options - 配置项
 * @param {number} options.session - 会话 ID（默认取 PW_SESSION，否则 1）
 * @param {number} options.timeout - 超时时间 ms（默认 30000）
 * @returns {string} 命令输出
 */
export function runPlaywright(code, { session = Number(process.env.PW_SESSION) || 1, timeout = 30_000 } = {}) {
  // 使用专用页面，避免抢占其他会话/任务的标签页
  const ensurePage = `if (!state.page || state.page.isClosed()) { state.page = context.pages().find((p) => p.url() === 'about:blank') ?? (await context.newPage()); }`;
  const escaped = `${ensurePage}\n${code}`.replace(/'/g, "'\\''");
  const pwTimeout = Math.max(timeout, 60_000);
  const cmd = `playwriter -s ${session} --timeout ${pwTimeout} -e '${escaped}'`;
  return execSync(cmd, {
    encoding: 'utf-8',
    timeout: timeout + 10_000,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

/**
 * 等待元素出现并返回
 * @param {string} selector - CSS 选择器
 * @param {object} options
 * @param {number} options.session
 * @param {number} options.timeout
 */
export function waitForSelector(selector, options = {}) {
  return runPlaywright(
    `const el = await state.page.waitForSelector('${selector}', { timeout: ${options.timeout ?? 15_000} }); return el ? 'found' : 'not found';`,
    options,
  );
}

/**
 * 在输入框中输入文本
 * @param {string} selector - 输入框选择器
 * @param {string} text - 要输入的文本
 * @param {object} options
 */
export function typeText(selector, text, options = {}) {
  const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  return runPlaywright(
    `await state.page.fill('${selector}', '${escaped}'); return 'typed';`,
    options,
  );
}

/**
 * 点击按钮
 * @param {string} selector - 按钮选择器
 * @param {object} options
 */
export function clickButton(selector, options = {}) {
  return runPlaywright(
    `await state.page.click('${selector}'); return 'clicked';`,
    options,
  );
}

/**
 * 等待 AI 回复完成。
 *
 * 策略（兼容"思考链"类平台）：
 * 1. 停止按钮存在 → 回复仍在生成，继续等；
 * 2. 停止按钮消失且页面文本连续两次轮询无变化 → 判定完成；
 * 3. 若自始至终没有停止按钮（如 DeepSeek 思考阶段），靠内容稳定性兜底，
 *    避免在回复刚开始时就误判完成。
 * @param {object} options
 * @param {string} options.stopSelector - 停止按钮选择器
 * @param {number} options.pollInterval - 轮询间隔 ms
 * @param {number} options.maxWait - 最大等待时间 ms
 */
export function waitForResponse(
  options = {},
) {
  const {
    stopSelector = 'button:has-text("停止"), button:has-text("Stop")',
    pollInterval = 2000,
    maxWait = 120_000,
  } = options;

  return runPlaywright(
    `
const start = Date.now();
let lastLen = -1;
let stableCount = 0;
while (Date.now() - start < ${maxWait}) {
  const len = await state.page.evaluate(() => document.body.innerText.length);
  const stopBtn = await state.page.$('${stopSelector}');
  if (!stopBtn) {
    if (len === lastLen) {
      stableCount += 1;
      if (stableCount >= 2) return 'done';
    } else {
      stableCount = 0;
    }
  } else {
    stableCount = 0;
  }
  lastLen = len;
  await state.page.waitForTimeout(${pollInterval});
}
return 'timeout';
    `.trim(),
    { timeout: maxWait + 10_000 },
  );
}

/**
 * 提取页面文本内容
 * @param {string} selector - 要提取内容的区域选择器
 * @param {object} options
 */
export function extractText(selector, options = {}) {
  return runPlaywright(
    `const el = await state.page.$('${selector}'); return el ? await el.innerText() : '';`,
    options,
  );
}

/**
 * 导航到指定 URL
 * @param {string} url
 * @param {object} options
 */
export function navigateTo(url, options = {}) {
  return runPlaywright(
    `await state.page.goto('${url}', { waitUntil: 'domcontentloaded', timeout: 15000 }); return state.page.url();`,
    { timeout: 30_000, ...options },
  );
}

/**
 * 创建带日志的运行器
 * @param {string} platformName - 平台名称
 */
export function createRunner(platformName) {
  return {
    log: (msg) => console.log(`[${platformName}] ${msg}`),
    error: (msg) => console.error(`[${platformName}] ${msg}`),
  };
}

/**
 * 完整执行一个平台的"提问→回复"流程。
 * @param {string} platformKey - PLATFORMS 的键
 * @param {string} question - 问题文本
 * @returns {Promise<string>} 提取到的回复文本
 */
export async function runPlatform(platformKey, question) {
  const platform = PLATFORMS[platformKey];
  if (!platform) throw new Error(`未知平台: ${platformKey}`);
  const { log, error } = createRunner(platform.name);
  const escapedQuestion = question.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

  log(`问题: ${question}`);
  log(`正在打开 ${platform.name}...`);

  try {
    // 导航 - 使用 domcontentloaded 避免 networkidle 超时
    await runPlaywright(`
      try {
        await state.page.goto('${platform.url}', { waitUntil: 'domcontentloaded', timeout: 15000 });
      } catch (e) {
        await state.page.goto('${platform.url}', { waitUntil: 'commit', timeout: 10000 });
      }
      await state.page.waitForTimeout(3000);
      return state.page.url();
    `);
    log('页面已加载');

    // 输入
    await runPlaywright(`
      let input = null;
      for (const sel of ${JSON.stringify(platform.inputSelectors)}) {
        input = await state.page.$(sel);
        if (input) break;
      }
      if (!input) throw new Error('找不到输入框');
      await input.click();
      await state.page.waitForTimeout(500);
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'textarea') {
        await input.fill('${escapedQuestion}');
      } else {
        await state.page.keyboard.type('${escapedQuestion}', { delay: 10 });
      }
      return 'inputted';
    `);
    log('已输入问题');

    // 发送
    await runPlaywright(`
      let sent = false;
      for (const sel of ${JSON.stringify(platform.sendSelectors)}) {
        try {
          const btn = await state.page.$(sel);
          if (btn) { await btn.click(); sent = true; break; }
        } catch {}
      }
      if (!sent) await state.page.keyboard.press('Enter');
      return 'sent';
    `);
    log('已发送，等待回复...');

    // 等待回复
    const result = await waitForResponse({
      stopSelector: platform.stopSelector,
      maxWait: 120_000,
    });
    if (result === 'timeout') log('⚠️ 等待超时，尝试提取已有内容');

    // 提取（只从平台自己的回复容器里取，不做全局兜底，避免抓到提示文案/按钮）
    const reply = await runPlaywright(`
      let text = '';
      for (const sel of ${JSON.stringify(platform.replySelectors)}) {
        try {
          const els = await state.page.$$(sel);
          if (els.length > 0) {
            text = await els[els.length - 1].innerText();
            if (text.trim()) break;
          }
        } catch {}
      }
      return text;
    `);

    return reply || '(未能提取回复)';
  } catch (e) {
    error(`执行失败: ${e.message}`);
    throw e;
  }
}
