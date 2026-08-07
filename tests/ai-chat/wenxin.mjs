#!/usr/bin/env node

/**
 * 文心一言 (Wenxin Yiyan) 自动化脚本
 *
 * 使用方式：
 *   node wenxin.mjs "你的问题"
 *
 * 前置条件：
 *   1. Chrome 已登录 wenxin.baidu.com
 *   2. Playwriter 已启动：playwriter serve
 *
 * 可选环境变量：PW_SESSION - Playwriter 会话 ID（默认 1）
 */

import { runPlatform } from './shared.mjs'

const question = process.argv[2]

if (!question) {
  console.error('用法: node wenxin.mjs "你的问题"')
  process.exit(1)
}

try {
  const reply = await runPlatform('wenxin', question)
  console.log('\n--- 文心一言回复 ---')
  console.log(reply)
  console.log('--- 结束 ---\n')
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
