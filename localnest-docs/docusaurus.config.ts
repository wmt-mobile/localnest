import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'LocalNest',
  tagline: 'Your AI\'s home base — local memory and code search for AI agents',
  favicon: 'img/logo-mark.svg',
  url: 'https://wmt-mobile.github.io',
  baseUrl: '/localnest/',
  organizationName: 'wmt-mobile',
  projectName: 'localnest',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn'
    }
  },
  themes: [
    '@docusaurus/theme-mermaid',
    ['@easyops-cn/docusaurus-search-local', {
      hashed: true,
      indexBlog: false,
      docsRouteBasePath: '/docs',
      highlightSearchTermsOnTargetPage: true,
      searchBarShortcutHint: true,
    }],
  ],
  plugins: [
    ['docusaurus-plugin-llms', {
      generateLLMsTxt: true,
      generateLLMsFullTxt: true,
    }],
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json'
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'LocalNest Docs',
            url: 'https://wmt-mobile.github.io/localnest/',
            inLanguage: 'en',
            publisher: {
              '@type': 'Organization',
              name: 'LocalNest'
            }
          },
          {
            '@type': 'Organization',
            name: 'LocalNest',
            url: 'https://github.com/wmt-mobile/localnest'
          }
        ]
      })
    }
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          sidebarCollapsible: true,
          sidebarCollapsed: false
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],
  themeConfig: {
    image: 'img/social-card.svg',
    navbar: {
      title: 'LocalNest',
      logo: {
        alt: 'LocalNest',
        src: 'img/logo-mark.svg'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs'
        },
        {
          to: '/docs/releases/current',
          label: 'Release Notes',
          position: 'left'
        },
        {
          href: 'https://www.npmjs.com/package/localnest-mcp',
          label: 'v0.1.0',
          position: 'right'
        },
        {
          href: 'https://github.com/wmt-mobile/localnest',
          label: 'GitHub',
          position: 'right'
        },
        {
          href: 'https://www.npmjs.com/package/localnest-mcp',
          label: 'npm',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Overview', to: '/docs' },
            { label: 'Setup', to: '/docs/setup/install' },
            { label: 'Tools', to: '/docs/tools/overview' }
          ]
        },
        {
          title: 'Versions',
          items: [
            { label: 'Current (0.1.0)', to: '/docs/releases/current' },
            { label: 'Release matrix', to: '/docs/releases/history' }
          ]
        },
        {
          title: 'Project',
          items: [
            { label: 'GitHub', href: 'https://github.com/wmt-mobile/localnest' },
            { label: 'npm', href: 'https://www.npmjs.com/package/localnest-mcp' }
          ]
        }
      ],
      copyright: `Copyright ${new Date().getFullYear()} LocalNest`
    },
    prism: {
      additionalLanguages: ['bash', 'json', 'typescript', 'python', 'diff', 'sql', 'yaml', 'toml'],
      theme: {
        plain: {
          color: '#e5e5e5',
          backgroundColor: '#0a0a0a'
        },
        styles: []
      },
      darkTheme: {
        plain: {
          color: '#e5e5e5',
          backgroundColor: '#0a0a0a'
        },
        styles: []
      }
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true
    }
  } satisfies Preset.ThemeConfig
}

export default config
