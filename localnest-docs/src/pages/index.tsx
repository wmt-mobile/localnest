import React from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'

const features = [
  {
    title: 'Hybrid Search',
    description: 'Lexical + semantic search fused with RRF ranking. ripgrep for speed, MiniLM-L6-v2 for meaning.'
  },
  {
    title: 'Knowledge Graph',
    description: 'Temporal subject-predicate-object triples. Query what was true at any point in time.'
  },
  {
    title: 'Multi-Hop Traversal',
    description: 'Walk relationships 2-5 hops deep via recursive CTEs. No other local tool does this.'
  },
  {
    title: 'Agent Memory',
    description: 'Durable, queryable memory that persists across sessions. Per-agent isolation with private diaries.'
  },
  {
    title: 'Semantic Dedup',
    description: 'Embedding similarity gate catches near-duplicates before storage. Your memory stays clean.'
  },
  {
    title: 'Zero Cloud',
    description: 'Pure SQLite. No external databases, no API keys, no subscriptions. Everything stays on your machine.'
  }
]

const guides = [
  {
    title: 'Install',
    href: '/docs/setup/install',
    description: 'Package, skill, MCP config, and doctor checks.'
  },
  {
    title: 'Configuration',
    href: '/docs/setup/configuration',
    description: 'Roots, env vars, index backends, memory.'
  },
  {
    title: 'Tools Reference',
    href: '/docs/tools/overview',
    description: 'All 52 MCP tools across 11 groups.'
  },
  {
    title: 'Architecture',
    href: '/docs/architecture',
    description: 'Boot flow, retrieval pipeline, memory graph.'
  }
]

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="LocalNest — Your AI's home base"
      description="Local-first MCP server with 52 tools, temporal knowledge graph, persistent AI memory, and semantic code search. No cloud, no leaks."
    >
      <main className="siteHome">
        <section className="siteHome__hero">
          <p style={{ color: 'var(--ln-accent)', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
            Your AI's home base
          </p>
          <h1>Local memory and code search for AI agents.</h1>
          <p>
            52 MCP tools, temporal knowledge graph, and persistent memory — running entirely on your machine.
            No cloud, no leaks, no surprises.
          </p>
          <div className="siteHome__actions">
            <Link className="button button--primary button--lg" to="/docs">
              Get Started
            </Link>
            <Link className="button button--secondary button--lg" to="https://github.com/wmt-mobile/localnest">
              GitHub
            </Link>
          </div>
        </section>

        <div className="siteHome__install">
          <pre><code>npm install -g localnest-mcp && localnest setup</code></pre>
        </div>

        <div className="siteHome__stats">
          <div className="siteHome__stat">
            <strong>52</strong>
            <span>MCP Tools</span>
          </div>
          <div className="siteHome__stat">
            <strong>0</strong>
            <span>Cloud deps</span>
          </div>
          <div className="siteHome__stat">
            <strong>v0.1.0</strong>
            <span>Latest</span>
          </div>
          <div className="siteHome__stat">
            <strong>MIT</strong>
            <span>License</span>
          </div>
        </div>

        <section className="siteHome__section">
          <div className="siteHome__sectionHeader">
            <h2>Features</h2>
          </div>
          <div className="siteHome__features">
            {features.map((feature) => (
              <div key={feature.title} className="siteHome__feature">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="siteHome__section">
          <div className="siteHome__sectionHeader">
            <h2>Documentation</h2>
            <p>Everything you need to get started.</p>
          </div>
          <div className="docGrid docGrid--2">
            {guides.map((guide) => (
              <Link key={guide.href} className="docLinkCard" to={guide.href}>
                <strong>{guide.title}</strong>
                <span>{guide.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  )
}
