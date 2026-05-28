'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Phase = 'closed' | 'forging' | 'open' | 'closing'

interface Props {
  open: boolean
  title: string
  kicker: string
  onClose: () => void
  children: ReactNode
}

// A small forge-spark canvas that plays during panel build
function ForgeSparks({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!active) { cancelAnimationFrame(animRef.current); return }
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    interface FP { x:number; y:number; vx:number; vy:number; life:number; max:number; hue:number }
    const ps: FP[] = []

    const spawn = () => {
      // spawn from edges of canvas
      const edge = Math.floor(Math.random() * 4)
      let x = 0, y = 0
      if (edge===0) { x=Math.random()*canvas.width; y=0 }
      else if (edge===1) { x=canvas.width; y=Math.random()*canvas.height }
      else if (edge===2) { x=Math.random()*canvas.width; y=canvas.height }
      else { x=0; y=Math.random()*canvas.height }
      const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
      const speed = 1.5 + Math.random() * 3
      ps.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life:0, max: 20+Math.random()*25, hue: 15+Math.random()*35 })
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < 3; i++) spawn()
      for (let i = ps.length-1; i >= 0; i--) {
        const p = ps[i]
        p.life++; p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96
        const t = p.life/p.max; const alpha = (1-t)*0.9
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 4)
        g.addColorStop(0, `hsla(${p.hue+20},100%,95%,${alpha})`)
        g.addColorStop(1, `hsla(${p.hue},100%,60%,0)`)
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2)
        ctx.fillStyle = g; ctx.fill(); ctx.restore()
        if (p.life >= p.max) ps.splice(i, 1)
      }
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [active])

  return (
    <canvas
      ref={ref}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:2 }}
    />
  )
}

// Rivet component
function Rivet({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position:'absolute', width:10, height:10, borderRadius:'50%',
      background:'radial-gradient(circle at 35% 30%, #ffd866 0%, #c0832b 40%, #5a3e10 80%, #1f1604 100%)',
      boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)',
      ...style,
    }} />
  )
}

const PANEL_CLIP = `polygon(
  0 28px, 28px 0, calc(100% - 28px) 0, 100% 28px,
  100% calc(100% - 28px), calc(100% - 28px) 100%,
  28px 100%, 0 calc(100% - 28px)
)`

