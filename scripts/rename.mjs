#!/usr/bin/env node
/**
 * 项目改名脚本 —— clone 模板后的第一件事。
 *
 * 用法:
 *   pnpm rename                                   # 交互式引导
 *   pnpm rename --name my-app --appId com.x.y --repo owner/repo --yes
 *
 * 字段:
 *   --name         npm 包名（小写 kebab-case），同时推导 productName / 窗口标题 / README
 *   --appId        electron-builder appId，如 com.example.myapp
 *   --repo         GitHub 仓库，格式 owner/repo
 *   --description  项目描述
 *   --author       作者
 *   --dry-run      仅预览变更，不写入文件
 *   --yes / -y     跳过确认
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const FILES = {
  pkg: path.join(ROOT, 'package.json'),
  builder: path.join(ROOT, 'electron-builder.json'),
  indexHtml: path.join(ROOT, 'index.html'),
  readmes: [path.join(ROOT, 'README.md'), path.join(ROOT, 'README.zh-CN.md')],
}

function parseArgs(argv) {
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '-y') {
      flags.yes = true
      continue
    }
    if (!arg.startsWith('--')) continue
    // --dry-run → dryRun，--app-id → appId，统一转驼峰避免键名错配
    const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      flags[key] = next
      i++
    } else {
      flags[key] = true
    }
  }
  return flags
}

function toTitleCase(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))

  const pkg = JSON.parse(await readFile(FILES.pkg, 'utf8'))
  const builder = JSON.parse(await readFile(FILES.builder, 'utf8'))

  const repoFromUrl = pkg.repository?.url
    ?.replace(/^https:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
  const current = {
    name: pkg.name,
    appId: builder.appId,
    repo: repoFromUrl || '',
    description: pkg.description || '',
    author: typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || '',
  }

  const rl = readline.createInterface({ input, output })
  const ask = async (label, fallback) => {
    const answer = await rl.question(`  ${label} [${fallback}]: `)
    return answer.trim() || fallback
  }

  const name = flags.name || (await ask('npm 包名（小写 kebab-case）', current.name))
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    rl.close()
    throw new Error(`包名非法: "${name}"（仅允许小写字母 / 数字 / 连字符）`)
  }

  const productName = toTitleCase(name)
  const defaultAppId = `com.${name.replace(/-/g, '')}.app`
  const appId = flags.appId || (await ask('appId', defaultAppId))
  const repo = flags.repo || (await ask('GitHub 仓库（owner/repo）', current.repo))
  const description = flags.description || (await ask('项目描述', current.description))
  const author = flags.author || (await ask('作者', current.author))
  rl.close()

  if (!/^[\w-]+\/[\w.-]+$/.test(repo)) {
    throw new Error(`仓库格式非法: "${repo}"（应为 owner/repo）`)
  }
  const [owner, repoName] = repo.split('/')

  const changes = [
    ['package.json  name', `${current.name} → ${name}`],
    ['package.json  productName', `${pkg.productName || '(无)'} → ${productName}`],
    ['package.json  description', `${current.description || '(无)'} → ${description}`],
    ['package.json  author', `${current.author || '(无)'} → ${author}`],
    ['package.json  repository', `${current.repo || '(无)'} → ${repo}`],
    ['electron-builder.json  appId', `${current.appId} → ${appId}`],
  ]

  console.log('\n变更预览:')
  for (const [target, change] of changes) console.log(`  ${target}: ${change}`)

  if (!flags.yes && !flags.y) {
    const confirmRl = readline.createInterface({ input, output })
    const ok = await confirmRl.question('\n确认执行？(y/N) ')
    confirmRl.close()
    if (!/^y(es)?$/i.test(ok.trim())) {
      console.log('已取消，未做任何修改。')
      return
    }
  }

  if (flags.dryRun) {
    console.log('\n[dry-run] 未执行任何写入。')
    return
  }

  // package.json
  pkg.name = name
  pkg.productName = productName
  pkg.description = description
  pkg.author = author
  pkg.repository = { type: 'git', url: `https://github.com/${repo}.git` }
  pkg.bugs = { url: `https://github.com/${repo}/issues` }
  pkg.homepage = `https://github.com/${repo}#readme`
  await writeFile(FILES.pkg, `${JSON.stringify(pkg, null, 2)}\n`)

  // electron-builder.json
  builder.appId = appId
  builder.publish.owner = owner
  builder.publish.repo = repoName
  await writeFile(FILES.builder, `${JSON.stringify(builder, null, 2)}\n`)

  // index.html <title>
  const html = await readFile(FILES.indexHtml, 'utf8')
  await writeFile(
    FILES.indexHtml,
    html.replace(/<title>.*?<\/title>/, `<title>${productName}</title>`),
  )

  // README 中的仓库链接与旧项目名
  for (const file of FILES.readmes) {
    let content = await readFile(file, 'utf8')
    const original = content
    if (repoFromUrl) content = content.split(repoFromUrl).join(repo)
    content = content.split(current.name).join(name)
    if (content !== original) {
      await writeFile(file, content)
      console.log(`  ✓ ${path.relative(ROOT, file)} 已更新`)
    }
  }

  console.log('\n完成。建议下一步:')
  console.log('  1. 将 assets/logo.svg 替换为自己的图标（可从 iconfont 下载）')
  console.log('  2. pnpm icons           # 生成全套图标')
  console.log('  3. pnpm dev             # 启动验证')
  console.log('  4. git commit -m "chore: rename project"')
}

main().catch((error) => {
  console.error(`改名失败: ${error.message}`)
  process.exit(1)
})
