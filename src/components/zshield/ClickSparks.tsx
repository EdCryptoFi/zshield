'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

export interface ClickSparksHandle {
  burst: (x: number, y: number) => void
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number; hue: number
}

const ClickSparks = forwardRef<ClickSparksHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const runningRef = useRef(false)

  useImperativeHandle(ref, () => ({
    burst(x: number, y: number) {
      const count = 48
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6
        const speed = 2.5 + Math.random() * 7
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 28 + Math.random() * 35,
          size: 1.5 + Math.random() * 3.5,
          hue: 18 + Math.random() * 42,
        })
      }
      if (!runningRef.current) startLoop()
    },
  }))

  const startLoop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    runningRef.current = true

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const ps = particlesRef.current
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life++
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.93; p.vy = p.vy * 0.93 + 0.12

        const t = p.life / p.maxLife
        const alpha = 1 - t * t

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2)
        g.addColorStop(0, `hsla(${p.hue + 22},100%,96%,${alpha})`)
        g.addColorStop(0.45, `hsla(${p.hue},100%,68%,${alpha * 0.68})`)
        g.addColorStop(1, `hsla(${p.hue - 8},80%,38%,0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + t * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        ctx.restore()

        if (p.life >= p.maxLife) ps.splice(i, 1)
      }

      if (ps.length > 0) requestAnimationFrame(loop)
      else runningRef.current = false
    }
    requestAnimationFrame(loop)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 55 }}
    />
  )
})

ClickSparks.displayName = 'ClickSparks'
export default ClickSparks
