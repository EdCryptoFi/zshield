import { describe, it, expect } from 'vitest'
import { resolveZKClaims, resolveDemoClaims, classifyTier } from '../lib/claims'

describe('ZK Claims', () => {
  it('returns demo claims by default', async () => {
    const claims = await resolveZKClaims('zauth1test')
    expect(claims.zec_holder).toBe(true)
    expect(claims.holder_tier).toBe('holder')
    expect(claims.active_user).toBe(true)
    expect(claims.senior_holder).toBe(false)
  })

  it('resolveDemoClaims returns consistent defaults', () => {
    const claims = resolveDemoClaims()
    expect(claims.zec_holder).toBe(true)
    expect(claims.holder_tier).toBe('holder')
    expect(claims.active_user).toBe(true)
    expect(claims.senior_holder).toBe(false)
  })

  it('classifies holder tiers correctly', () => {
    expect(classifyTier(0n)).toBe('none')
    expect(classifyTier(50_000n)).toBe('none')         // below 0.001 ZEC
    expect(classifyTier(100_000n)).toBe('holder')       // exactly 0.001 ZEC
    expect(classifyTier(500_000_000n)).toBe('holder')   // 5 ZEC
    expect(classifyTier(1_000_000_000n)).toBe('senior') // 10 ZEC
    expect(classifyTier(5_000_000_000n)).toBe('senior') // 50 ZEC
    expect(classifyTier(10_000_000_000n)).toBe('whale')  // 100 ZEC
    expect(classifyTier(100_000_000_000n)).toBe('whale') // 1000 ZEC
  })
})
