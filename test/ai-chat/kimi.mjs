#!/usr/bin/env node

/**
 * Kimi 自动化脚本
 *
 * 使用方式：
 *   node kimi.mjs "你的问题"
 *
 * 前置条件：
 *   1. Chrome 已登录 www.kimi.com（原 kimi.moonshot.cn 已迁移）
 *   2. Playwriter 已启动：playwriter serve
 *
 * 可选环境变量：PW_SESSION - Playwriter 会话 ID（默认 1）
 */

import { runPlatform } from './shared.mjs';

const question = process.argv[2];

if (!question) {
  console.error('用法: node kimi.mjs "你的问题"');
  process.exit(1);
}

try {
  const reply = await runPlatform('kimi', question);
  console.log('\n--- Kimi 回复 ---');
  console.log(reply);
  console.log('--- 结束 ---\n');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
