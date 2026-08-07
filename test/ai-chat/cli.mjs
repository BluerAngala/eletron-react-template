#!/usr/bin/env node

/**
 * AI Chat 统一入口
 *
 * 使用方式：
 *   node cli.mjs <平台> "你的问题"
 *   node cli.mjs --list              # 列出支持的平台
 *
 * 支持的平台：
 *   doubao   - 豆包
 *   kimi     - Kimi
 *   yuanbao  - 元宝
 *   tongyi   - 通义千问
 *   wenxin   - 文心一言
 *   deepseek - DeepSeek
 *
 * 可选环境变量：
 *   PW_SESSION - Playwriter 会话 ID（默认 1）
 */

import { PLATFORMS, runPlatform } from './shared.mjs';

// --- 主逻辑 ---

const args = process.argv.slice(2);

if (args[0] === '--list' || args[0] === '-l') {
  console.log('支持的平台：');
  for (const [key, p] of Object.entries(PLATFORMS)) {
    console.log(`  ${key.padEnd(10)} ${p.name}  (${p.url})`);
  }
  process.exit(0);
}

const platformKey = args[0];
const question = args[1];

if (!platformKey || !question) {
  console.log('用法: node cli.mjs <平台> "你的问题"');
  console.log('');
  console.log('示例:');
  console.log('  node cli.mjs doubao "解释量子计算"');
  console.log('  node cli.mjs kimi "帮我总结这篇文章"');
  console.log('  node cli.mjs --list');
  process.exit(1);
}

if (!PLATFORMS[platformKey]) {
  console.error(`未知平台: ${platformKey}`);
  console.error('使用 --list 查看支持的平台');
  process.exit(1);
}

try {
  const reply = await runPlatform(platformKey, question);
  console.log(`\n--- ${PLATFORMS[platformKey].name}回复 ---`);
  console.log(reply);
  console.log('--- 结束 ---\n');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
