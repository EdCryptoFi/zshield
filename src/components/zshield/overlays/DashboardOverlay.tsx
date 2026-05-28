'use client'

import { useMemo } from 'react'

const PROVEN = [
  { label: 'Address ownership', desc: 'You control this Zcash address via cryptographic signature' },
  { label: 'ZEC holder ≥ 1.0', desc: 'Hold ZEC without revealing your balance' },
  { label: 'Active user', desc: 'You transacted recently on the Zcash network' },
]

const HIDDEN = [
  'Your real-world identity',
  'Your exact ZEC balance',
  'Your transaction history',
  'Your email, phone, or IP',
  'Links between your addresses',
]

const TIMELINE = [
  { step: 'Wallet signed a nonce', detail: 'Server sent a random challenge → wallet signed with private key → server verified' },
  { step: 'DID created', detail: 'did:zcash:mainnet:address → resolves to W3C DID Document with your public key' },
  { step: 'ZK claims resolved', detail: 'Proved you hold ZEC and are active — balance stays private via shielded pool' },
  { step: 'OIDC token issued', detail: 'Standard JWT signed with EdDSA — any OAuth2 app can verify via JWKS endpoint' },
]

export default function DashboardOverlay() {
  const did = 'did:zcash:mainnet:zauth1a8f3c9d2e1b47596f0a3c8e1d4b27f90e8c4a'

  const didDoc = JSON.stringify({
    '@context': ['https://www.w3.org/ns/did/v1','https://w3id.org/security/suites/zcash-2024/v1'],
    id: did,
    verificationMethod: [{
      id: did + '#key-1', type: 'ZcashShieldedKey2024',
      controller: did,
      publicKeyMultibase: 'z6Mkf4a3c9d2e1b47596f0a3c8e1d4b27f90e8c4a',
    }],
    authentication: [did + '#key-1'],
    service: [{ id: did + '#oidc', type: 'OIDCProvider', serviceEndpoint: 'https://zshield.vercel.app/api/oidc' }],
  }, null, 2)

  const chartBars = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const v = Math.sin(i / 6) * 0.3 + 0.5 + (i % 7 === 0 ? 0.25 : 0)
    return Math.max(0.08, Math.min(1, v))
  }), [])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Identity header */}
      <div className="zs-card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, alignItems: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #ffd866, #c8941b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: '#0a0700',
          flexShrink: 0,
        }}>Z</div>
        <div>
          <div className="label-gold" style={{ marginBottom: 5 }}>↳ verified identity · session active</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold-bright)' }}>
            {did.slice(0, 30)}<span style={{ color: 'var(--ink-mute)' }}>…</span>{did.slice(-10)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ok)', letterSpacing: '0.2em' }}>● ONLINE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.18em', marginTop: 2 }}>DEMO SESSION</div>
        </div>
      </div>

      {/* Proven vs Hidden */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="zs-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ok)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>Proven</span>
          </div>
          {PROVEN.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <span style={{ color: 'var(--ok)', fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="zs-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-mute)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>Never revealed</span>
          </div>
          {HIDDEN.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 12, marginTop: 1 }}>✗</span>
              <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="zs-card" style={{ padding: 20 }}>
        <div className="label-gold" style={{ marginBottom: 16 }}>what just happened</div>
        {TIMELINE.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < TIMELINE.length - 1 ? 14 : 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(77,255,179,0.12)', border: '1px solid rgba(77,255,179,0.35)',
              color: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{t.step}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', marginTop: 3, lineHeight: 1.6 }}>{t.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="zs-card" style={{ padding: 20 }}>
        <div className="label-gold" style={{ marginBottom: 14 }}>proof timeline · demo</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${chartBars.length}, 1fr)`, gap: 2, alignItems: 'end', height: 80 }}>
          {chartBars.map((b, i) => (
            <div key={i} style={{
              height: `${b * 100}%`,
              background: i === chartBars.length - 1 ? 'var(--gold-bright)' : 'var(--gold)',
              opacity: 0.3 + b * 0.6,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {['00:00','06:00','12:00','18:00','now'].map(t => (
            <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* DID doc */}
      <details style={{ border: '1px solid var(--line)', background: 'rgba(244,183,40,0.02)' }}>
        <summary style={{
          padding: '14px 18px', cursor: 'pointer', color: 'var(--ink)',
          fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
          userSelect: 'none', listStyle: 'none',
        }}>
          → DID Document · W3C standard
        </summary>
        <pre style={{
          margin: 0, padding: '0 18px 18px',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
          overflow: 'auto', maxHeight: 220, background: 'transparent',
        }}>{didDoc}</pre>
      </details>
    </div>
  )
}
