import { describe, it, expect } from 'vitest'
import { createDID, parseDID, resolveDID, didFromAddress } from '../lib/did'
import { generateKeyPair } from '../lib/crypto'

describe('did:zcash method', () => {
  it('creates a well-formed DID', async () => {
    const { address } = await generateKeyPair()
    const did = createDID(address)
    expect(did).toMatch(/^did:zcash:mainnet:zauth1/)
  })

  it('creates a testnet DID', async () => {
    const { address } = await generateKeyPair()
    const did = createDID(address, 'testnet')
    expect(did).toContain(':testnet:')
  })

  it('parses a DID back to network and address', async () => {
    const { address } = await generateKeyPair()
    const did    = createDID(address, 'mainnet')
    const parsed = parseDID(did)
    expect(parsed.network).toBe('mainnet')
    expect(parsed.address).toBe(address)
  })

  it('throws on invalid DID', () => {
    expect(() => parseDID('did:eth:0x123')).toThrow()
    expect(() => parseDID('not-a-did')).toThrow()
  })

  it('resolves a DID to a valid W3C DID document', async () => {
    const { address } = await generateKeyPair()
    const did = didFromAddress(address)
    const doc = resolveDID(did)

    expect(doc['@context']).toContain('https://www.w3.org/ns/did/v1')
    expect(doc.id).toBe(did)
    expect(doc.verificationMethod).toHaveLength(1)
    expect(doc.verificationMethod[0].type).toBe('Ed25519VerificationKey2020')
    expect(doc.verificationMethod[0].publicKeyMultibase).toMatch(/^f[0-9a-f]{64}$/)
    expect(doc.authentication).toContain(`${did}#key-1`)
    expect(doc.assertionMethod).toContain(`${did}#key-1`)
  })
})
