import { describe, it, expect } from 'vitest'
import { storeNonce, consumeNonce, hasNonce, purgeExpiredNonces } from '../lib/store'

describe('nonce store', () => {
  it('stores and retrieves a nonce', async () => {
    await storeNonce('nonce-1', 'test message')
    expect(await hasNonce('nonce-1')).toBe(true)
  })

  it('consumes a nonce (one-time use)', async () => {
    await storeNonce('nonce-2', 'msg')
    const entry = await consumeNonce('nonce-2')
    expect(entry).not.toBeNull()
    expect(entry?.message).toBe('msg')
    // second consume must return null
    expect(await consumeNonce('nonce-2')).toBeNull()
  })

  it('returns null for unknown nonce', async () => {
    expect(await consumeNonce('does-not-exist')).toBeNull()
    expect(await hasNonce('does-not-exist')).toBe(false)
  })

  it('purges expired nonces without error', async () => {
    await storeNonce('nonce-3', 'msg')
    await expect(purgeExpiredNonces()).resolves.not.toThrow()
  })
})
