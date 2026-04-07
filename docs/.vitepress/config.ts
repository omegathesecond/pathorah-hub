import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Pathorah Hub',
  description: 'Product & Engineering Strategy Center for Pathorah',
  base: '/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Product', link: '/product/' },
      { text: 'Business', link: '/business/' },
      { text: 'Development', link: '/development/' },
      { text: 'Analytics', link: '/analytics/' }
    ],
    sidebar: {
      '/product/': [
        {
          text: 'Product Overview',
          items: [
            { text: 'Introduction', link: '/product/' },
            { text: 'Roadmap', link: '/product/roadmap' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Core Features', link: '/product/features/core' },
            { text: 'Heterogeneous Graph', link: '/product/features/heterogeneous-graph' },
            { text: 'Representative Verification', link: '/product/features/representative-verification' }
          ]
        },
        {
          text: 'Technical',
          items: [
            { text: 'Architecture', link: '/product/technical/architecture' },
            { text: 'Tech Stack', link: '/product/technical/stack' },
            { text: 'API Reference', link: '/product/technical/api' },
            { text: 'Pathfinding Engine', link: '/product/technical/pathfinding' },
            { text: 'Data Models', link: '/product/technical/models' }
          ]
        }
      ],
      '/business/': [
        {
          text: 'Business Overview',
          items: [
            { text: 'Executive Summary', link: '/business/' },
            { text: 'Business Model', link: '/business/model' },
            { text: 'Value Proposition', link: '/business/value-proposition' }
          ]
        },
        {
          text: 'Market Analysis',
          items: [
            { text: 'Market Overview', link: '/business/market/' }
          ]
        },
        {
          text: 'Go-to-Market',
          items: [
            { text: 'GTM Strategy', link: '/business/gtm/' }
          ]
        }
      ],
      '/development/': [
        {
          text: 'Development',
          items: [
            { text: 'Overview', link: '/development/' },
            { text: 'Current Sprint', link: '/development/current/' },
            { text: 'Changelog', link: '/development/changelog' }
          ]
        },
        {
          text: 'Planning',
          items: [
            { text: 'Sprints', link: '/development/planning/sprints' },
            { text: 'Backlog', link: '/development/planning/backlog' }
          ]
        },
        {
          text: 'Workflow',
          items: [
            { text: 'Git Workflow', link: '/development/workflow/git' },
            { text: 'Deployment', link: '/development/workflow/deployment' }
          ]
        }
      ],
      '/analytics/': [
        {
          text: 'Analytics',
          items: [
            { text: 'Dashboard', link: '/analytics/' },
            { text: 'Business Metrics', link: '/analytics/metrics/business' },
            { text: 'Product Metrics', link: '/analytics/metrics/product' }
          ]
        }
      ]
    },
    search: { provider: 'local' },
    lastUpdated: { text: 'Last updated' }
  },
  markdown: {
    lineNumbers: true
  }
})