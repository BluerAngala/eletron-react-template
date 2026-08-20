import fs from 'node:fs'
import path from 'node:path'

const docsDir = 'docs'
const files = []

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'public') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.md')) files.push(p)
  }
}

walk(docsDir)

const stripMd = (s) =>
  s
    .replace(/^#{1,6}\s+/, '')
    .replace(/[`*_\[\]()]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const yamlStr = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/)
  if (fmMatch) {
    const block = fmMatch[1]
    if (/^title:/m.test(block) && /^description:/m.test(block)) {
      console.log('OK    :', f)
      continue
    }
    content = content.slice(fmMatch[0].length)
  }

  const lines = content.split('\n')
  const h1 = lines.find((l) => l.startsWith('# '))
  const title = h1 ? stripMd(h1) : path.basename(f, '.md')

  let desc = ''
  let inCode = false
  for (const l of lines) {
    const t = l.trim()
    if (t.startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    if (!t || t.startsWith('#') || t.startsWith('---')) continue
    if (/^[-*]\s/.test(t) || /^\d+[.、]\s/.test(t)) continue
    if (t.startsWith('|') || t.startsWith('>') || t.startsWith('![')) continue
    desc = stripMd(t)
    if (desc.length >= 15) break
  }
  if (!desc) desc = title
  desc = desc.length > 110 ? desc.slice(0, 110) + '…' : desc

  const fm = `---\ntitle: ${yamlStr(title)}\ndescription: ${yamlStr(desc)}\n---\n\n`
  fs.writeFileSync(f, fm + content)
  console.log('FIXED :', f)
}
