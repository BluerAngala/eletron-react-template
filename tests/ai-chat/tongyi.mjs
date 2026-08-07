#!/usr/bin/env node

/**
 * 通义千问 (Tongyi Qianwen) 自动化脚本
 *
 * 使用方式：
 *   node tongyi.mjs "你的问题"
 *
 * 前置条件：
 *   1. Chrome 已登录 www.qianwen.com（未登录时仍可匿名对话，但回复可能受限）
 *   2. Playwriter 已启动：playwriter serve
 *
 * 可选环境变量：PW_SESSION - Playwriter 会话 ID（默认 1）
 */

import { runPlatform } from './shared.mjs'

const question = process.argv[2]

if (!question) {
  console.error('用法: node tongyi.mjs "你的问题"')
  process.exit(1)
}

try {
  const reply = await runPlatform('tongyi', question)
  console.log('\n--- 通义千问回复 ---')
  console.log(reply)
  console.log('--- 结束 ---\n')
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
