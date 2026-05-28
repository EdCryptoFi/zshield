import { describe, it, expect } from 'vitest'
import {
  generateKeyPair,
  signZip304Message,
  verifyZip304Signature,
  buildChallengeMessage,
  addressFromPublicKey,
  publicKeyFromAddress,
  toHex,
} from '../lib/crypto'

describe('ZIP 304 crypto', () => {
  it('generates a valid keypair', async () => {
    const kp = await generateKeyPair()
    expect(kp.privateKey).toHaveLength(64)
    expect(kp.publicKey).toHaveLength(64)
    expect(kp.address).toMatch(/^zauth1/)
  })

  it('round-trips bech32m address encoding', async () => {
    const kp      = await generateKeyPair()
    const pubKey  = Buffer.from(kp.publicKey, 'hex')
    const address = addressFromPublicKey(pubKey)
    const decoded = publicKeyFromAddress(address)
    expect(toHex(decoded)).toBe(kp.publicKey)
  })

  it('signs and verifies a message', async () => {
    const kp      = await generateKeyPair()
    const message = 'hello zcash'
    const sig     = await signZip304Message(message, kp.privateKey)

    expect(sig.r).toHaveLength(64)
    expect(sig.s).toHaveLength(64)

    const valid = await verifyZip304Signature(message, sig, kp.address)
    expect(valid).toBe(true)
  })

  it('rejects a tampered message', async () => {
    const kp  = await generateKeyPair()
    const sig = await signZip304Message('original', kp.privateKey)
    const bad = await verifyZip304Signature('tampered', sig, kp.address)
    expect(bad).toBe(false)
  })

  it('rejects a wrong address', async () => {
    const kp1 = await generateKeyPair()
    const kp2 = await generateKeyPair()
    const msg = 'test'
    const sig = await signZip304Message(msg, kp1.privateKey)
    const bad = await verifyZip304Signature(msg, sig, kp2.address)
    expect(bad).toBe(false)
  })

  it('builds a deterministic challenge message', () => {
    const msg = buildChallengeMessage({
      domain:   'localhost:3000',
      nonce:    'abc-123',
      issuedAt: '2026-05-26T00:00:00.000Z',
      address:  'zauth1test',
    })
    expect(msg).toContain('Nonce: abc-123')
    expect(msg).toContain('localhost:3000')
    expect(msg).toContain('zauth1test')
  })
})
