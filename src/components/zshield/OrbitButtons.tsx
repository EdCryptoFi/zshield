'use client'

import { useState } from 'react'

export type OrbitId = 'signin' | 'wallet' | 'dashboard' | 'claims' | 'docs'

interface BtnDef {
  id: OrbitId
  label: string
  sub: string
  angle: number
  primary?: boolean
  texture: 'metal' | 'coin' | 'grid' | 'circuit' | 'paper'
  kbd: string
}

const BUTTONS: BtnDef[] = [
  { id: 'signin',    label: 'Sign in',   sub: 'authenticate · zk-snark',          angle: -90,  primary: true, texture: 'metal',   kbd: '⏎' },
  { id: 'wallet',    label: 'Wallet',    sub: 'generate shielded address',         angle: -25,  texture: 'coin',    kbd: 'W' },
  { id: 'dashboard', label: 'Dashboard', sub: 'identity · sessions · claims',      angle:  45,  texture: 'grid',    kbd: 'D' },
  { id: 'claims',    label: 'Claims',    sub: 'zero-knowledge predicates',         angle: 135,  texture: 'circuit', kbd: 'C' },
  { id: 'docs',      label: 'Docs',      sub: 'openid · did · halo2',             angle: 205,  texture: 'paper',   kbd: '?' },
]

const RAD = Math.PI / 180
const ORBIT_R = 'min(41vmin, 370px)'

// Steampunk notched clip-path
const NOTCHED_CLIP = `polygon(
  0 0, 18px 0, 22px 8px, calc(100% - 22px) 8px, calc(100% - 18px) 0, 100% 0,
  100% 18px, calc(100% - 8px) 22px, calc(100% - 8px) calc(100% - 22px), 100% calc(100% - 18px), 100% 100%,
  calc(100% - 18px) 100%, calc(100% - 22px) calc(100% - 8px), 22px calc(100% - 8px), 18px 100%, 0 100%,
  0 calc(100% - 18px), 8px calc(100% - 22px), 8px 22px, 0 18px
)`

const INNER_CLIP = `polygon(
  0 0, 16px 0, 20px 6px, calc(100% - 20px) 6px, calc(100% - 16px) 0, 100% 0,
  100% 16px, calc(100% - 6px) 20px, calc(100% - 6px) calc(100% - 20px), 100% calc(100% - 16px), 100% 100%,
  calc(100% - 16px) 100%, calc(100% - 20px) calc(100% - 6px), 20px calc(100% - 6px), 16px 100%, 0 100%,
  0 calc(100% - 16px), 6px calc(100% - 20px), 6px 20px, 0 16px
)`

function textureBg(t: BtnDef['texture']): string {
  switch (t) {
    case 'metal':
      return `
        repeating-linear-gradient(95deg, rgba(255,255,255,0) 0px, rgba(255,200,120,0.04) 1px, rgba(0,0,0,0) 3px),
        linear-gradient(180deg, #2a1a06 0%, #1a1004 50%, #0e0802 100%)`
    case 'coin':
      return `
        radial-gradient(circle at 88% 50%, rgba(244,183,40,0.35) 0%, transparent 16%),
        radial-gradient(circle at 88% 50%, rgba(244,183,40,0.2) 20%, transparent 30%),
        linear-gradient(180deg, #2a1a06 0%, #1a1004 50%, #0e0802 100%)`
    case 'grid':
      return `
        linear-gradient(rgba(244,183,40,0.16) 1px, transparent 1px) 0 0 / 14px 14px,
        linear-gradient(90deg, rgba(244,183,40,0.16) 1px, transparent 1px) 0 0 / 14px 14px,
        linear-gradient(180deg, #2a1a06 0%, #1a1004 50%, #0e0802 100%)`
    case 'circuit':
      return `
        repeating-linear-gradient(45deg, rgba(244,183,40,0) 0px, rgba(244,183,40,0) 9px, rgba(244,183,40,0.2) 9px, rgba(244,183,40,0.2) 10px),
        linear-gradient(180deg, #2a1a06 0%, #1a1004 50%, #0e0802 100%)`
    case 'paper':
      return `
        repeating-linear-gradient(0deg, rgba(244,183,40,0) 0px, rgba(244,183,40,0) 7px, rgba(244,183,40,0.18) 7px, rgba(244,183,40,0.18) 8px),
        linear-gradient(180deg, #2a1a06 0%, #1a1004 50%, #0e0802 100%)`
  }
}

