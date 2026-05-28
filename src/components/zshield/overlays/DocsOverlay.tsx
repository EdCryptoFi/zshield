'use client'

const ENDPOINTS = [
  { method: 'GET',  path: '/.well-known/openid-configuration', desc: 'OIDC discovery document' },
  { method: 'POST', path: '/api/challenge',                     desc: 'Issue signing nonce' },
  { method: 'POST', path: '/api/verify',                        desc: 'Verify ZIP 304 signature → JWT' },
  { method: 'POST', path: '/api/oidc/token',                    desc: 'OAuth2 token exchange' },
  { method: 'GET',  path: '/api/oidc/userinfo',                 desc: 'Address + DID + ZK claims' },
  { method: 'GET',  path: '/api/oidc/jwks',                     desc: 'JWK Set for JWT validation' },
]

const CODE_SNIPPET = `// NextAuth.js — drop-in integration
import NextAuth from 'next-auth'

export const { handlers, auth } = NextAuth({
  providers: [{
    id:           'zcash',
    name:         'Zcash',
    type:         'oidc',
    issuer:       'https://zshield.vercel.app',
    clientId:     process.env.ZCASH_CLIENT_ID,
    clientSecret: process.env.ZCASH_CLIENT_SECRET,
  }],
})`

const STACK = [
  { k: 'Identity',   v: 'W3C DID v1.1 · did:zcash method' },
  { k: 'Protocol',   v: 'OIDC Authorization Code + PKCE' },
  { k: 'Signature',  v: 'ZIP 304 — Ed25519 (stand-in for demo)' },
  { k: 'ZK claims',  v: 'Custom predicates · lightwalletd gRPC' },
  { k: 'Token',      v: 'JWT · EdDSA · HS256 (demo)' },
  { k: 'Address',    v: 'bech32m · zauth1 prefix (demo)' },
]

const ROADMAP = [
  'Replace Ed25519 stub → real ZIP 304 via librustzcash WASM',
  'Zashi / Zingolib mobile wallet signing',
  'Live ZK claims via lightwalletd gRPC on mainnet',
  'QR code flow for mobile wallet pairing',
  'Redis nonce store for multi-instance deployments',
]

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>──</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  )
}

export default function DocsOverlay() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Overview */}
      <div>
        <SectionHeader label="overview" />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.75, margin: 0 }}>
          ZShield is a drop-in OIDC provider. Any app that supports Sign in with Google supports
          Sign in with Zcash — point it at the discovery endpoint below.
        </p>
      </div>

      {/* Endpoints */}
      <div>
        <SectionHeader label="api endpoints" />
        <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
          {ENDPOINTS.map((e, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '54px 1fr',
              alignItems: 'center', gap: 0,
              borderBottom: i < ENDPOINTS.length - 1 ? '1px solid var(--line-soft)' : undefined,
            }}>
              <span style={{
                padding: '10px 12px',
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', fontWeight: 700,
                color: e.method === 'GET' ? 'var(--ok)' : 'var(--gold)',
                borderRight: '1px solid var(--line-soft)',
              }}>{e.method}</span>
              <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', wordBreak: 'break-all' }}>{e.path}</code>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', whiteSpace: 'nowrap', flexShrink: 0 }}>{e.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration example */}
      <div>
        <SectionHeader label="integration example" />
        <pre style={{
          margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-dim)', lineHeight: 1.7,
          background: 'rgba(0,0,0,0.35)', padding: '16px 18px',
          border: '1px solid var(--line)', overflow: 'auto',
        }}><code style={{ color: 'var(--gold-bright)' }}>{CODE_SNIPPET}</code></pre>
      </div>

      {/* Stack */}
      <div>
        <SectionHeader label="tech stack" />
        <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
          {STACK.map((s, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '130px 1fr',
              borderBottom: i < STACK.length - 1 ? '1px solid var(--line-soft)' : undefined,
            }}>
              <span style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.14em', borderRight: '1px solid var(--line-soft)' }}>{s.k}</span>
              <span style={{ padding: '9px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div>
        <SectionHeader label="production roadmap" />
        <div style={{ display: 'grid', gap: 6 }}>
          {ROADMAP.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>[ ]</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
