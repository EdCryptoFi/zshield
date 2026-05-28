import { describe, it, expect } from 'vitest'
import {
  storeAuthCode,
  consumeAuthCode,
  verifyPKCE,
  generatePKCE,
  generateAuthCode,
} from '../lib/oidc-codes'

describe('OIDC Authorization Codes', () => {
  it('generates a random authorization code', () => {
    const code1 = generateAuthCode()
    const code2 = generateAuthCode()
    expect(code1).not.toBe(code2)
    expect(code1.length).toBeGreaterThan(20)
  })

  it('stores and consumes an authorization code', () => {
    const code = storeAuthCode({
      clientId:    'test-client',
      redirectUri: 'http://localhost:3000/callback',
      scope:       'openid profile zec_holder',
      subject:     'did:zcash:mainnet:zauth1test',
      address:     'zauth1test',
      claims:      { zec_holder: true },
    })

    expect(typeof code).toBe('string')

    // Consume succeeds first time
    const entry = consumeAuthCode(code)
    expect(entry).not.toBeNull()
    expect(entry!.clientId).toBe('test-client')
    expect(entry!.redirectUri).toBe('http://localhost:3000/callback')
    expect(entry!.subject).toBe('did:zcash:mainnet:zauth1test')
    expect(entry!.claims.zec_holder).toBe(true)

    // Second consume fails (single-use)
    expect(consumeAuthCode(code)).toBeNull()
  })

  it('returns null for unknown code', () => {
    expect(consumeAuthCode('nonexistent-code')).toBeNull()
  })

  it('stores code with PKCE challenge', () => {
    const { codeChallenge } = generatePKCE()

    const code = storeAuthCode({
      clientId:      'pkce-client',
      redirectUri:   'http://localhost:3000/callback',
      scope:         'openid',
      subject:       'did:zcash:mainnet:zauth1test',
      address:       'zauth1test',
      claims:        {},
      codeChallenge,
    })

    const entry = consumeAuthCode(code)
    expect(entry).not.toBeNull()
    expect(entry!.codeChallenge).toBe(codeChallenge)
  })
})

describe('PKCE', () => {
  it('generates valid code_verifier and code_challenge pair', () => {
    const { codeVerifier, codeChallenge } = generatePKCE()
    expect(codeVerifier.length).toBeGreaterThan(20)
    expect(codeChallenge.length).toBeGreaterThan(20)
    expect(codeVerifier).not.toBe(codeChallenge)
  })

  it('verifies correct code_verifier against code_challenge', () => {
    const { codeVerifier, codeChallenge } = generatePKCE()
    expect(verifyPKCE(codeVerifier, codeChallenge)).toBe(true)
  })

  it('rejects wrong code_verifier', () => {
    const { codeChallenge } = generatePKCE()
    expect(verifyPKCE('wrong-verifier', codeChallenge)).toBe(false)
  })

  it('is deterministic for same verifier', () => {
    const { codeVerifier, codeChallenge } = generatePKCE()
    expect(verifyPKCE(codeVerifier, codeChallenge)).toBe(true)
    expect(verifyPKCE(codeVerifier, codeChallenge)).toBe(true)
  })
})
