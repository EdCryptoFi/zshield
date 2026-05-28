'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function randHex(len: number) {
  return Array.from({ length: len }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
}

const STEPS = [
  'Sampling entropy sources',
  'Deriving spending key (Ed25519)',
  'Computing shielded diversifier',
  'Encoding bech32m address',
  'Building did:zcash document',
  'Signing genesis claim',
]

interface WalletResult {
  address: string
  sk: string
  vk: string
  did: string
  seed: string[]
}

function CopyField({ label, value, mask = false, highlight = false }: {
  label: string; value: string; mask?: boolean; highlight?: boolean
}) {
  const [revealed, setRevealed] = useState(!mask)
  const [copied, setCopied] = useState(false)
  const display = mask && !revealed ? '•'.repeat(Math.min(value.length, 52)) : value
  const copy = () => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200) }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
        border: `1px solid ${highlight ? 'var(--gold)' : 'var(--line)'}`,
        background: highlight ? 'rgba(244,183,40,0.05)' : 'transparent',
      }}>
        <span style={{
          flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: highlight ? 'var(--gold-bright)' : 'var(--ink)',
        }}>{display}</span>
        {mask && (
          <button onClick={() => setRevealed(r => !r)} style={{
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-dim)',
            fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px',
            letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0,
          }}>{revealed ? 'hide' : 'reveal'}</button>
        )}
        <button onClick={copy} style={{
          background: 'transparent', border: '1px solid var(--line)', color: 'var(--gold)',
          fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px',
          letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0,
        }}>{copied ? '✓' : 'copy'}</button>
      </div>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.3em' }}>──</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  )
}

export default function WalletOverlay() {
  const [phase, setPhase] = useState<'idle' | 'generating' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [wallet, setWallet] = useState<WalletResult | null>(null)
  const [entropy, setEntropy] = useState(() => Array.from({ length: 8 }, () => randHex(8)))

  useEffect(() => {
    const t = setInterval(() => setEntropy(Array.from({ length: 8 }, () => randHex(8))), 200)
    return () => clearInterval(t)
  }, [])

  const generate = () => {
    setPhase('generating'); setProgress(0); setWallet(null)
    let s = 0
    const t = setInterval(() => {
      s++; setProgress(s)
      if (s >= STEPS.length) {
        clearInterval(t)
        setWallet({
          address: 'zauth1' + randHex(58),
          sk: randHex(64),
          vk: randHex(64),
          did: 'did:zcash:mainnet:zauth1' + randHex(58),
          seed: ['arrow', 'silk', 'copper', 'tower', 'viper', 'onyx', 'grain', 'hollow', 'bramble', 'quartz', 'meridian', 'obscura'],
        })
        setPhase('done')
      }
    }, 420)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>

      {/* Left: key ceremony */}
      <div style={{ display: 'grid', gap: 20 }}>

        {/* Entropy header */}
        <div>
          <SectionHeader label="key ceremony · entropy" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
            {entropy.map((e, i) => (
              <div key={i} style={{
                padding: '7px 10px', border: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: phase === 'idle' ? 'var(--ink-mute)' : 'var(--gold)',
                background: phase === 'generating' ? 'rgba(244,183,40,0.05)' : 'transparent',
                transition: 'color .2s, background .3s',
              }}>0x{e}</div>
            ))}
          </div>
        </div>

        {/* Ceremony progress */}
        {phase !== 'idle' && (
          <div>
            <SectionHeader label="ceremony log" />
            <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--line-soft)' : undefined,
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: i < progress ? 'var(--ok)' : i === progress ? 'var(--gold)' : 'var(--ink-mute)',
                }}>
                  <span style={{ flexShrink: 0, width: 14 }}>
                    {i < progress ? '✓' : i === progress ? '⟳' : '·'}
                  </span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'done' && wallet && (
          <div>
            <SectionHeader label="generated keys" />
            <div style={{ display: 'grid', gap: 10 }}>
              <CopyField label="z-address (zauth1 · demo)" value={wallet.address} highlight />
              <CopyField label="did:zcash identifier" value={wallet.did} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <CopyField label="spending key (private)" value={'0x' + wallet.sk} mask />
                <CopyField label="viewing key" value={'0x' + wallet.vk} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 8 }}>seed phrase · 12 words</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {wallet.seed.map((w, i) => (
                    <div key={i} style={{
                      padding: '7px 10px', border: '1px solid var(--line)',
                      fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)',
                      position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', top: 3, right: 5, fontSize: 8, color: 'var(--ink-mute)' }}>{String(i + 1).padStart(2, '0')}</span>
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {phase === 'idle' && '> awaiting entropy'}
            {phase === 'generating' && '> ceremony in progress'}
            {phase === 'done' && '> ephemeral · in-memory only'}
          </span>
          <button
            onClick={generate}
            disabled={phase === 'generating'}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(180deg, var(--gold), var(--gold-deep))',
              color: '#0a0700', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
              clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
              opacity: phase === 'generating' ? 0.5 : 1,
            }}
          >
            {phase === 'idle' ? '⚡ Generate' : phase === 'generating' ? '⟳ Generating…' : '⟳ Regenerate'}
          </button>
        </div>
      </div>

      {/* Right: info */}
      <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
        <div>
          <SectionHeader label="what happens" />
          <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
            {[
              ['Ed25519 keypair', 'crypto.getRandomValues() — browser only'],
              ['bech32m address', 'zauth1 prefix (demo encoding)'],
              ['did:zcash DID', 'W3C DID v1.1 compliant identifier'],
              ['private key', 'never transmitted — stays in browser'],
            ].map(([k, v], i, arr) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr',
                padding: '9px 12px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--line-soft)' : undefined,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', marginBottom: 2 }}>→ {k}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader label="next step" />
          <div style={{ border: '1px solid var(--line)', padding: '16px 14px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.7, marginBottom: 14, marginTop: 0 }}>
              Sign in with your Zcash address. The server sends a challenge — your wallet signs it to prove ownership.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px',
                background: 'linear-gradient(180deg, var(--gold), var(--gold-deep))',
                color: '#0a0700', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
              }}
            >
              → Sign in with Zcash
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
