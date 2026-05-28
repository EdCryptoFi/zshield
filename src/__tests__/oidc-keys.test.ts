import { describe, it, expect } from 'vitest'
import { signIdToken, verifyIdToken, getJWKS } from '../lib/oidc-keys'

describe('OIDC signing keys (EdDSA)', () => {
  const issuer   = 'http://localhost:3000'
  const audience = 'test-client'
  const subject  = 'did:zcash:mainnet:zauth1test'

  it('signs and verifies an id_token', async () => {
    const token = await signIdToken(
      { address: 'zauth1test', zec_holder: true },
      { issuer, audience, subject },
    )

    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT format

    const claims = await verifyIdToken(token, { issuer, audience })
    expect(claims.sub).toBe(subject)
    expect(claims.address).toBe('zauth1test')
    expect(claims.zec_holder).toBe(true)
  })

  it('rejects a tampered id_token', async () => {
    const token = await signIdToken(
      { address: 'test' },
      { issuer, audience, subject },
    )
    const tampered = token.slice(0, -4) + 'xxxx'
    await expect(verifyIdToken(tampered, { issuer, audience })).rejects.toThrow()
  })

  it('rejects wrong audience', async () => {
    const token = await signIdToken(
      { address: 'test' },
      { issuer, audience, subject },
    )
    await expect(verifyIdToken(token, { issuer, audience: 'wrong-client' })).rejects.toThrow()
  })

  it('rejects wrong issuer', async () => {
    const token = await signIdToken(
      { address: 'test' },
      { issuer, audience, subject },
    )
    await expect(verifyIdToken(token, { issuer: 'https://wrong.com', audience })).rejects.toThrow()
  })

  it('exposes a JWKS with public key', async () => {
    const jwks = await getJWKS()
    expect(jwks.keys).toHaveLength(1)
    expect(jwks.keys[0].kty).toBeDefined()
    expect(jwks.keys[0].kid).toBe('zshield-oidc-1')
    expect(jwks.keys[0].use).toBe('sig')
    expect(jwks.keys[0].alg).toBe('EdDSA')
    // Must NOT contain private key material
    expect(jwks.keys[0]).not.toHaveProperty('d')
  })
})