const RIVET = {
  width: 9, height: 9, borderRadius: '50%',
  background: 'radial-gradient(circle at 35% 30%, #ffd866 0%, #c0832b 40%, #5a3e10 80%, #1f1604 100%)',
  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.6), 0 1px 1px rgba(0,0,0,0.7)',
}

interface Props {
  onAction: (id: OrbitId, x: number, y: number) => void
  signingState: string
}

export default function OrbitButtons({ onAction, signingState }: Props) {
  const [hovered, setHovered] = useState<OrbitId | null>(null)

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6 }}>
      {/* Orbit CSS props injection */}
      <style>{`
        @property --zs-angle { syntax:'<angle>'; inherits:false; initial-value:0deg; }
        .zs-orbit-btn {
          position:absolute; transform:translate(-50%,-50%);
          --zs-angle:0deg;
          background:conic-gradient(from var(--zs-angle),
            rgba(255,196,108,1) 0deg, rgba(184,108,42,0.55) 50deg,
            rgba(82,46,12,0.35) 90deg, rgba(82,46,12,0.35) 270deg,
            rgba(184,108,42,0.55) 310deg, rgba(255,196,108,1) 360deg);
          padding:3px; border:none; cursor:pointer; pointer-events:auto;
          clip-path:${NOTCHED_CLIP};
          filter:drop-shadow(0 8px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(184,108,42,0.4));
          opacity:0; min-width:360px;
          transition:transform .25s cubic-bezier(.2,.8,.2,1), filter .3s;
          animation:zs-orbit-in .8s cubic-bezier(.2,.8,.2,1) forwards, zs-spin-border 5s linear infinite;
        }
        .zs-orbit-btn:hover {
          transform:translate(-50%,-50%) scale(1.05);
          filter:drop-shadow(0 12px 28px rgba(0,0,0,0.8)) drop-shadow(0 0 28px rgba(255,196,108,0.85));
        }
        .zs-orbit-btn.is-primary {
          background:conic-gradient(from var(--zs-angle),
            #fff5d4 0deg, #ffd866 40deg, #c0832b 90deg, #5a3e10 180deg,
            #c0832b 270deg, #ffd866 320deg, #fff5d4 360deg);
          filter:drop-shadow(0 10px 22px rgba(0,0,0,0.7)) drop-shadow(0 0 26px rgba(255,184,0,0.7));
          animation:zs-orbit-in .8s cubic-bezier(.2,.8,.2,1) forwards, zs-spin-border 3.8s linear infinite, zs-primary-pulse 2.6s 1.6s ease-in-out infinite;
        }
        .zs-orbit-btn.is-primary:hover {
          filter:drop-shadow(0 14px 30px rgba(0,0,0,0.8)) drop-shadow(0 0 44px rgba(255,216,102,1));
        }
        @keyframes zs-spin-border { to { --zs-angle:360deg; } }
        @media (max-width:1200px){.zs-orbit-btn{min-width:280px;}}
        @media (max-width:900px){.zs-orbit-btn{min-width:220px;}}
        @media (max-width:820px){.zs-orbit-btn{min-width:0;}}
      `}</style>

      {/* SVG connecting lines */}
      <svg
        style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 'min(94vmin,900px)', height: 'min(94vmin,900px)', pointerEvents: 'none' }}
        viewBox="-220 -220 440 440"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(244,183,40,0.12)" strokeWidth="1" strokeDasharray="2 7" style={{ animation: 'zs-spin-slow 65s linear infinite' }} />
        <circle cx="0" cy="0" r="128" fill="none" stroke="rgba(244,183,40,0.06)" strokeWidth="1" />
        {BUTTONS.map(b => {
          const rx = Math.cos(b.angle * RAD)
          const ry = Math.sin(b.angle * RAD)
          const x1 = rx * 135, y1 = ry * 135
          const x2 = rx * 192, y2 = ry * 192
          const active = hovered === b.id || (b.id === 'signin' && signingState !== 'idle')
          return (
            <g key={b.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={active ? 'rgba(255,216,102,0.9)' : 'rgba(244,183,40,0.32)'}
                strokeWidth={active ? 1.6 : 1}
                strokeDasharray={active ? 'none' : '3 4'}
                style={{ transition: 'stroke .2s, stroke-width .2s' }}
              />
              <circle cx={x1} cy={y1} r="2" fill={active ? '#ffd866' : '#f4b728'} />
              <circle cx={x2} cy={y2} r={active ? 5 : 3} fill={active ? '#ffd866' : '#f4b728'} style={{ transition: 'r .25s' }} />
              <circle cx={x1} cy={y1} r={active ? 12 : 7} fill="none" stroke={active ? 'rgba(255,216,102,0.65)' : 'rgba(244,183,40,0.22)'} strokeWidth="1" style={{ transition: 'all .25s' }} />
            </g>
          )
        })}
      </svg>

      {/* Buttons */}
      {BUTTONS.map((b, idx) => {
        const cx = Math.cos(b.angle * RAD)
        const cy = Math.sin(b.angle * RAD)
        const isPrimary = !!b.primary
        const isHov = hovered === b.id

        let labelText = b.label
        if (b.id === 'signin') {
          if (signingState === 'challenge') labelText = 'Requesting…'
          else if (signingState === 'signing') labelText = 'Signing…'
          else if (signingState === 'confirmed') labelText = '✓ Verified'
        }

        return (
          <button
            key={b.id}
            className={`zs-orbit-btn${isPrimary ? ' is-primary' : ''}`}
            style={{
              left: `calc(50% + ${cx.toFixed(4)} * ${ORBIT_R})`,
              top: `calc(50% + ${cy.toFixed(4)} * ${ORBIT_R})`,
              animationDelay: `${0.15 + idx * 0.12}s, 0s`,
            }}
            onClick={e => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              onAction(b.id, rect.left + rect.width / 2, rect.top + rect.height / 2)
            }}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={b.label}
          >
            {/* Inner frame — brushed metal plate */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 16,
              padding: '22px 28px',
              background: isPrimary
                ? `repeating-linear-gradient(90deg,rgba(255,255,255,0) 0px,rgba(255,255,255,0.18) 1px,rgba(0,0,0,.06) 2px,rgba(0,0,0,0) 4px),
                   linear-gradient(180deg,#ffe39a 0%,#ffb800 40%,#a3760f 100%)`
                : textureBg(b.texture),
              clipPath: INNER_CLIP,
              position: 'relative', overflow: 'hidden', isolation: 'isolate',
              width: '100%', height: '100%',
              boxShadow: isPrimary
                ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(60,40,8,0.6)'
                : 'inset 0 1px 0 rgba(255,200,120,0.18), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}>
              {/* Rivets top-left, top-right */}
              <span style={{ position: 'absolute', top: 10, left: 10, ...RIVET }} />
              <span style={{ position: 'absolute', top: 10, right: 10, ...RIVET }} />
              {/* Rivets bottom */}
              <span style={{ position: 'absolute', bottom: 10, left: 10, ...RIVET }} />
              <span style={{ position: 'absolute', bottom: 10, right: 10, ...RIVET }} />

              {/* Content */}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, lineHeight: 1.1, flex: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontWeight: isPrimary ? 800 : 600,
                  color: isPrimary ? '#0a0700' : '#ffffff',
                }}>
                  {labelText}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isPrimary ? 'rgba(10,7,0,0.65)' : 'var(--ink-mute)',
                }}>
                  {b.sub}
                </span>
              </span>

              {/* KBD hint */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '4px 9px',
                border: `1px solid ${isPrimary ? 'rgba(0,0,0,0.45)' : 'rgba(244,183,40,0.4)'}`,
                color: isPrimary ? 'rgba(10,7,0,0.75)' : 'var(--gold)',
                background: isPrimary ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.5)',
                flexShrink: 0,
              }}>
                {b.kbd}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
