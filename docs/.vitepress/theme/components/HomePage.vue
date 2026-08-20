<template>
  <div class="custom-home">
    <VPNav />

    <main class="home-wrapper">
      <section class="hero-section">
        <div class="hero-orb hero-orb-a" aria-hidden="true"></div>
        <div class="hero-orb hero-orb-b" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="hero-content">
            <div class="hero-badges">
              <span class="badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>
                开箱即用
              </span>
              <span class="badge badge-muted">MIT 开源</span>
            </div>
            <h1 class="hero-title">
              Electron <span class="hero-title-accent">React</span> Template
            </h1>
            <p class="hero-subtitle">基于 Electron + React + TypeScript 的桌面应用模板，集成插件系统、主题系统、国际化与自动更新，开箱即用。</p>
            <div class="hero-actions">
              <a :href="base + 'guide/getting-started.html'" class="btn btn-primary">
                快速开始
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
              </a>
              <a href="https://github.com/BluerAngala/eletron-react-template" target="_blank" rel="noopener" class="btn btn-secondary">在 GitHub 上查看</a>
            </div>
          </div>

          <div class="hero-terminal">
            <div class="terminal-head">
              <span class="dot dot-red" aria-hidden="true"></span>
              <span class="dot dot-amber" aria-hidden="true"></span>
              <span class="dot dot-green" aria-hidden="true"></span>
              <span class="terminal-title">terminal — zsh</span>
            </div>
            <pre class="terminal-body"><code><span class="ln"><span class="cm"># 克隆模板</span></span><span class="ln"><span class="pm">$</span> git clone https://github.com/BluerAngala/eletron-react-template.git</span><span class="ln"><span class="cm"># 安装依赖</span></span><span class="ln"><span class="pm">$</span> pnpm install</span><span class="ln"><span class="cm"># 启动开发</span></span><span class="ln"><span class="pm">$</span> pnpm dev</span><span class="ln"><span class="ok">✔ 开发服务器已启动 · localhost:5173</span></span></code></pre>
          </div>
        </div>
      </section>

      <section class="section-divider" aria-hidden="true"></section>

      <section class="categories-section">
        <div class="section-head">
          <p class="section-kicker">Documentation</p>
          <h2 class="section-title">从哪开始</h2>
          <p class="section-desc">按你的目标选择入口，每篇文档都带可运行示例。</p>
        </div>
        <div class="bento-grid">
          <a
            v-for="cat in categories"
            :key="cat.title"
            :href="base + cat.link"
            class="bento-card"
            :class="cat.size"
          >
            <div class="bento-icon" v-html="cat.icon" aria-hidden="true"></div>
            <h3 class="bento-title">{{ cat.title }}</h3>
            <p class="bento-desc">{{ cat.desc }}</p>
            <span class="bento-meta">
              {{ cat.count }} 篇
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </span>
          </a>
        </div>
      </section>

      <section class="features-section">
        <div class="section-head">
          <p class="section-kicker">Features</p>
          <h2 class="section-title">为生产级桌面应用而生</h2>
          <p class="section-desc">六大能力开箱即用，模块间解耦，可按需扩展。</p>
        </div>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon" v-html="feature.icon" aria-hidden="true"></div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.details }}</p>
          </div>
        </div>
      </section>

      <section class="start-section">
        <div class="start-card">
          <div class="start-copy">
            <p class="section-kicker">Get Started</p>
            <h2 class="start-title">三分钟跑通第一个桌面应用</h2>
            <ol class="start-steps">
              <li v-for="step in steps" :key="step.title">
                <span class="step-num">{{ step.num }}</span>
                <span><strong>{{ step.title }}</strong> — {{ step.desc }}</span>
              </li>
            </ol>
            <a :href="base + 'guide/getting-started.html'" class="btn btn-primary">
              查看完整指南
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </a>
          </div>
          <div class="start-visual" aria-hidden="true">
            <div class="stack-card">
              <div class="stack-row"><span class="stack-dot" style="background:#b08947"></span>electron/</div>
              <div class="stack-row"><span class="stack-dot" style="background:#378ADD"></span>react/</div>
              <div class="stack-row"><span class="stack-dot" style="background:#1D9E75"></span>typescript/</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="home-footer">
      <p class="footer-message">基于 MIT 许可发布 · <a :href="base + 'development/build-deploy.html'">构建部署</a></p>
      <p class="footer-copyright">版权所有 &copy; BluerAngala</p>
    </footer>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import VPNav from 'vitepress/dist/client/theme-default/components/VPNav.vue'
import { onMounted } from 'vue'

const { site } = useData()
const base = site.value.base

