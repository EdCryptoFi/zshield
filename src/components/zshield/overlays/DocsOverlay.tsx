'use client'

const ENDPOINTS = [
  { method: 'GET',  path: '/.well-known/openid-configuration', desc: 'OIDC discovery document' },
  { method: 'POST', path: '/api/challenge',                     desc: 'Generate a nonce for signing' },
  { method: 'POST', path: '/api/verify',                        desc: 'Verify ZIP 304 signature, issue JWT' },
  { method: 'POST', path: '/api/oidc/token',                    desc: 'OAuth2 token exchange' },
  { method: 'GET',  path: '/api/oidc/userinfo',                 desc: 'Returns address, DID, ZK claims' },
  { method: 'GET',  path: '/api/oidc/jwks',                     desc: 'JSON Web Key Set for JWT validation' },
]

const CODE_SNIPPET = `// NextAuth.js integration example
import NextAuth from 'next-auth'

export const { handlers, auth } = NextAuth({
  providers: [{
    id: 'zcash',
    name: 'Zcash',
    type: 'oidc',
    issuer: 'https://zshield.vercel.app',
    clientId: process.env.ZCASH_CLIENT_ID,
    clientSecret: process.env.ZCASH_CLIENT_SECRET,
  }],
})`

const STACK = [
  { label: 'Identity layer', value: 'W3C DID v1.1 · did:zcash method' },
  { label: 'Auth protocol', value: 'OIDC Authorization Code + PKCE' },
  { label: 'Signature scheme', value: 'ZIP 304 (Ed25519 stand-in for demo)' },
  { label: 'ZK claims', value: 'Custom predicates via lightwalletd gRPC' },
  { label: 'Token format', value: 'JWT · EdDSA · HS256 (demo)' },
  { label: 'Address encoding', value: 'bech32m · zauth1 prefix (demo)' },
]

export default function DocsOverlay() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Intro */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gold)', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          OIDC · DID · API Reference
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.7, margin: 0 }}>
          ZShield is a standard OIDC provider. Any app that supports "Sign in with Google" can support "Sign in with Zcash" — just point it at the discovery endpoint.
        </p>
      </div>

      {/* Endpoints */}
      <div className="zs-card" style={{ padding: 20 }}>
        <div className="label-gold" style={{ marginBottom: 14 }}>API endpoints</div>
        <div style={{ display: 'grid', gap: 1, background: 'var(--line)' }}>
          {ENDPOINTS.map((e, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '52px 1fr auto',
              alignItems: 'center', gap: 12,
              padding: '11px 12px', background: 'var(--bg)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 0',
                color: e.method === 'GET' ? 'var(--ok)' : 'var(--gold)',
                letterSpacing: '0.18em',
              }}>{e.method}</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', wordBreak: 'break-all' }}>{e.path}</code>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{e.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code snippet */}
      <div className="zs-card" style={{ padding: 20 }}>
        <div className="label-gold" style={{ marginBottom: 14 }}>integration example</div>
        <pre style={{
          margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-dim)', lineHeight: 1.65,
          background: 'rgba(0,0,0,0.3)', padding: 16,
          border: '1px solid var(--line-soft)', overflow: 'auto',
        }}><code style={{ color: 'var(--gold-bright)' }}>{CODE_SNIPPET}</code></pre>
      </div>

      {/* Tech stack */}
      <div className="zs-card" style={{ padding: 20 }}>
        <div className="label-gold" style={{ marginBottom: 14 }}>tech stack</div>
        <div style={{ display: 'grid', gap: 1, background: 'var(--line)' }}>
          {STACK.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '10px 12px', background: 'var(--bg)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Production path */}
      <div style={{ padding: '16px 18px', border: '1px solid rgba(244,183,40,0.2)', background: 'rgba(244,183,40,0.02)' }}>
        <div className="label-gold" style={{ marginBottom: 8 }}>production roadmap</div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'grid', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.65 }}>
          {[
            'Replace Ed25519 with real ZIP 304 via librustzcash WASM',
            'Integrate Zashi / Zingolib wallet for mobile signing',
            'Add lightwalletd gRPC queries for real ZK claims',
            'QR code flow for mobile wallet signing',
            'Redis nonce store for production deployments',
          ].map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  )
}
