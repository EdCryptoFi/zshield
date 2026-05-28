'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import AmbientLayers from './AmbientLayers'
import MetalShield from './MetalShield'
import OrbitButtons from './OrbitButtons'
import type { OrbitId } from './OrbitButtons'
import OverlayPanel from './OverlayPanel'
import WalletOverlay from './overlays/WalletOverlay'
import DashboardOverlay from './overlays/DashboardOverlay'
import ClaimsOverlay from './overlays/ClaimsOverlay'
import DocsOverlay from './overlays/DocsOverlay'

// Canvas components load client-only (no SSR) to avoid hydration issues
const SparkField = dynamic(() => import('./SparkField'), { ssr: false })
const ClickSparks = dynamic(() => import('./ClickSparks'), { ssr: false })

import type { ClickSparksHandle } from './ClickSparks'

type OverlayKey = 'wallet' | 'dashboard' | 'claims' | 'docs'

const OVERLAY_META: Record<OverlayKey, { kicker: string; title: string }> = {
  wallet:    { kicker: 'demo wallet', title: 'Key Generator' },
  dashboard: { kicker: 'identity panel', title: 'Dashboard' },
  claims:    { kicker: 'zk predicates', title: 'Claims' },
  docs:      { kicker: 'documentation', title: 'Docs' },
}

function SystemHUD() {
  const [clock, setClock] = useState('')
  const [block, setBlock] = useState(2847293)

  useEffect(() => {
    setClock(new Date().toISOString().slice(11, 19))
    const t = setInterval(() => {
      setClock(new Date().toISOString().slice(11, 19))
      setBlock(b => b + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 14,
        padding: '12px 26px 12px 20px',
        background: 'rgba(8,6,2,0.82)',
        border: '1px solid var(--gold)',
        backdropFilter: 'blur(8px)',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 0 22px rgba(244,183,40,0.3)',
      }}>
        <span className="zs-dot" style={{ width: 9, height: 9 }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 14,
          color: 'var(--gold-bright)', letterSpacing: '0.32em', textTransform: 'uppercase', fontWeight: 600,
        }}>system online</span>
        <span style={{ width: 1, height: 14, background: 'var(--line)' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-mute)', letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>shielded · v0.8.4</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)',
        letterSpacing: '0.26em', textTransform: 'uppercase',
        display: 'flex', gap: 14,
      }}>
        <span>block {block.toLocaleString()}</span>
        <span style={{ color: 'var(--gold)' }}>·</span>
        <span>{clock} UTC</span>
        <span style={{ color: 'var(--gold)' }}>·</span>
        <span>peers 142</span>
        <span style={{ color: 'var(--gold)' }}>·</span>
        <span>latency 38ms</span>
      </div>
    </div>
  )
}

// Animated logo mark (top-left)
function LogoMark() {
  return (
    <div style={{
      position: 'absolute', top: 20, left: 22, zIndex: 30,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        position: 'relative', width: 34, height: 34,
        animation: 'zs-logo-float 4s ease-in-out infinite',
      }}>
        {/* outer dashed ring — spins */}
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          border: '1px dashed rgba(244,183,40,0.28)',
          animation: 'zs-spin-slow 30s linear infinite',
        }} />
        {/* inner pulse ring */}
        <div style={{
          position: 'absolute', inset: -5, borderRadius: '50%',
          border: '1px solid rgba(244,183,40,0.45)',
          animation: 'zs-logo-ring 3s ease-in-out infinite',
        }} />
        {/* Z sigil */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #ffd866, #c8941b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: '#0a0700',
        }}>Z</div>
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        background: 'linear-gradient(180deg, #ffe39a 0%, #ffb800 60%, #c8941b 100%)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        backgroundSize: '200% 200%',
        animation: 'zs-shimmer 4s ease-in-out infinite',
      }}>ZShield</span>
    </div>
  )
}

