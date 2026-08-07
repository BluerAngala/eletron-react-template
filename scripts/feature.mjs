// scripts/feature.mjs —— 列出仓库里可用的可插拔功能模块（packages/feature-*）
//
// 可插拔机制已改为"配置驱动"：唯一开关在 app/shared/features.ts 的 enabledFeatures，
// 改配置即可启用/禁用，无需执行任何命令。本脚本仅用于查看当前仓库有哪些可选模块。
//
//    pnpm feature:list
//
import { readdir } from 'node:fs/promises'

const packages = await readdir('packages')
// feature-contract 是"契约"包而非可插拔功能，排除
const features = packages
  .filter((name) => name.startsWith('feature-'))
  .map((name) => name.replace(/^feature-/, ''))
  .filter((id) => id !== 'contract')
  .sort()

console.log(features.join('\n'))
