import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/eletron-react-template/',
  title: 'Electron React Template',
  description: '基于 Electron + React + TypeScript 的桌面应用模板',
  lang: 'zh-CN',

  themeConfig: {
    logo: '/favicon.ico',
    siteTitle: 'Electron React Template',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '功能', link: '/features/plugin-system' },
      { text: '插件开发', link: '/plugin-dev/getting-started' },
      { text: '开发', link: '/development/architecture' },
      { text: 'GitHub', link: 'https://github.com/BluerAngala/eletron-react-template' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '目录结构', link: '/guide/directory-structure' },
            { text: '开发工作流', link: '/guide/workflow' },
          ],
        },
      ],
      '/features/': [
        {
          text: '功能',
          items: [
            { text: '插件系统', link: '/features/plugin-system' },
            { text: '主题系统', link: '/features/theme-system' },
            { text: '国际化', link: '/features/i18n' },
            { text: '自动更新', link: '/features/auto-update' },
          ],
        },
      ],
      '/development/': [
        {
          text: '开发',
          items: [
            { text: '架构概览', link: '/development/architecture' },
            { text: 'IPC 通信', link: '/development/ipc' },
            { text: '代码规范', link: '/development/code-style' },
            { text: '构建部署', link: '/development/build-deploy' },
          ],
        },
      ],
      '/plugin-dev/': [
        {
          text: '插件开发',
          items: [
            { text: '快速开始', link: '/plugin-dev/getting-started' },
            { text: 'plugin.json 配置', link: '/plugin-dev/plugin-json' },
            { text: '插件 API 参考', link: '/plugin-dev/plugin-api' },
            { text: 'Preload 脚本', link: '/plugin-dev/preload-js' },
            { text: '目录结构', link: '/plugin-dev/file-structure' },
            { text: '发布插件', link: '/plugin-dev/publish' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/BluerAngala/eletron-react-template' },
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: '版权所有 © BluerAngala',
    },
  },
})