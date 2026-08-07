// 可插拔功能的唯一开关。改这个数组即可启用/禁用模块，无需任何命令，重启 `pnpm dev` 生效。
// 新增模块：1) 在 packages/ 建 feature-<id> 包并实现 feature-contract 契约
//           2) 在 app/renderer/features 与 app/electron/*/features 的注册表各加一行 loader
//           3) 把 '<id>' 加进下面的数组（或从数组移除）
export const enabledFeatures = ['ai-chat', 'example'] as const

export type FeatureId = (typeof enabledFeatures)[number]

export function isFeatureEnabled(feature: FeatureId): boolean {
  return enabledFeatures.includes(feature)
}
