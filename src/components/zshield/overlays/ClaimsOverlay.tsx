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
    desc: 'Made a transaction in the last 30 days. No transaction details or amounts are disclosed.',
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
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Overview */}
      <div>
        <SectionHeader label="zero-knowledge predicates" />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.75, margin: 0 }}>
          Claims prove properties of your Zcash identity without revealing the underlying data.
          Each predicate is evaluated against the shielded pool state — the result is
          true/false only.
        </p>
      </div>

      {/* Claim rows */}
      <div>
        <SectionHeader label="active claims" />
        <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
          {CLAIMS.map((c, i) => (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '14px 16px', gap: 16, alignItems: 'start',
              borderBottom: i < CLAIMS.length - 1 ? '1px solid var(--line-soft)' : undefined,
            }}>
              <div>
                {/* ID + type badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <code style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold-bright)',
                    background: 'rgba(244,183,40,0.08)', padding: '2px 7px',
                    border: '1px solid var(--line)',
                  }}>{c.id}</code>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    padding: '2px 7px', letterSpacing: '0.18em', textTransform: 'uppercase',
                    border: `1px solid ${c.type === 'balance' ? 'rgba(244,183,40,0.4)' : 'rgba(77,255,179,0.4)'}`,
                    color: c.type === 'balance' ? 'var(--gold)' : 'var(--ok)',
                  }}>{c.type}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)' }}>{c.threshold}</span>
                </div>
                {/* Label + desc */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
              {/* Status badge */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px',
                border: `1px solid ${c.verified ? 'var(--ok)' : 'var(--line)'}`,
                color: c.verified ? 'var(--ok)' : 'var(--ink-mute)',
                letterSpacing: '0.18em', textTransform: 'uppercase', flexShrink: 0, marginTop: 2,
              }}>{c.verified ? '✓ verified' : '· pending'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Predicate resolution */}
      <div>
        <SectionHeader label="predicate resolution" />
        <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
          {PREDICATES.map((p, i) => (
            <div key={i} style={{
              borderBottom: i < PREDICATES.length - 1 ? '1px solid var(--line-soft)' : undefined,
              padding: '12px 14px',
            }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold-bright)', display: 'block', marginBottom: 5 }}>
                $ {p.fn}
              </code>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
                → {p.impl}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo note */}
      <div style={{ padding: '12px 16px', border: '1px solid rgba(244,183,40,0.18)', background: 'rgba(244,183,40,0.02)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
          <span style={{ color: 'var(--gold)' }}>demo:</span> Claims currently return hardcoded values.
          Production queries <code style={{ color: 'var(--gold-bright)' }}>mainnet.lightwalletd.com:9067</code> via
          gRPC and uses the address viewing key to scan shielded state.
        </div>
      </div>

    </div>
  )
}
