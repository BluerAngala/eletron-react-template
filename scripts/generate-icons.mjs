#!/usr/bin/env node
/**
 * 从单个 SVG 源图生成桌面应用全套图标。
 *
 * 用法:
 *   pnpm icons                  # 默认源 assets/logo.svg
 *   pnpm icons --input foo.svg  # 指定源文件
 *
 * 输出:
 *   build/icon.png          1024×1024 打包源图，electron-builder 自动派生 .icns / .ico
 *   build/icon.ico          多尺寸 Windows 图标
 *   public/favicon.ico      多尺寸 favicon（浏览器 / 开发态 / 窗口图标）
 *   public/logo-<size>.png  16/24/32/48/64/128/256/512 各尺寸（页面、托盘等使用）
 *
 * 依赖: sharp（SVG → PNG）、png-to-ico（PNG → ICO）
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const inputIndex = process.argv.indexOf('--input')
const INPUT =
  inputIndex !== -1
    ? path.resolve(process.argv[inputIndex + 1])
    : path.join(ROOT, 'assets/logo.svg')

const LOGO_PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512]
const FAVICON_SIZES = [16, 32, 48]
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
const ICON_PNG_SIZE = 1024

async function renderPng(size) {
  return sharp(INPUT, { density: 300 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

async function main() {
  const startedAt = Date.now()
  const meta = await sharp(INPUT).metadata()
  if (!meta.width || !meta.height) throw new Error(`无法读取图片信息: ${INPUT}`)

  console.log(`源图: ${path.relative(ROOT, INPUT)} (${meta.width}×${meta.height})\n`)

  await mkdir(path.join(ROOT, 'build'), { recursive: true })
  await mkdir(path.join(ROOT, 'public'), { recursive: true })

  const writes = []

  // 各尺寸 PNG → public/logo-<size>.png
  for (const size of LOGO_PNG_SIZES) {
    const file = path.join(ROOT, 'public', `logo-${size}.png`)
    writes.push(writeFile(file, await renderPng(size)))
  }

  // 打包源图 → build/icon.png（electron-builder 自动派生 .icns/.ico）
  writes.push(writeFile(path.join(ROOT, 'build', 'icon.png'), await renderPng(ICON_PNG_SIZE)))

  // favicon → public/favicon.ico
  writes.push(
    writeFile(
      path.join(ROOT, 'public', 'favicon.ico'),
      await pngToIco(await Promise.all(FAVICON_SIZES.map(renderPng))),
    ),
  )

  // Windows 多尺寸图标 → build/icon.ico
  writes.push(
    writeFile(
      path.join(ROOT, 'build', 'icon.ico'),
      await pngToIco(await Promise.all(ICO_SIZES.map(renderPng))),
    ),
  )

  await Promise.all(writes)

  const files = [
    path.join(ROOT, 'build', 'icon.png'),
    path.join(ROOT, 'build', 'icon.ico'),
    path.join(ROOT, 'public', 'favicon.ico'),
    ...LOGO_PNG_SIZES.map((size) => path.join(ROOT, 'public', `logo-${size}.png`)),
  ]
  for (const file of files) console.log(`  ✓ ${path.relative(ROOT, file)}`)

  console.log(`\n完成，共 ${files.length} 个文件，耗时 ${Date.now() - startedAt}ms`)
}

main().catch((error) => {
  console.error(`生成失败: ${error.message}`)
  process.exit(1)
})
