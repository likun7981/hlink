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
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: '更新此文档',
    repo: 'likun7981/hlink',

    nav: [
      { text: '快速开始', link: '/guide/' },
      { text: '使用介绍', link: '/command/' },
      { text: '其他教程', link: '/other/contributing' }
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
              text: '所需环境',
              link: '/install/env'
            },
            {
              text: '安装hlink',
              link: '/install/hlink'
            }
          ]
        },
        {
          text: '使用介绍',
          children: [
            {
              text: 'hlink',
              link: '/command/'
            },
            {
              text: 'hlink prune',
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
