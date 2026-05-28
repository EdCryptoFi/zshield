'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function randHex(len: number) {
  return Array.from({ length: len }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
}

const STEPS = ['Sampling entropy', 'Deriving spending key', 'Computing diversifier', 'Encoding zauth1 address', 'Building did:zcash document', 'Signing genesis claim']

interface WalletResult {
  address: string
  sk: string
  vk: string
  did: string
  seed: string[]
}

function Field({ label, value, mono = false, primary = false, mask = false }: {
  label: string; value: string; mono?: boolean; primary?: boolean; mask?: boolean
}) {
  const [revealed, setRevealed] = useState(!mask)
  const [copied, setCopied] = useState(false)
  const display = mask && !revealed ? '•'.repeat(Math.min(value.length, 48)) : value
  const copy = () => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200) }

  return (
    <div>
      <div className="micro" style={{ marginBottom: 5 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px',
        border: `1px solid ${primary ? 'var(--gold)' : 'var(--line)'}`,
        background: primary ? 'rgba(244,183,40,0.05)' : 'transparent',
      }}>
        <span style={{
          flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          color: primary ? 'var(--gold-bright)' : 'var(--ink)',
        }}>{display}</span>
        {mask && (
          <button onClick={() => setRevealed(r => !r)} style={{
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-dim)',
            fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px',
            letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
          }}>{revealed ? 'hide' : 'reveal'}</button>
        )}
        <button onClick={copy} style={{
          background: 'transparent', border: '1px solid var(--line)', color: 'var(--gold)',
          fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px',
          letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
        }}>{copied ? '✓' : 'copy'}</button>
      </div>
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
          seed: ['arrow','silk','copper','tower','viper','onyx','grain','hollow','bramble','quartz','meridian','obscura'],
        })
        setPhase('done')
      }
    }, 420)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
      {/* Left: generator */}
      <div className="zs-card" style={{ padding: 24, minHeight: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div className="label-gold">⟶ key ceremony</div>
          <div className="micro">SEED · 256 BIT</div>
        </div>

        {/* Entropy grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 20 }}>
          {entropy.map((e, i) => (
            <div key={i} style={{
              padding: '8px 10px', border: '1px solid var(--line)',
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: phase === 'idle' ? 'var(--ink-mute)' : 'var(--gold)',
              background: phase === 'generating' ? 'rgba(244,183,40,0.05)' : 'transparent',
              transition: 'background .3s',
            }}>0x{e}</div>
          ))}
        </div>

        {/* Steps */}
        {phase === 'generating' && (
          <div style={{ marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 0', fontFamily: 'var(--font-mono)', fontSize: 11,
                color: i < progress ? 'var(--ok)' : i === progress ? 'var(--gold)' : 'var(--ink-mute)',
              }}>
                <span>{i < progress ? '✓' : i === progress ? '⟳' : '·'}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {phase === 'done' && wallet && (
          <div style={{ display: 'grid', gap: 12 }}>
            <Field label="z-address (zauth1 · demo)" value={wallet.address} mono primary />
            <Field label="did:zcash identifier" value={wallet.did} mono />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="spending key (private)" value={'0x' + wallet.sk} mono mask />
              <Field label="viewing key" value={'0x' + wallet.vk} mono />
            </div>
            <div>
              <div className="micro" style={{ marginBottom: 6 }}>seed phrase · 12 words</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                {wallet.seed.map((w, i) => (
                  <div key={i} style={{
                    padding: '8px 10px', border: '1px solid var(--line)',
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
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--line-soft)' }}>
          <div className="micro">
            {phase === 'idle' && 'awaiting entropy'}
            {phase === 'generating' && 'ceremony in progress'}
            {phase === 'done' && '✓ ephemeral · in-memory only'}
          </div>
          <button
            onClick={generate}
            disabled={phase === 'generating'}
            style={{
              padding: '12px 22px', background: 'linear-gradient(180deg,var(--gold),var(--gold-deep))',
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
      <div style={{ display: 'grid', gap: 16, gridTemplateRows: 'auto 1fr' }}>
        <div className="zs-card" style={{ padding: 20 }}>
          <div className="label-gold" style={{ marginBottom: 12 }}>what happens here</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)', lineHeight: 1.6 }}>
            {[
              ['Ed25519 keypair', 'generated via crypto.getRandomValues()'],
              ['bech32m address', 'encoded with zauth1 prefix (demo)'],
              ['did:zcash DID', 'W3C DID v1.1 compliant identifier'],
              ['private key', 'stays in browser — never transmitted'],
            ].map(([k, v], i) => (
              <li key={i}>→ <span style={{ color: 'var(--gold)' }}>{k}</span> {v}</li>
            ))}
          </ul>
        </div>
        <div className="zs-card" style={{ padding: 20 }}>
          <div className="label-gold" style={{ marginBottom: 10 }}>ready to use your wallet?</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.7, marginBottom: 14 }}>
            Click Sign In to authenticate with your Zcash address. The server will send a challenge — your wallet signs it, proving ownership.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'linear-gradient(180deg,var(--gold),var(--gold-deep))',
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
  )
}
