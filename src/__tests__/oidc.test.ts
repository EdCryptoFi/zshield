import { describe, it, expect } from 'vitest'
import { issueToken, verifyToken, buildOIDCDiscovery } from '../lib/oidc'

describe('OIDC helpers', () => {
  it('issues and verifies a JWT token', async () => {
    const token = await issueToken({
      sub:        'did:zcash:mainnet:zauth1test',
      address:    'zauth1test',
      did:        'did:zcash:mainnet:zauth1test',
      zec_holder: true,
    })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const claims = await verifyToken(token)
    expect(claims.address).toBe('zauth1test')
    expect(claims.zec_holder).toBe(true)
    expect(claims.did).toBe('did:zcash:mainnet:zauth1test')
  })

  it('rejects a tampered token', async () => {
    const token  = await issueToken({ sub: 'test', address: 'a', did: 'b', zec_holder: false })
    const tampered = token.slice(0, -4) + 'xxxx'
    await expect(verifyToken(tampered)).rejects.toThrow()
  })

  it('builds a valid OIDC discovery document', () => {
    const doc = buildOIDCDiscovery('http://localhost:3000')
    expect(doc.issuer).toBe('http://localhost:3000')
    expect(doc.authorization_endpoint).toContain('/api/oidc/authorize')
    expect(doc.token_endpoint).toContain('/api/oidc/token')
    expect(doc.userinfo_endpoint).toContain('/api/oidc/userinfo')
    expect(doc.jwks_uri).toContain('/api/oidc/jwks')
    expect(doc.scopes_supported).toContain('zec_holder')
    expect(doc.claims_supported).toContain('did')
    expect(doc.claims_supported).toContain('holder_tier')
    expect(doc.id_token_signing_alg_values_supported).toContain('EdDSA')
    expect(doc.code_challenge_methods_supported).toContain('S256')
    expect(doc.token_endpoint_auth_methods_supported).toContain('none')
  })
})
