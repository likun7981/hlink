import { defineConfig } from 'vitepress'
import others from '../other'

export default defineConfig({
  title: 'hlink',
  description: '批量、快速硬链工具',

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]],

  vue: {
    reactivityTransform: true
  },

  themeConfig: {
    logo: '/logo.svg',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: '更新此文档',
    repo: 'likun7981/hlink',
    repoLabel: 'github',
    nav: [
      { text: '如何贡献文档', link: '/other/contributing' },
      { text: '常见问题', link: '/other/troubleshooting' },
      {
        text: '相关链接',
        items: [
          {
            text: '更新日志',
            link: 'https://github.com/likun7981/hlink/releases'
          },
          { text: '作者的github', link: 'https://github.com/likun7981' }
        ]
      }
    ],

    sidebar: {
      '/': [
        {
          text: '引言',
          children: [
            {
              text: '为什么是hlink',
              link: '/guide/why'
            },
            {
              text: '快速开始',
              link: '/guide/'
            }
          ]
        },
        {
          text: '安装',
          children: [
            {
              text: 'nodejs',
              link: '/install/nodejs'
            },
            {
              text: 'hlink',
              link: '/install/hlink'
            }
          ]
        },
        {
          text: '使用介绍',
          children: [
            {
              text: '主命令',
              link: '/command/'
            },
            {
              text: 'prune命令',
              link: '/command/prune'
            }
          ]
        },
        {
          text: '其他',
          children: others.map(o => ({
            text: o.text,
            link: `/other/${o.link}`
          }))
        }
      ]
    }
  }
})
