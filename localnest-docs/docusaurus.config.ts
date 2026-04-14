import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const VERSION = '0.3.0-beta.2'
const STABLE_VERSION = '0.2.0'
const TOOL_COUNT = '74'

const config: Config = {
  title: 'LocalNest',
  tagline: `Your AI's home base — local memory and code search with ${TOOL_COUNT} MCP tools`,
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
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: `LocalNest is a local-first MCP server with ${TOOL_COUNT} tools, temporal knowledge graph, persistent AI memory, and an interactive TUI dashboard. Zero cloud, 100% privacy.`
      }
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'MCP server, local AI tools, knowledge graph, AI memory, semantic code search, offline AI, local-first development, TUI dashboard, agent memory, private AI context'
      }
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image',
        content: 'https://wmt-mobile.github.io/localnest/img/tui-dashboard.png'
      }
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: `Local-first MCP server with ${TOOL_COUNT} tools, temporal knowledge graph, and persistent AI memory. Featuring a premium interactive TUI for real-time AI context monitoring.`
      }
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website'
      }
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image'
      }
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:image',
        content: 'https://wmt-mobile.github.io/localnest/img/tui-dashboard.png'
      }
    },
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
            description: `Documentation for LocalNest — a local-first MCP server with ${TOOL_COUNT} tools, temporal knowledge graph, and persistent AI memory.`,
            inLanguage: 'en',
            publisher: {
              '@type': 'Organization',
              name: 'LocalNest'
            }
          },
          {
            '@type': 'SoftwareApplication',
            name: 'LocalNest MCP',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'macOS, Linux, Windows',
            softwareVersion: VERSION,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            url: 'https://www.npmjs.com/package/localnest-mcp',
            description: `Local-first MCP server with ${TOOL_COUNT} tools, temporal knowledge graph, and persistent AI memory for AI coding agents.`
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
          editUrl: 'https://github.com/wmt-mobile/localnest/edit/main/localnest-docs/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          sidebarCollapsible: true,
          sidebarCollapsed: false
        },
        blog: false,
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
        },
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],
  themeConfig: {
    image: 'img/social-card.svg',
    metadata: [
      { name: 'og:title', content: 'LocalNest — Your AI\'s home base' },
      { name: 'og:site_name', content: 'LocalNest Docs' },
    ],
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
          href: 'https://github.com/wmt-mobile/localnest',
          label: 'GitHub',
          position: 'right'
        },
        {
          href: 'https://www.npmjs.com/package/localnest-mcp',
          label: 'v0.3.0-beta.2',
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
            { label: 'Getting Started', to: '/docs' },
            { label: 'Install', to: '/docs/setup/install' },
            { label: 'Tools', to: '/docs/tools/overview' },
            { label: 'Architecture', to: '/docs/architecture' }
          ]
        },
        {
          title: 'Releases',
          items: [
            { label: 'Current (0.3.0-beta.2)', to: '/docs/releases/current' },
            { label: 'Release History', to: '/docs/releases/history' }
          ]
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/wmt-mobile/localnest' },
            { label: 'npm', href: 'https://www.npmjs.com/package/localnest-mcp' },
            { label: 'Issues', href: 'https://github.com/wmt-mobile/localnest/issues' }
          ]
        }
      ],
      copyright: `Copyright ${new Date().getFullYear()} LocalNest. MIT License.`
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