const icon = (paths) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const categories = [
  {
    title: '指南',
    desc: '环境要求、目录结构、开发工作流，快速熟悉项目骨架。',
    link: 'guide/getting-started.html',
    count: 3,
    size: 'lg',
    icon: icon('<path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h14"/>'),
  },
  {
    title: '功能',
    desc: '插件系统、主题系统、国际化、自动更新。',
    link: 'features/plugin-system.html',
    count: 4,
    size: 'sm',
    icon: icon('<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a1.5 1.5 0 0 0 0-3h-1.5A1.5 1.5 0 0 1 11 7.5 1.5 1.5 0 0 1 12.5 6H15a1.5 1.5 0 0 1 1.5 1.5V9"/>'),
  },
  {
    title: '插件开发',
    desc: '从 plugin.json 到 API 参考，编写与 ZTools 兼容的插件。',
    link: 'plugin-dev/getting-started.html',
    count: 6,
    size: 'sm',
    icon: icon('<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13 5l-2 14"/>'),
  },
  {
    title: '开发',
    desc: '架构概览、IPC 通信、代码规范与构建部署，理解全貌后自由扩展。',
    link: 'development/architecture.html',
    count: 4,
    size: 'lg',
    icon: icon('<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="7" r="2.5"/><path d="M6 7.5v9"/><path d="M18 9.5c0 4-4 2.5-7 4.5s-5 1-5 1"/>'),
  },
]

const features = [
  {
    icon: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h7v7h-7z"/>'),
    title: '插件系统',
    details: '三层插件来源（内置 / 市场 / 导入），ZTools 完全兼容 API，截图、剪贴板、模拟输入等能力即插即用',
  },
  {
    icon: icon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>'),
    title: '主题系统',
    details: '语义化 Token 架构，暖石 Warm Stone 色板，新增主题只改 CSS 变量，组件零改动',
  },
  {
    icon: icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>'),
    title: '国际化',
    details: '中英文翻译，新增翻译键只需同时添加两个语言文件，切换即时生效',
  },
  {
    icon: icon('<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/>'),
    title: '自动更新',
    details: '基于 electron-updater 自动检查更新、下载与安装，发布即升级',
  },
  {
    icon: icon('<path d="M14 3l7 7-9 9-7-7z"/><path d="M9 8l-5 5a2.5 2.5 0 0 0 3.5 3.5L13 11"/>'),
    title: '开发工具链',
    details: 'TypeScript 严格模式、ESLint + Prettier、Vitest 单元测试、Playwright E2E，提交前一键预检',
  },
  {
    icon: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3"/><path d="M12 15h5"/>'),
    title: '实时日志',
    details: '前后端日志统一展示，5 级颜色标签、3 类来源、多选复制，内存安全',
  },
]

const steps = [
  { num: 1, title: '克隆仓库', desc: '下载模板到本地' },
  { num: 2, title: '安装依赖', desc: 'pnpm install 一行搞定' },
  { num: 3, title: '启动开发', desc: 'pnpm dev 秒开窗口' },
]

function setupReveal() {
  const els = document.querySelectorAll('.home-wrapper section')
  if (!('IntersectionObserver' in window)) return
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  els.forEach((el) => io.observe(el))
}

onMounted(setupReveal)
</script>

