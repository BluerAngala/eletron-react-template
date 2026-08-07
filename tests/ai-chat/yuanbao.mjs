#!/usr/bin/env node

/**
 * 元宝 (Yuanbao) 自动化脚本
 *
 * 使用方式：
 *   node yuanbao.mjs "你的问题"
 *
 * 前置条件：
 *   1. Chrome 已登录 yuanbao.tencent.com
 *   2. Playwriter 已启动：playwriter serve
 *
 * 可选环境变量：PW_SESSION - Playwriter 会话 ID（默认 1）
 */

import { runPlatform } from './shared.mjs'

const question = process.argv[2]

if (!question) {
  console.error('用法: node yuanbao.mjs "你的问题"')
  process.exit(1)
}

try {
  const reply = await runPlatform('yuanbao', question)
  console.log('\n--- 元宝回复 ---')
  console.log(reply)
  console.log('--- 结束 ---\n')
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
