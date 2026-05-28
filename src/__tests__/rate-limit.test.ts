import { describe, it, expect } from 'vitest'
import { rateLimit } from '../lib/rate-limit'

describe('Rate limiter', () => {
  it('allows requests within the limit', async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 3 })
    const ip = 'test-ip-1'

    const r1 = await limiter(ip)
    expect(r1.success).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = await limiter(ip)
    expect(r2.success).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = await limiter(ip)
    expect(r3.success).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks requests over the limit', async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 2 })
    const ip = 'test-ip-2'

    await limiter(ip)
    await limiter(ip)

    const r3 = await limiter(ip)
    expect(r3.success).toBe(false)
    expect(r3.remaining).toBe(0)
    expect(r3.resetAt).toBeGreaterThan(Date.now())
  })

  it('tracks different IPs independently', async () => {
    const limiter = rateLimit({ windowMs: 60_000, maxRequests: 1 })

    const r1 = await limiter('ip-a')
    expect(r1.success).toBe(true)

    const r2 = await limiter('ip-b')
    expect(r2.success).toBe(true)

    // ip-a is now blocked
    const r3 = await limiter('ip-a')
    expect(r3.success).toBe(false)

    // ip-b is also now blocked
    const r4 = await limiter('ip-b')
    expect(r4.success).toBe(false)
  })
})
