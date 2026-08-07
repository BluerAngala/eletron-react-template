import Link from '@docusaurus/Link'
import Translate from '@docusaurus/Translate'
import {
  IconArrowRight,
  IconBolt,
  IconLanguage,
  IconMoon,
  IconPlug,
  IconTerminal2,
  IconTestPipe,
  IconToggleLeft,
} from '@tabler/icons-react'
import Layout from '@theme/Layout'
import styles from './index.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div>
          <p className={styles.heroEyebrow}>Electron · React · TypeScript</p>
          <h1 className={styles.heroTitle}>
            <Translate>一套壳，装下你的</Translate>{' '}
            <span className={styles.heroTitleAccent}>
              <Translate>所有小工具</Translate>
            </span>
          </h1>
          <p className={styles.heroSub}>
            <Translate>
              一个可插拔的桌面应用模板：配置即开关，一条命令加一个新工具。不用懂架构，照着文档写页面就行。
            </Translate>
          </p>
          <div className={styles.heroActions}>
            <Link className={`${styles.heroCta} ${styles.heroCtaPrimary}`} to="/docs/quickstart">
              <Translate>快速开始</Translate>
              <IconArrowRight size={18} />
            </Link>
            <Link className={`${styles.heroCta} ${styles.heroCtaGhost}`} to="/docs/intro">
              <Translate>查看文档</Translate>
            </Link>
          </div>
        </div>

        <div className={styles.cmdPanel}>
          <div className={styles.cmdTopbar}>
            <span className={styles.cmdDot} />
            <span className={styles.cmdDot} />
            <span className={styles.cmdDot} />
            <span className={styles.cmdTitle}>terminal — feature:new</span>
          </div>
          <div className={styles.cmdBody}>
            <div className={styles.cmdLine}>
              <span className={styles.cmdPrompt}>$</span>{' '}
              <span className={styles.cmdText}>pnpm feature:new json-tools</span>
            </div>
            <div className={styles.cmdLine}>
              <span className={styles.cmdOk}>✅</span>{' '}
              <span className={styles.cmdText}>已生成 packages/feature-json-tools</span>
            </div>
            <div className={styles.cmdLine}>
              <span className={styles.cmdText}>　 自动接入：开关 + 注册表 + 依赖</span>
            </div>
            <div className={styles.cmdLine}>
              <span className={styles.cmdPrompt}>$</span>{' '}
              <span className={styles.cmdText}>pnpm dev</span>
            </div>
            <div className={styles.cmdLine}>
              <span className={styles.cmdComment}># 侧边栏出现你的工具，点进去开始写</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Translate>为"攒工具"而设计</Translate>
        </h2>
        <p className={styles.sectionLead}>
          <Translate>每个工具是一个独立模块，互不干扰；加一个、关一个都只改一行配置。</Translate>
        </p>
      </div>

      <div className={styles.bento}>
        <div className={`${styles.bentoCell} ${styles.bentoBig}`}>
          <p className={styles.bentoTitle}>
            <Translate>可插拔功能</Translate>
          </p>
          <p className={styles.bentoDesc}>
            <Translate>
              每个功能包自带页面、IPC 与多语言。一条命令生成骨架并自动接入宿主，不用碰任何注册逻辑。
            </Translate>
          </p>
          <div className={styles.bentoCode}>
            <div>
              <span className={styles.cmdPrompt}>$</span> <span>pnpm feature:new my-tool</span>
            </div>
            <div>
              <span className={styles.cmdComment}># → packages/feature-my-tool/</span>
            </div>
          </div>
        </div>

        <div className={`${styles.bentoCell} ${styles.bentoTint}`}>
          <IconToggleLeft size={22} />
          <p className={styles.bentoTitle}>
            <Translate>配置即开关</Translate>
          </p>
          <p className={styles.bentoDesc}>
            <Translate>改一行 enabledFeatures，工具上架或下架，无需任何命令。</Translate>
          </p>
        </div>

        <div className={`${styles.bentoCell} ${styles.bentoHalf}`}>
          <IconLanguage size={22} />
          <p className={styles.bentoTitle}>
            <Translate>中英双语</Translate>
          </p>
          <p className={styles.bentoDesc}>
            <Translate>内置 i18n，运行时切换 zh-CN / en-US，文案按命名空间拆分。</Translate>
          </p>
        </div>

        <div className={`${styles.bentoCell} ${styles.bentoHalf}`}>
          <IconBolt size={22} />
          <p className={styles.bentoTitle}>
            <Translate>主题 · 日志 · 测试</Translate>
          </p>
          <p className={styles.bentoDesc}>
            <Translate>暗色模式、统一结构化日志、Vitest + Playwright 开箱即用。</Translate>
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Translate>三步加一个新工具</Translate>
        </h2>
      </div>
      <div className={styles.steps}>
        <div className={styles.step}>
          <span className={styles.stepNum}>01</span>
          <p className={styles.stepTitle}>
            <Translate>创建</Translate>
          </p>
          <p className={styles.stepDesc}>
            <Translate>一条命令生成功能包骨架，自动接入宿主。</Translate>
          </p>
          <code className={styles.stepCmd}>pnpm feature:new json-tools</code>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>02</span>
          <p className={styles.stepTitle}>
            <Translate>启动</Translate>
          </p>
          <p className={styles.stepDesc}>
            <Translate>启动应用，侧边栏就能看到你的新工具。</Translate>
          </p>
          <code className={styles.stepCmd}>pnpm dev</code>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>03</span>
          <p className={styles.stepTitle}>
            <Translate>开发</Translate>
          </p>
          <p className={styles.stepDesc}>
            <Translate>只改一个文件（renderer.tsx），把示例换成你的逻辑。</Translate>
          </p>
          <code className={styles.stepCmd}>packages/…/src/renderer.tsx</code>
        </div>
      </div>
    </section>
  )
}