export default function OverlayPanel({ open, title, kicker, onClose, children }: Props) {
  const [phase, setPhase] = useState<Phase>('closed')

  useEffect(() => {
    if (open) {
      setPhase('forging')
      const t = setTimeout(() => setPhase('open'), 900)
      return () => clearTimeout(t)
    } else {
      if (phase === 'open' || phase === 'forging') {
        setPhase('closing')
        const t = setTimeout(() => setPhase('closed'), 350)
        return () => clearTimeout(t)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (phase !== 'open' && phase !== 'forging') return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, onClose])

  if (phase === 'closed') return null

  const isVisible = phase === 'forging' || phase === 'open' || phase === 'closing'
  const isBuilding = phase === 'forging'
  const isOpen = phase === 'open'

  const backdropAlpha = phase === 'closing' ? '0' : '1'
  const panelAnim = isBuilding ? 'zs-forge-reveal 0.9s cubic-bezier(.2,.8,.2,1) both'
    : phase === 'closing' ? 'none'
    : 'none'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      pointerEvents: isVisible ? 'auto' : 'none',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:'absolute', inset:0,
          background:'rgba(0,0,0,0.82)',
          backdropFilter:'blur(12px) saturate(140%)',
          opacity: backdropAlpha,
          transition:'opacity 0.35s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position:'absolute', inset:'60px 20px 60px 20px',
          background:`
            repeating-linear-gradient(90deg,
              rgba(255,255,255,0) 0px, rgba(255,200,120,0.015) 1px, rgba(0,0,0,0) 3px),
            linear-gradient(180deg, rgba(14,10,4,0.94) 0%, rgba(5,4,3,0.97) 100%)`,
          border:'1px solid var(--gold)',
          boxShadow:`
            0 0 0 1px rgba(0,0,0,0.6),
            0 60px 120px rgba(0,0,0,0.75),
            inset 0 0 80px rgba(244,183,40,0.04)`,
          clipPath: PANEL_CLIP,
          display:'flex', flexDirection:'column',
          opacity: phase === 'closing' ? 0 : 1,
          transform: phase === 'closing' ? 'translateY(14px) scale(0.99)' : 'none',
          transition: phase === 'closing' ? 'opacity 0.32s ease, transform 0.32s ease' : 'none',
          animation: panelAnim,
          overflow:'hidden',
        }}
      >
        {/* Forge sparks during build */}
        <ForgeSparks active={isBuilding} />

        {/* Corner rivets */}
        <Rivet style={{ top:12, left:12 }} />
        <Rivet style={{
          top:12, right:12,
          animationDelay:'0.1s',
          animation: isBuilding ? 'zs-rivet-pop 0.4s 0.3s cubic-bezier(.2,.8,.2,1) both' : 'none',
        }} />
        <Rivet style={{ bottom:12, left:12,
          animation: isBuilding ? 'zs-rivet-pop 0.4s 0.5s cubic-bezier(.2,.8,.2,1) both' : 'none',
        }} />
        <Rivet style={{ bottom:12, right:12,
          animation: isBuilding ? 'zs-rivet-pop 0.4s 0.65s cubic-bezier(.2,.8,.2,1) both' : 'none',
        }} />

        {/* SVG border — draws during forge */}
        {isBuilding && (
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:3 }}
            viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="0,4 4,0 96,0 100,4 100,96 96,100 4,100 0,96"
              fill="none"
              stroke="rgba(244,183,40,0.85)"
              strokeWidth="0.8"
              strokeDasharray="400"
              strokeDashoffset="400"
              style={{ animation:'zs-forge-border 0.85s ease-out forwards' }}
            />
          </svg>
        )}

        {/* Header */}
        <header style={{
          display:'flex', justifyContent:'space-between', alignItems:'center', gap:20,
          padding:'20px 32px', borderBottom:'1px solid var(--line-soft)',
          background:'linear-gradient(180deg, rgba(244,183,40,0.05), transparent)',
          flexShrink:0, position:'relative', zIndex:4,
          opacity: isOpen ? 1 : 0, transition:'opacity 0.3s 0.6s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ width:8, height:8, background:'var(--gold)', display:'inline-block', transform:'rotate(45deg)', flexShrink:0 }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--gold)', letterSpacing:'0.3em', textTransform:'uppercase' }}>↳ {kicker}</span>
            <span style={{ flex:1, height:1, background:'linear-gradient(to right, var(--line), transparent)', maxWidth:120 }} />
            <h2 style={{ fontSize:17, fontWeight:500, letterSpacing:'-0.01em', color:'var(--ink)', margin:0 }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              display:'inline-flex', alignItems:'center', gap:9,
              background:'transparent', border:'1px solid var(--line)', color:'var(--ink-dim)',
              padding:'7px 13px', cursor:'pointer',
              transition:'color .2s, border-color .2s, background .2s',
              fontFamily:'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--gold)'; (e.currentTarget as HTMLElement).style.borderColor='var(--gold)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--ink-dim)'; (e.currentTarget as HTMLElement).style.borderColor='var(--line)' }}
          >
            <span style={{ display:'block', width:13, height:13, position:'relative', flexShrink:0 }}>
              <span style={{ position:'absolute', top:'50%', left:0, width:'100%', height:1, background:'currentColor', transform:'rotate(45deg)' }} />
              <span style={{ position:'absolute', top:'50%', left:0, width:'100%', height:1, background:'currentColor', transform:'rotate(-45deg)' }} />
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase' }}>esc · close</span>
          </button>
        </header>

        {/* Forge status during build */}
        {isBuilding && (
          <div style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            zIndex:5, textAlign:'center',
          }}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:13, color:'var(--gold)',
              letterSpacing:'0.32em', textTransform:'uppercase',
              animation:'zs-build-flash 0.6s ease-in-out infinite',
            }}>
              ⚙ FORGING {title.toUpperCase()}…
            </div>
            <div style={{
              width:180, height:2, background:'var(--line-soft)',
              margin:'12px auto 0', overflow:'hidden',
            }}>
              <div style={{
                height:'100%',
                background:'linear-gradient(90deg, transparent, var(--gold), transparent)',
                animation:'zs-shimmer 0.8s ease-in-out infinite',
                backgroundSize:'200% 100%',
              }} />
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{
          flex:1, overflowY:'auto', overflowX:'hidden', padding:'36px 48px',
          position:'relative', zIndex:4,
          opacity: isOpen ? 1 : 0,
          animation: isOpen ? 'zs-forge-content 0.5s 0.65s ease both' : 'none',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
