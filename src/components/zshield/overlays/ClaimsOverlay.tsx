'use client'

const CLAIMS = [
  {
    id: 'zec_holder',
    label: 'ZEC Holder',
    type: 'balance',
    threshold: 'min = 1.0 ZEC',
    desc: 'Holds at least 1.0 ZEC in the shielded pool. Exact balance is never revealed.',
    verified: true,
  },
  {
    id: 'active_user',
    label: 'Active User',
    type: 'activity',
    threshold: 'days = 30',
    desc: 'Made a transaction in the last 30 days. No transaction details or amounts disclosed.',
    verified: true,
  },
  {
    id: 'senior_holder',
    label: 'Senior Holder',
    type: 'balance',
    threshold: 'min = 10 ZEC',
    desc: 'Holds at least 10 ZEC. Used by governance systems and premium access controls.',
    verified: false,
  },
]

const PREDICATES = [
  {
    fn: 'zec_holder(addr, min=1.0)',
    impl: 'Query lightwalletd gRPC · scan shielded note commitment tree',
  },
  {
    fn: 'active_user(addr, days=30)',
    impl: 'Scan nullifier set for recent spends tied to viewing key',
  },
  {
    fn: 'senior_holder(addr, min=10)',
    impl: 'Aggregate shielded + transparent balance without linking UTXOs',
  },
]

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.3em' }}>──</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  )
}

export default function ClaimsOverlay() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>

      {/* Left: intro + claims */}
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <SectionHeader label="zero-knowledge predicates" />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.75, margin: 0 }}>
            Each claim proves a property of your Zcash identity without revealing the underlying data. The result is a binary true/false verified against the shielded pool state.
          </p>
        </div>

        <div>
          <SectionHeader label="active claims" />
          <div style={{ display: 'grid', gap: 10 }}>
            {CLAIMS.map((c) => (
              <div key={c.id} style={{
                border: '1px solid var(--line)', padding: '14px',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <code style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold-bright)',
                      background: 'rgba(244,183,40,0.08)', padding: '2px 6px',
                      border: '1px solid var(--line)',
                    }}>{c.id}</code>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      padding: '2px 6px', letterSpacing: '0.16em', textTransform: 'uppercase',
                      border: `1px solid ${c.type === 'balance' ? 'rgba(244,183,40,0.4)' : 'rgba(77,255,179,0.4)'}`,
                      color: c.type === 'balance' ? 'var(--gold)' : 'var(--ok)',
                    }}>{c.type}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.6 }}>{c.desc}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px',
                  border: `1px solid ${c.verified ? 'var(--ok)' : 'var(--line)'}`,
                  color: c.verified ? 'var(--ok)' : 'var(--ink-mute)',
                  letterSpacing: '0.16em', textTransform: 'uppercase', flexShrink: 0,
                }}>{c.verified ? '✓ ok' : '· pend'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: predicates + note */}
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <SectionHeader label="predicate resolution" />
          <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
            {PREDICATES.map((p, i) => (
              <div key={i} style={{
                borderBottom: i < PREDICATES.length - 1 ? '1px solid var(--line-soft)' : undefined,
                padding: '12px 14px',
              }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold-bright)', display: 'block', marginBottom: 5 }}>
                  $ {p.fn}
                </code>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
                  → {p.impl}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader label="how it works" />
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { icon: '🔒', title: 'Private by default', note: 'Zcash shielded pool hides balances and transactions.' },
              { icon: '✓', title: 'ZK proof only', note: 'Server learns true/false. No raw data ever leaves your wallet.' },
              { icon: '⚡', title: 'OIDC compatible', note: 'Claims are packed into a standard JWT. Any OAuth2 app can verify.' },
            ].map((item, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', padding: '12px 14px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>
                  {item.icon} {item.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.6 }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 14px', border: '1px solid rgba(244,183,40,0.18)', background: 'rgba(244,183,40,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            <span style={{ color: 'var(--gold)' }}>demo:</span> Claims return hardcoded values.
            Production queries <code style={{ color: 'var(--gold-bright)' }}>mainnet.lightwalletd.com:9067</code> via gRPC.
          </div>
        </div>
      </div>

    </div>
  )
}
