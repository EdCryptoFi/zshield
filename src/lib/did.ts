import { ZcashAddress, publicKeyFromAddress, toHex } from './crypto'

// W3C DID v1.1 — did:zcash method
// Spec: https://www.w3.org/TR/did-1.1/
// Method: did:zcash:<network>:<address>

export type Network = 'mainnet' | 'testnet'

export interface DIDDocument {
  '@context':            string[]
  id:                    string
  verificationMethod:    VerificationMethod[]
  authentication:        string[]
  assertionMethod:       string[]
  controller:            string
}

interface VerificationMethod {
  id:                 string
  type:               string
  controller:         string
  publicKeyMultibase: string
}

export function createDID(address: ZcashAddress, network: Network = 'mainnet'): string {
  return `did:zcash:${network}:${address}`
}

export function parseDID(did: string): { network: Network; address: ZcashAddress } {
  const parts = did.split(':')
  if (parts[0] !== 'did' || parts[1] !== 'zcash' || parts.length < 4) {
    throw new Error(`Invalid did:zcash DID: ${did}`)
  }
  return {
    network: parts[2] as Network,
    address: parts.slice(3).join(':'),
  }
}

export function resolveDID(did: string): DIDDocument {
  const { network, address } = parseDID(did)
  const pubKeyBytes = publicKeyFromAddress(address)
  // Multibase base16 (hex) prefix 'f'
  const publicKeyMultibase = 'f' + toHex(pubKeyBytes)

  const vmId = `${did}#key-1`

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id:         did,
    controller: did,
    verificationMethod: [
      {
        id:                 vmId,
        type:               'Ed25519VerificationKey2020',
        controller:         did,
        publicKeyMultibase,
      },
    ],
    authentication:  [vmId],
    assertionMethod: [vmId],
  }
}

export function didFromAddress(address: ZcashAddress, network: Network = 'mainnet'): string {
  return createDID(address, network)
}
