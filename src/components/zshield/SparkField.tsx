'use client'

import { useEffect, useRef } from 'react'

interface Ember {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  isWisp: boolean
  fadeStart: number
}

export default function SparkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const embers: Ember[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = () => {
      const isWisp = Math.random() < 0.18
      embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 12,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(1.8 + Math.random() * 2.8),
        life: 0,
        maxLife: 220 + Math.random() * 380,
        size: isWisp ? 5 + Math.random() * 10 : 1.2 + Math.random() * 3.5,
        hue: 4 + Math.random() * 34,
        isWisp,
        fadeStart: 0.45 + Math.random() * 0.5,
      })
    }

    let animId: number
    const loop = () => {
      // 9–14 embers per frame for dense fire
      for (let i = 0; i < 9 + Math.floor(Math.random() * 6); i++) spawn()

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(5,4,3,0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]
        e.life++
        e.x += e.vx + Math.sin(e.life * 0.055) * 0.38
        e.y += e.vy
        e.vy -= 0.001

        const t = e.life / e.maxLife
        // random-start fade so particles disappear at different heights
        const lifeFade = t < e.fadeStart ? 1 : Math.max(0, 1 - (t - e.fadeStart) / (1 - e.fadeStart))
        // additional fade as particles reach the top 12% of screen
        const topFade = Math.max(0, Math.min(1, e.y / (canvas.height * 0.12)))
        const alpha = lifeFade * topFade

        if (e.isWisp) {
          const r = e.size * (1 + t * 0.8)
          const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r)
          g.addColorStop(0, `hsla(${e.hue},90%,65%,${alpha * 0.28})`)
          g.addColorStop(1, `hsla(${e.hue},80%,40%,0)`)
          ctx.beginPath()
          ctx.arc(e.x, e.y, r, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.globalCompositeOperation = 'screen'
          ctx.fill()
        } else {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.translate(e.x, e.y)
          ctx.rotate(Math.atan2(e.vy, e.vx) + Math.PI / 2)
          const len = e.size * 3.8
          const g = ctx.createLinearGradient(0, -len, 0, len * 0.4)
          g.addColorStop(0, `hsla(${e.hue + 22},100%,92%,${alpha})`)
          g.addColorStop(0.38, `hsla(${e.hue},100%,70%,${alpha * 0.82})`)
          g.addColorStop(1, `hsla(${e.hue - 4},80%,38%,0)`)
          ctx.beginPath()
          ctx.ellipse(0, 0, e.size * 0.38, len, 0, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
          ctx.restore()
        }

        if (e.life >= e.maxLife || e.y < -30) embers.splice(i, 1)
      }

      ctx.globalCompositeOperation = 'source-over'
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