<style scoped>
/* ===== 布局基础 ===== */
.custom-home {
  --nav-h: 64px;
  --max-w: 1080px;
  --radius: 12px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.home-wrapper {
  flex: 1;
  padding-top: var(--nav-h);
}

section {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

section.revealed {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  section {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ===== Hero ===== */
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 104px 0 88px;
  width: 100%;
}

.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 64px;
  align-items: center;
  max-width: calc(var(--max-w) + 48px);
  margin: 0 auto;
  padding: 0 24px;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.hero-orb-a {
  width: 480px;
  height: 480px;
  top: -200px;
  right: -140px;
  background: var(--c-brand-soft);
}

.hero-orb-b {
  width: 360px;
  height: 360px;
  bottom: -180px;
  left: -120px;
  background: var(--c-brand-soft);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  border: 1px solid color-mix(in srgb, var(--c-brand) 22%, transparent);
  border-radius: 999px;
}

.badge-muted {
  color: var(--c-text-muted);
  background: transparent;
  border-color: var(--c-border);
}

.hero-title {
  font-size: 46px;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--c-text);
  margin: 0 0 16px;
}

.hero-title-accent {
  color: var(--c-brand);
}

.hero-subtitle {
  font-size: 17px;
  line-height: 1.7;
  color: var(--c-text-secondary);
  margin: 0 0 32px;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===== 按钮 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 26px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: var(--c-brand);
  color: #fff;
  border: 1.5px solid var(--c-brand);
}

.btn-primary:hover {
  background: var(--c-brand-hover);
  border-color: var(--c-brand-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--c-text);
  border: 1.5px solid var(--c-border);
}

.btn-secondary:hover {
  border-color: var(--c-text-muted);
  background: var(--c-bg-soft);
}

/* ===== 终端卡片 ===== */
.hero-terminal {
  position: relative;
  z-index: 1;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #332c20;
  background: #1e1b14;
  box-shadow: 0 24px 60px rgba(60, 45, 20, 0.18);
  font-family: 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
}

.terminal-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #2e2820;
  background: #24201a;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.dot-red { background: #e24b4a; }
.dot-amber { background: #ef9f27; }
.dot-green { background: #1d9e75; }

.terminal-title {
  margin-left: 8px;
  font-size: 12px;
  color: #9a8a74;
}

.terminal-body {
  margin: 0;
  padding: 20px 22px 22px;
  overflow: hidden;
}

.terminal-body code {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.9;
  color: #d8cfc0;
  display: block;
}

.ln {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

.cm { color: #7d7466; }
.pm { color: #b08947; font-weight: 600; }
.ok { color: #1d9e75; }

/* ===== 通用 section 头 ===== */
.section-head {
  text-align: center;
  max-width: 560px;
  margin: 0 auto 44px;
}

.section-kicker {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-brand);
  margin: 0 0 10px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin: 0 0 12px;
}

.section-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--c-text-secondary);
  margin: 0;
}

.section-divider {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 24px;
}

.section-divider::after {
  content: '';
  display: block;
  height: 1px;
  background: var(--c-border-light);
}

/* ===== Bento 分类 ===== */
.categories-section {
  padding: 88px 24px 24px;
  max-width: calc(var(--max-w) + 48px);
  margin: 0 auto;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.bento-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px 26px;
  border-radius: 14px;
  background: var(--c-bg-elv);
  border: 1px solid var(--c-border);
  text-decoration: none;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.bento-card:hover {
  border-color: color-mix(in srgb, var(--c-brand) 55%, var(--c-border));
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(60, 45, 20, 0.08);
}

.bento-card.lg {
  grid-column: span 4;
}

.bento-card.sm {
  grid-column: span 2;
}

.bento-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  margin-bottom: 6px;
}

.bento-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.bento-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
  letter-spacing: -0.01em;
}

.bento-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--c-text-secondary);
  margin: 0;
  max-width: 46ch;
}

.bento-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-brand);
}

/* ===== 特性 ===== */
.features-section {
  padding: 88px 24px;
  max-width: calc(var(--max-w) + 48px);
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--c-bg-elv);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 28px 26px;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: default;
}

.feature-card:hover {
  border-color: color-mix(in srgb, var(--c-brand) 40%, var(--c-border));
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(60, 45, 20, 0.08);
}

.feature-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  margin-bottom: 16px;
}

.feature-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.feature-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 8px;
}

.feature-desc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--c-text-secondary);
  margin: 0;
}

/* ===== 上手区 ===== */
.start-section {
  padding: 24px 24px 96px;
  max-width: calc(var(--max-w) + 48px);
  margin: 0 auto;
}

.start-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  background: var(--c-bg-elv);
  border: 1px solid var(--c-border);
  border-radius: 18px;
  padding: 48px 52px;
}

.start-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin: 0 0 24px;
}

.start-steps {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.start-steps li {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--c-text-secondary);
}

.start-steps strong {
  color: var(--c-text);
}

.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  border-radius: 8px;
  transform: translateY(2px);
}

.start-visual {
  display: flex;
  justify-content: center;
}

.stack-card {
  width: 100%;
  max-width: 300px;
  background: #1e1b14;
  border: 1px solid #332c20;
  border-radius: 14px;
  padding: 20px 22px;
  font-family: 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 2;
  color: #d8cfc0;
}

.stack-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stack-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ===== Footer ===== */
.home-footer {
  text-align: center;
  padding: 28px 24px;
  border-top: 1px solid var(--c-border-light);
}

.footer-message,
.footer-copyright {
  font-size: 13px;
  color: var(--c-text-muted);
  margin: 0;
  line-height: 1.8;
}

.footer-message a {
  color: var(--c-brand);
  text-decoration: none;
}

.footer-message a:hover {
  text-decoration: underline;
}

/* ===== 响应式 ===== */
@media (max-width: 960px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .hero-section {
    padding-top: 72px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bento-card.lg,
  .bento-card.sm {
    grid-column: span 3;
  }

  .start-card {
    grid-template-columns: 1fr;
    padding: 40px 32px;
  }
}

@media (max-width: 720px) {
  .hero-title {
    font-size: 34px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .bento-card.lg,
  .bento-card.sm {
    grid-column: span 6;
  }
}
</style>
