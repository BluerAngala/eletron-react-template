import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'Electron React Template',
  tagline: '一套壳，装下你所有的小工具。Electron + React 桌面应用模板。',
  favicon: 'img/favicon.ico',

  // GitHub Pages 部署：https://<user>.github.io/<repo>/
  url: 'https://BluerAngala.github.io',
  baseUrl: '/eletron-react-template/',
  organizationName: 'BluerAngala',
  projectName: 'eletron-react-template',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeConfigs: {
      'zh-CN': { label: '简体中文', htmlLang: 'zh-CN' },
      en: { label: 'English', htmlLang: 'en' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // 全局 SEO meta：所有页面带上关键词 + OG/Twitter 分享图
    metadata: [
      {
        name: 'keywords',
        content: 'electron, react, typescript, 桌面应用, 模板, 可插拔, desktop app template',
      },
      {
        name: 'og:image',
        content: 'https://BluerAngala.github.io/eletron-react-template/img/og.png',
      },
      { name: 'og:title', content: 'Electron React Template — 一套壳，装下你的所有小工具' },
      {
        name: 'og:description',
        content: '一个可插拔的桌面应用模板：配置即开关，一条命令加一个新工具。',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:image',
        content: 'https://BluerAngala.github.io/eletron-react-template/img/og.png',
      },
    ],
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Electron React Template',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' },
        {
          href: 'https://github.com/BluerAngala/eletron-react-template',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Quick Start', to: '/docs/quickstart' },
            { label: 'Feature Development', to: '/docs/feature-development' },
            { label: 'Architecture', to: '/docs/architecture' },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/BluerAngala/eletron-react-template',
            },
            {
              label: 'Issues',
              href: 'https://github.com/BluerAngala/eletron-react-template/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BluerAngala. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