function Capabilities() {
  const items = [
    {
      icon: IconLanguage,
      name: <Translate>国际化</Translate>,
      desc: <Translate>中英双语，命名空间拆分，新增语言即插即用。</Translate>,
    },
    {
      icon: IconTerminal2,
      name: <Translate>统一日志</Translate>,
      desc: <Translate>主进程与渲染进程统一 logger，内置日志查看页。</Translate>,
    },
    {
      icon: IconMoon,
      name: <Translate>主题系统</Translate>,
      desc: <Translate>亮色 / 暗色 / 跟随系统，Tailwind v4 变量驱动。</Translate>,
    },
    {
      icon: IconTestPipe,
      name: <Translate>测试</Translate>,
      desc: <Translate>Vitest 单元测试 + Playwright E2E，CI 自动跑。</Translate>,
    },
    {
      icon: IconPlug,
      name: <Translate>单一工具链</Translate>,
      desc: <Translate>Biome 同时管 lint 与 format，零配置陷阱。</Translate>,
    },
    {
      icon: IconBolt,
      name: <Translate>一键发布</Translate>,
      desc: <Translate>electron-builder 三平台打包 + GitHub Release + 自动更新。</Translate>,
    },
  ]
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Translate>开箱即用的地基</Translate>
        </h2>
      </div>
      <div className={styles.caps}>
        {items.map(({ icon: Icon, name, desc }) => (
          <div className={styles.capRow} key={name.key}>
            <p className={styles.capName}>
              <span className={styles.capIcon}>
                <Icon size={20} />
              </span>
              {name}
            </p>
            <p className={styles.capDesc}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className={styles.section}>
      <div className={styles.ctaBlock}>
        <h2 className={styles.ctaTitle}>
          <Translate>开始攒你的第一个工具</Translate>
        </h2>
        <p className={styles.ctaSub}>
          <Translate>三分钟跑通，之后就是一个个往上加。</Translate>
        </p>
        <Link className={`${styles.heroCta} ${styles.heroCtaPrimary}`} to="/docs/quickstart">
          <Translate>快速开始</Translate>
          <IconArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <Layout
      title="Electron React Template"
      description="一套壳，装下你的所有小工具。Electron + React 桌面应用模板。"
    >
      <Hero />
      <Features />
      <HowItWorks />
      <Capabilities />
      <Cta />
    </Layout>
  )
}