export default function ZShieldHero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sparksRef = useRef<ClickSparksHandle>(null)
  const [overlay, setOverlay] = useState<OverlayKey | null>(null)
  const [signingState, setSigningState] = useState<'idle' | 'challenge' | 'signing' | 'confirmed'>('idle')

  // Parallax on mouse
  useEffect(() => {
    const root = rootRef.current; if (!root) return
    let tgt = { mx: 0, my: 0 }
    let cur = { mx: 0, my: 0 }
    let raf = 0
    const onMove = (e: MouseEvent) => {
      tgt.mx = (e.clientX / window.innerWidth - 0.5)
      tgt.my = (e.clientY / window.innerHeight - 0.5)
    }
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const loop = () => {
      cur.mx = lerp(cur.mx, tgt.mx, 0.07)
      cur.my = lerp(cur.my, tgt.my, 0.07)
      root.style.setProperty('--mx', cur.mx.toFixed(4))
      root.style.setProperty('--my', cur.my.toFixed(4))
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const map: Record<string, () => void> = {
      w: () => setOverlay('wallet'),
      d: () => setOverlay('dashboard'),
      c: () => setOverlay('claims'),
      '?': () => setOverlay('docs'),
    }
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      const fn = map[e.key.toLowerCase()]
      if (fn) { e.preventDefault(); fn() }
      if (e.key === 'Escape') setOverlay(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAction = useCallback((id: OrbitId, x: number, y: number) => {
    if (id === 'signin') {
      // Actual sign-in flow
      setSigningState('challenge')
      setTimeout(() => setSigningState('signing'), 900)
      setTimeout(() => setSigningState('confirmed'), 2400)
      setTimeout(() => {
        setSigningState('idle')
        window.location.href = '/login'
      }, 3000)
    } else {
      // Spark burst + open overlay
      sparksRef.current?.burst(x, y)
      setTimeout(() => setOverlay(id as OverlayKey), 120)
    }
  }, [])

  const meta = overlay ? OVERLAY_META[overlay] : null

  return (
    <>
      {/* Scanlines + noise */}
      <div className="bg-noise" />
      <div className="bg-scan" />

      {/* Full viewport hero */}
      <div
        ref={rootRef}
        style={{
          position: 'fixed', inset: 0,
          background: 'var(--bg)',
          overflow: 'hidden',
          '--mx': '0', '--my': '0',
        } as React.CSSProperties}
      >
        {/* Ambient stack — parallax layers */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translate3d(calc(var(--mx) * 6px), calc(var(--my) * 4px), 0)' }}>
          <AmbientLayers />
        </div>

        {/* Fire sparks — fullscreen, mid parallax */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translate3d(calc(var(--mx) * 28px), calc(var(--my) * 18px), 0)' }}>
          <SparkField />
        </div>

        {/* SYSTEM ONLINE HUD */}
        <SystemHUD />

        {/* Logo mark top-left */}
        <LogoMark />

        {/* CENTER STAGE */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5,
        }}>
          {/* Shield — closer to camera, moves more against cursor */}
          <div style={{
            position: 'relative',
            height: 'min(99vh, 910px)', width: 'min(57vmin, 754px)',
            zIndex: 2,
            transform: 'translate3d(calc(var(--mx) * -22px), calc(var(--my) * -14px), 0)',
            transition: 'transform .12s linear',
          }}>
            <MetalShield split={overlay !== null} />
          </div>

          {/* Orbit buttons */}
          <OrbitButtons onAction={handleAction} signingState={signingState} />
        </div>
      </div>

      {/* Click sparks overlay (fixed, fullscreen) */}
      <ClickSparks ref={sparksRef} />

      {/* Info overlay panel */}
      <OverlayPanel
        open={overlay !== null}
        title={meta?.title ?? ''}
        kicker={meta?.kicker ?? ''}
        onClose={() => setOverlay(null)}
      >
        {overlay === 'wallet' && <WalletOverlay />}
        {overlay === 'dashboard' && <DashboardOverlay />}
        {overlay === 'claims' && <ClaimsOverlay />}
        {overlay === 'docs' && <DocsOverlay />}
      </OverlayPanel>
    </>
  )
}
