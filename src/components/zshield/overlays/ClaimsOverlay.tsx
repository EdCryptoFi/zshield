'use client'

const CLAIMS = [
  {
    id: 'zec_holder',
    label: 'ZEC Holder',
    desc: 'Proves you hold at least 1.0 ZEC without revealing your exact balance. Resolved via shielded pool state — your balance stays private.',
    verified: true,
    type: 'balance',
  },
  {
    id: 'senior_holder',
    label: 'Senior Holder',
    desc: 'Proves you hold ≥ 10 ZEC. Used by governance systems and premium access controls.',
    verified: false,
    type: 'balance',
  },
  {
    id: 'active_user',
    label: 'Active User',
    desc: 'Proves you made a transaction in the last 30 days. No transaction details are revealed.',
    verified: true,
    type: 'activity',
  },
]

const PREDICATES = [
  { name: 'zec_holder(min=1.0)', note: 'Query lightwalletd gRPC for shielded note commitment tree' },
  { name: 'active_user(days=30)', note: 'Scan nullifier set for recent spends tied to your viewing key' },
  { name: 'senior_holder(min=10)', note: 'Aggregate shielded + transparent balance without linking UTXOs' },
]

export default function ClaimsOverlay() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Intro */}
      <div style={{ padding: '0 0 4px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gold)', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 10px' }}>Zero-Knowledge Predicates</h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.7, margin: 0 }}>
          ZShield issues verifiable claims that prove properties of your Zcash identity without revealing the underlying data. Each claim is a ZK predicate computed from the shielded state.
        </p>
      </div>

      {/* Claim cards */}
      <div style={{ display: 'grid', gap: 14 }}>
        {CLAIMS.map(c => (
          <div key={c.id} className="zs-card" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px',
                  border: `1px solid ${c.type === 'balance' ? 'rgba(244,183,40,0.5)' : 'rgba(77,255,179,0.5)'}`,
                  color: c.type === 'balance' ? 'var(--gold)' : 'var(--ok)',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                }}>{c.type}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>{c.id}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.65 }}>{c.desc}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px',
              border: `1px solid ${c.verified ? 'var(--ok)' : 'var(--line)'}`,
              color: c.verified ? 'var(--ok)' : 'var(--ink-mute)',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              flexShrink: 0,
            }}>{c.verified ? '✓ verified' : '· pending'}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="zs-card" style={{ padding: 20 }}>
        <div className="label-gold" style={{ marginBottom: 14 }}>predicate resolution</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {PREDICATES.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'start' }}>
              <code style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold-bright)',
                background: 'rgba(244,183,40,0.06)', padding: '4px 8px',
                border: '1px solid var(--line)', whiteSpace: 'nowrap',
              }}>{p.name}</code>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', paddingTop: 4, lineHeight: 1.6 }}>{p.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Production note */}
      <div style={{
        padding: '14px 18px',
        border: '1px solid rgba(244,183,40,0.2)',
        background: 'rgba(244,183,40,0.02)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
          <span style={{ color: 'var(--gold)' }}>Demo note:</span> Claims currently return hardcoded values. Production implementation queries{' '}
          <code style={{ color: 'var(--gold-bright)' }}>mainnet.lightwalletd.com:9067</code> via gRPC and uses the address viewing key to scan the shielded state.
        </div>
      </div>
    </div>
  )
}
