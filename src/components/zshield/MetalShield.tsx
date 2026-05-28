'use client'

import Image from 'next/image'

interface Props {
  split?: boolean
}

const MASK = 'radial-gradient(ellipse 70% 82% at 50% 52%, black 38%, transparent 100%)'

export default function MetalShield({ split = false }: Props) {
  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Glow halo behind shield */}
      <div style={{
        position: 'absolute', inset: '-5%',
        background: 'radial-gradient(ellipse 62% 72% at 50% 52%, rgba(244,183,40,0.2) 0%, rgba(200,100,12,0.1) 42%, transparent 72%)',
        animation: 'zs-glow-pulse 3.2s ease-in-out infinite',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Outer pulse ring */}
      <div style={{
        position: 'absolute', inset: '5%', borderRadius: '50%',
        border: '1px solid rgba(244,183,40,0.12)',
        animation: 'zs-glow-pulse 4s 0.8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: '12%', borderRadius: '50%',
        border: '1px dashed rgba(244,183,40,0.08)',
        animation: 'zs-spin-slow 60s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Shield image — split into left/right halves */}
      <div style={{
        position: 'relative',
        width: '76%', height: '76%',
        animation: 'zs-float 4.2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 32px rgba(244,183,40,0.38)) drop-shadow(0 0 70px rgba(190,90,8,0.18)) drop-shadow(0 0 6px rgba(255,220,100,0.55))',
      }}>
        {/* Left half */}
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: 'inset(0 50% 0 0)',
          transform: split ? 'translateX(-52px)' : 'translateX(0)',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <Image
            src="/zshield-logo.png"
            alt="ZShield left"
            fill
            style={{
              objectFit: 'contain',
              mixBlendMode: 'lighten',
              maskImage: MASK,
              WebkitMaskImage: MASK,
            }}
            priority
          />
        </div>
        {/* Right half */}
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: 'inset(0 0 0 50%)',
          transform: split ? 'translateX(52px)' : 'translateX(0)',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <Image
            src="/zshield-logo.png"
            alt="ZShield right"
            fill
            style={{
              objectFit: 'contain',
              mixBlendMode: 'lighten',
              maskImage: MASK,
              WebkitMaskImage: MASK,
            }}
            priority
          />
        </div>
      </div>

      {/* Shadow below shield */}
      <div style={{
        position: 'absolute', bottom: '8%', left: '50%',
        transform: 'translateX(-50%)',
        width: '50%', height: '6%',
        background: 'radial-gradient(ellipse 100% 100%, rgba(244,183,40,0.16) 0%, transparent 70%)',
        filter: 'blur(14px)',
        animation: 'zs-glow-pulse 4.2s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* HUD ring dots */}
      <svg
        viewBox="0 0 400 400"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.55 }}
      >
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 24
          const r = 195
          return (
            <circle
              key={i}
              cx={200 + Math.cos(angle) * r}
              cy={200 + Math.sin(angle) * r}
              r={i % 6 === 0 ? 2.5 : 1}
              fill={i % 6 === 0 ? '#f4b728' : 'rgba(244,183,40,0.4)'}
            />
          )
        })}
        <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(244,183,40,0.1)" strokeWidth="1" strokeDasharray="2 8" />
      </svg>
    </div>
  )
}
