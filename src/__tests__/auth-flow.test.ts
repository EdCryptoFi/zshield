import { describe, it, expect } from 'vitest'
import { generateKeyPair, signZip304Message, buildChallengeMessage, verifyZip304Signature } from '../lib/crypto'
import { storeNonce, consumeNonce } from '../lib/store'
import { issueToken, verifyToken } from '../lib/oidc'
import { didFromAddress, resolveDID } from '../lib/did'
import { v4 as uuidv4 } from 'uuid'

describe('Full ZShield flow', () => {
  it('completes challenge → sign → verify → JWT → userinfo', async () => {
    // 1. Wallet generates keypair
    const wallet = await generateKeyPair()

    // 2. Server issues challenge
    const nonce    = uuidv4()
    const issuedAt = new Date().toISOString()
    const message  = buildChallengeMessage({
      domain:   'localhost:3000',
      nonce,
      issuedAt,
      address:  wallet.address,
    })
    await storeNonce(nonce, message)

    // 3. Wallet signs the challenge
    const signature = await signZip304Message(message, wallet.privateKey)

    // 4. Server verifies signature
    const entry = await consumeNonce(nonce)
    expect(entry).not.toBeNull()

    const valid = await verifyZip304Signature(entry!.message, signature, wallet.address)
    expect(valid).toBe(true)

    // 5. Server issues JWT with claims
    const did   = didFromAddress(wallet.address)
    const token = await issueToken({
      sub:        did,
      address:    wallet.address,
      did,
      zec_holder: true,
    })

    // 6. Token verifies (userinfo equivalent)
    const claims = await verifyToken(token)
    expect(claims.address).toBe(wallet.address)
    expect(claims.did).toBe(did)
    expect(claims.zec_holder).toBe(true)

    // 7. DID resolves to document
    const doc = resolveDID(did)
    expect(doc.id).toBe(did)
    expect(doc.verificationMethod[0].publicKeyMultibase).toMatch(/^f[0-9a-f]{64}$/)

    // 8. Nonce is consumed — replay attack fails
    expect(await consumeNonce(nonce)).toBeNull()
  })

  it('rejects replay attack (same nonce twice)', async () => {
    const wallet = await generateKeyPair()
    const nonce  = uuidv4()
    const msg    = buildChallengeMessage({ domain: 'test', nonce, issuedAt: new Date().toISOString() })
    await storeNonce(nonce, msg)

    const sig = await signZip304Message(msg, wallet.privateKey)

    // First use succeeds
    const entry1 = await consumeNonce(nonce)
    expect(entry1).not.toBeNull()
    expect(await verifyZip304Signature(msg, sig, wallet.address)).toBe(true)

    // Second use (replay) fails
    const entry2 = await consumeNonce(nonce)
    expect(entry2).toBeNull()
  })
})
