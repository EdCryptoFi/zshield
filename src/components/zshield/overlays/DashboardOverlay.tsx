'use client'

import { useMemo } from 'react'

const PROVEN = [
  { label: 'Address ownership',  note: 'Cryptographic signature over server nonce' },
  { label: 'ZEC holder ≥ 1.0',   note: 'Shielded balance threshold — exact amount hidden' },
  { label: 'Active user',         note: 'Transaction in last 30 days — details hidden' },
]

const HIDDEN = [
  'Real-world identity',
  'Exact ZEC balance',
  'Transaction history',
  'Email, phone, or IP address',
  'Links between addresses',
]

const FLOW = [
  { n: '01', step: 'Challenge issued',  detail: 'Server generates a one-time random nonce' },
  { n: '02', step: 'Wallet signed',     detail: 'Private key signs nonce via ZIP 304 (Ed25519 demo)' },
  { n: '03', step: 'DID resolved',      detail: 'did:zcash:mainnet:<addr> → W3C DID Document' },
  { n: '04', step: 'ZK claims proved',  detail: 'Balance + activity confirmed — data stays shielded' },
  { n: '05', step: 'JWT issued',        detail: 'EdDSA-signed token — verifiable via JWKS endpoint' },
]

const DID = 'did:zcash:mainnet:zauth1a8f3c9d2e1b47596f0a3c8e1d4b27f90e8c4a'

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.3em' }}>──</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  )
}

export default function DashboardOverlay() {
  const didDoc = JSON.stringify({
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/zcash-2024/v1'],
    id: DID,
    verificationMethod: [{
      id: DID + '#key-1', type: 'ZcashShieldedKey2024',
      controller: DID,
      publicKeyMultibase: 'z6Mkf4a3c9d2e1b47596f0a3c8e1d4b27f90e8c4a',
    }],
    authentication: [DID + '#key-1'],
    service: [{ id: DID + '#oidc', type: 'OIDCProvider', serviceEndpoint: 'https://zshield.vercel.app/api/oidc' }],
  }, null, 2)

  const chartBars = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const v = Math.sin(i / 6) * 0.3 + 0.5 + (i % 7 === 0 ? 0.25 : 0)
    return Math.max(0.08, Math.min(1, v))
  }), [])

  return (
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Identity header */}
      <div style={{ border: '1px solid var(--line)', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 6 }}>
            verified identity
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold-bright)', wordBreak: 'break-all' }}>
            {DID.slice(0, 32)}<span style={{ color: 'var(--ink-mute)' }}>…</span>{DID.slice(-10)}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ok)', letterSpacing: '0.22em' }}>● ONLINE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.18em', marginTop: 3 }}>DEMO SESSION</div>
        </div>
      </div>

      {/* Proven / Hidden */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <SectionHeader label="proven" />
          <div style={{ display: 'grid', gap: 1, border: '1px solid var(--line)', overflow: 'hidden' }}>
            {PROVEN.map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderBottom: i < PROVEN.length - 1 ? '1px solid var(--line-soft)' : undefined, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--ok)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{p.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.5 }}>{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader label="never revealed" />
          <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
            {HIDDEN.map((h, i) => (
              <div key={i} style={{ padding: '10px 12px', borderBottom: i < HIDDEN.length - 1 ? '1px solid var(--line-soft)' : undefined, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-mute)', fontSize: 11, flexShrink: 0 }}>✗</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth flow */}
      <div>
        <SectionHeader label="auth flow" />
        <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
          {FLOW.map((f, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '42px 1fr',
              borderBottom: i < FLOW.length - 1 ? '1px solid var(--line-soft)' : undefined,
            }}>
              <span style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', fontWeight: 700, borderRight: '1px solid var(--line-soft)' }}>{f.n}</span>
              <div style={{ padding: '9px 14px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{f.step}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.5 }}>{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart */}
      <div>
        <SectionHeader label="proof timeline · demo" />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${chartBars.length}, 1fr)`, gap: 2, alignItems: 'end', height: 60 }}>
          {chartBars.map((b, i) => (
            <div key={i} style={{
              height: `${b * 100}%`,
              background: i === chartBars.length - 1 ? 'var(--gold-bright)' : 'var(--gold)',
              opacity: 0.3 + b * 0.6,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {['00:00', '06:00', '12:00', '18:00', 'now'].map(t => (
            <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* DID Document */}
      <div>
        <SectionHeader label="did document · w3c" />
        <details style={{ border: '1px solid var(--line)' }}>
          <summary style={{
            padding: '11px 14px', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)', letterSpacing: '0.12em',
            userSelect: 'none', listStyle: 'none',
          }}>
            <span style={{ color: 'var(--gold)' }}>▶</span> did:zcash:mainnet:zauth1…
          </summary>
          <pre style={{
            margin: 0, padding: '0 14px 14px',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
            overflow: 'auto', maxHeight: 200, background: 'rgba(0,0,0,0.2)',
          }}>{didDoc}</pre>
        </details>
      </div>

    </div>
  )
}
