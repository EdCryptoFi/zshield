'use client'

// Seeded PRNG — same values on server and client → no hydration mismatch
function makeRng(seed: number) {
  let s = seed
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0
    return (s >>> 0) / 4294967296
  }
}

function ZPattern() {
  const rng = makeRng(42)
  const zs = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${Math.round(rng() * 100)}%`,
    top: `${Math.round(rng() * 100)}%`,
    size: Math.round(40 + rng() * 240),
    opacity: parseFloat((0.02 + rng() * 0.06).toFixed(3)),
    rotation: Math.round((rng() - 0.5) * 40),
    floatDur: Math.round(14 + rng() * 20),
    floatDelay: Math.round(rng() * 20),
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {zs.map(z => (
        <div
          key={z.id}
          style={{
            position: 'absolute',
            left: z.left, top: z.top,
            fontSize: z.size,
            opacity: z.opacity,
            transform: `translate(-50%,-50%) rotate(${z.rotation}deg)`,
            color: 'var(--gold)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontStyle: 'italic',
            lineHeight: 1,
            userSelect: 'none',
            animation: `zs-float ${z.floatDur}s -${z.floatDelay}s ease-in-out infinite`,
          }}
        >Z</div>
      ))}
    </div>
  )
}

function LightRays() {
  const angles = [-22, -14, -8, -3, 4, 10, 18, 26]
  return (
    <svg
      viewBox="0 0 100 120"
      preserveAspectRatio="xMidYMin slice"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.45,
      }}
    >
      <defs>
        <linearGradient id="zs-ray-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.5)" />
          <stop offset="55%" stopColor="rgba(255,184,0,0.18)" />
          <stop offset="100%" stopColor="rgba(255,184,0,0)" />
        </linearGradient>
        <filter id="zs-ray-blur"><feGaussianBlur stdDeviation="0.3" /></filter>
      </defs>
      <g style={{ filter: 'url(#zs-ray-blur)' }}>
        {angles.map((deg, i) => (
          <polygon
            key={i}
            points={`50,0 49.9,0 49.9,${88 + (i % 2) * 10} 50.1,${88 + (i % 2) * 10}`}
            fill="url(#zs-ray-grad)"
            transform={`rotate(${deg} 50 -10)`}
            style={{ animation: `zs-ray-pulse ${3.5 + (i % 4) * 0.7}s ${i * 0.3}s ease-in-out infinite` }}
          />
        ))}
      </g>
    </svg>
  )
}

function SmokeLayer() {
  const rng = makeRng(7)
  const wisps = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    left: `${10 + i * 13}%`,
    size: Math.round(70 + rng() * 60),
    opacity: parseFloat((0.035 + rng() * 0.03).toFixed(3)),
    dur: Math.round(12 + rng() * 10),
    delay: Math.round(rng() * 12),
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {wisps.map(w => (
        <div key={w.id} style={{
          position: 'absolute',
          left: w.left, bottom: '-10%',
          width: w.size, height: w.size * 2,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 70%, rgba(255,155,28,${w.opacity}), transparent 70%)`,
          animation: `zs-float ${w.dur}s -${w.delay}s ease-in-out infinite`,
          filter: 'blur(22px)',
          mixBlendMode: 'screen',
        }} />
      ))}
    </div>
  )
}

function LensFlare() {
  return (
    <>
      <div style={{
        position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,220,100,0.1) 0%, rgba(244,183,40,0.05) 30%, transparent 70%)',
        animation: 'zs-glow-pulse 5s ease-in-out infinite',
        pointerEvents: 'none', mixBlendMode: 'screen',
      }} />
      <div style={{
        position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
        width: 6, height: 6, borderRadius: '50%',
        background: 'rgba(255,240,180,0.7)',
        boxShadow: '0 0 20px 8px rgba(255,220,100,0.3)',
        animation: 'zs-glow-pulse 2.8s .6s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
    </>
  )
}

export default function AmbientLayers() {
  return (
    <>
      <ZPattern />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(38,26,7,0.88), rgba(8,6,3,0.94) 58%, #050403 100%)',
        pointerEvents: 'none',
      }} />
      <LightRays />
      <SmokeLayer />
      <LensFlare />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.97) 100%)',
      }} />
    </>
  )
}
