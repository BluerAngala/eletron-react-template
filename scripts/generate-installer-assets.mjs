#!/usr/bin/env node
/**
 * 生成安装器品牌素材（Windows NSIS + macOS DMG）。
 *
 * 用法:
 *   pnpm installer-assets
 *
 * 输出（均为部署时由 electron-builder 消费的资源）:
 *   build/installerSidebar.bmp   164×314  安装器欢迎/完成页左侧品牌图
 *   build/uninstallerSidebar.bmp 164×314  卸载器欢迎/完成页左侧品牌图
 *   build/installerHeader.bmp    150×57   安装器顶部横幅
 *   build/dmg-background.png     660×400  DMG 窗口背景（需与 dmg.window 尺寸一致）
 *
 * 说明: NSIS 的 MUI 图片要求 BMP，sharp 不直接输出 BMP，这里用 raw + 手写
 * 24-bit BMP 封装（零额外依赖、跨平台）。
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BUILD_DIR = path.join(ROOT, 'build')

/** 品牌渐变（与 assets/logo.svg 一致） */
const GRADIENT = (vertical = true) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">
      <stop offset="0" stop-color="#1e40af"/>
      <stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
  </defs>`

const FONT = 'Arial, Helvetica, sans-serif'

/** lucide "zap" 闪电 path，24×24 viewBox */
const ZAP_PATH =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'

function sidebarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="164" height="314" viewBox="0 0 164 314" fill="none">
  ${GRADIENT(true)}
  <rect width="164" height="314" fill="url(#bg)"/>
  <g transform="translate(46 92) scale(3)"><path d="${ZAP_PATH}" fill="#FFFFFF"/></g>
  <text x="82" y="200" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="bold" fill="#FFFFFF">Electron</text>
  <text x="82" y="222" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="bold" fill="#FFFFFF">React Template</text>
  <text x="82" y="284" text-anchor="middle" font-family="${FONT}" font-size="9" fill="rgba(255,255,255,0.85)">Desktop App Template</text>
</svg>`
}

function headerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="57" viewBox="0 0 150 57" fill="none">
  ${GRADIENT(false)}
  <rect width="150" height="57" fill="url(#bg)"/>
  <g transform="translate(114 11) scale(1.5)"><path d="${ZAP_PATH}" fill="#FFFFFF"/></g>
  <text x="10" y="26" font-family="${FONT}" font-size="12" font-weight="bold" fill="#FFFFFF">Electron React</text>
  <text x="10" y="42" font-family="${FONT}" font-size="9" fill="rgba(255,255,255,0.85)">Template</text>
</svg>`
}

function dmgSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="660" height="400" viewBox="0 0 660 400" fill="none">
  ${GRADIENT(true)}
  <rect width="660" height="400" fill="url(#bg)"/>
  <g transform="translate(270 78) scale(5)"><path d="${ZAP_PATH}" fill="#FFFFFF"/></g>
  <text x="330" y="250" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="bold" fill="#FFFFFF">Electron React Template</text>
  <text x="330" y="280" text-anchor="middle" font-family="${FONT}" font-size="13" fill="rgba(255,255,255,0.9)">Desktop Application Template</text>
</svg>`
}

/**
 * 把 sharp 的 raw RGB 数据封装成 24-bit BMP（bottom-up）。
 * NSIS MUI 原生支持 BMP，无需额外依赖。
 */
function rawToBmp({ data, info }) {
  const { width, height } = info
  const rowSize = Math.ceil((width * 3) / 4) * 4
  const pixelDataSize = rowSize * height
  const fileSize = 54 + pixelDataSize
  const buf = Buffer.alloc(fileSize)

  buf.write('BM', 0, 'ascii')
  buf.writeUInt32LE(fileSize, 2)
  buf.writeUInt32LE(54, 10)
  buf.writeUInt32LE(40, 14)
  buf.writeInt32LE(width, 18)
  buf.writeInt32LE(height, 22)
  buf.writeUInt16LE(1, 26)
  buf.writeUInt16LE(24, 28)
  buf.writeUInt32LE(0, 30)
  buf.writeUInt32LE(pixelDataSize, 34)

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 3
    const dst = 54 + y * rowSize
    for (let x = 0; x < width; x++) {
      const s = srcRow + x * 3
      buf[dst + x * 3] = data[s + 2] // B
      buf[dst + x * 3 + 1] = data[s + 1] // G
      buf[dst + x * 3 + 2] = data[s] // R
    }
  }
  return buf
}

async function renderRaw(svg) {
  return sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true })
}

async function main() {
  const startedAt = Date.now()
  await mkdir(BUILD_DIR, { recursive: true })

  // NSIS 品牌图（BMP）
  const sidebar = rawToBmp(await renderRaw(sidebarSvg()))
  const header = rawToBmp(await renderRaw(headerSvg()))
  await Promise.all([
    writeFile(path.join(BUILD_DIR, 'installerSidebar.bmp'), sidebar),
    writeFile(path.join(BUILD_DIR, 'uninstallerSidebar.bmp'), sidebar),
    writeFile(path.join(BUILD_DIR, 'installerHeader.bmp'), header),
  ])

  // DMG 背景（PNG，需与 electron-builder 中 dmg.window 尺寸一致）
  const dmgPng = await sharp(Buffer.from(dmgSvg())).png().toBuffer()
  await writeFile(path.join(BUILD_DIR, 'dmg-background.png'), dmgPng)

  const files = [
    'installerSidebar.bmp',
    'uninstallerSidebar.bmp',
    'installerHeader.bmp',
    'dmg-background.png',
  ]
  for (const file of files) console.log(`  ✓ build/${file}`)
  console.log(`\n完成，共 ${files.length} 个文件，耗时 ${Date.now() - startedAt}ms`)
}

main().catch((error) => {
  console.error(`生成失败: ${error.message}`)
  process.exit(1)
})
