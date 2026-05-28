import * as ed from '@noble/ed25519'
import { createHash } from 'crypto'
import { bech32m } from 'bech32'

/**
 * ZShield Crypto Layer
 *
 * This module implements the ZIP 304 *interface* using Ed25519 as a stand-in.
 *
 * ZIP 304 real spec:
 *   - Uses BLAKE2b-256 with "ZIP304Signed" personalization
 *   - Requires a fake Sapling note + ZK-SNARK proof (192 bytes)
 *   - Full signature is 320 bytes: zkproof(192) + spendAuthSig(64) + rk(32) + cv(32)
 *   - Encoded as base64 with "zip304:" prefix
 *
 * Demo uses Ed25519 (same EdDSA pattern, different curve) so the auth FLOW is
 * identical and the interface is a drop-in. To go to production:
 *   1. Compile librustzcash → WASM
 *   2. Replace signZip304Message / verifyZip304Signature with WASM calls
 *   3. Address format switches from "zauth1..." to "zs1..." (Sapling) or "u1..." (Unified)
 */

// Use Node.js built-in sha512 (avoids @noble/hashes subpath export issues in ESM)
const sha512 = (data: Uint8Array): Uint8Array =>
  new Uint8Array(createHash('sha512').update(data).digest())

;(ed as unknown as { hashes: { sha512: (d: Uint8Array) => Uint8Array } }).hashes.sha512 = sha512

export type ZcashAddress = string
export type HexString   = string

export interface Signature {
  r: HexString  // 32 bytes — maps to spendAuthSig[0..32] in real ZIP 304
  s: HexString  // 32 bytes — maps to spendAuthSig[32..64] in real ZIP 304
}

export interface KeyPair {
  privateKey: HexString
  publicKey:  HexString
  address:    ZcashAddress
}

// "zauth" HRP used for demo. Mainnet Sapling = "zs", Unified = "u"
const HRP = 'zauth'

export function addressFromPublicKey(pubKey: Uint8Array): ZcashAddress {
  const words = bech32m.toWords(pubKey)
  return bech32m.encode(HRP, words)
}

export function publicKeyFromAddress(address: ZcashAddress): Uint8Array {
  const { words } = bech32m.decode(address)
  return new Uint8Array(bech32m.fromWords(words))
}

export async function generateKeyPair(): Promise<KeyPair> {
  const privKey = ed.utils.randomSecretKey()
  const pubKey  = await ed.getPublicKeyAsync(privKey)
  return {
    privateKey: toHex(privKey),
    publicKey:  toHex(pubKey),
    address:    addressFromPublicKey(pubKey),
  }
}

/**
 * Signs a message — mirrors ZIP 304 signmessage semantics.
 * Real ZIP 304 uses BLAKE2b-256("ZIP304Signed" + coinType + message) inside a ZK circuit.
 * Demo uses Ed25519(prefixed(message)) — same interface, swap internals for production.
 */
export async function signZip304Message(message: string, privateKeyHex: HexString): Promise<Signature> {
  const msgBytes = new TextEncoder().encode(prefixed(message))
  const privKey  = fromHex(privateKeyHex)
  const sig      = await ed.signAsync(msgBytes, privKey)
  return { r: toHex(sig.slice(0, 32)), s: toHex(sig.slice(32)) }
}

/** Verifies a ZIP 304 signature against a Zcash address */
export async function verifyZip304Signature(
  message:   string,
  signature: Signature,
  address:   ZcashAddress,
): Promise<boolean> {
  try {
    const pubKey   = publicKeyFromAddress(address)
    const msgBytes = new TextEncoder().encode(prefixed(message))
    const sigBytes = new Uint8Array([...fromHex(signature.r), ...fromHex(signature.s)])
    return await ed.verifyAsync(sigBytes, msgBytes, pubKey)
  } catch {
    return false
  }
}

/**
 * Builds the canonical challenge message (anti-replay).
 * Format mirrors EIP-4361 (SIWE) adapted for Zcash.
 */
export function buildChallengeMessage(opts: {
  domain:    string
  nonce:     string
  issuedAt:  string
  address?:  string
}): string {
  return [
    `${opts.domain} wants you to sign in with your Zcash account.`,
    '',
    opts.address ? `Address: ${opts.address}` : '',
    '',
    `Nonce: ${opts.nonce}`,
    `Issued At: ${opts.issuedAt}`,
  ].join('\n').trim()
}

// ── helpers ──────────────────────────────────────────────────────────────────

function prefixed(msg: string): string {
  const bytes = new TextEncoder().encode(msg)
  return `\x18Zcash Signed Message:\n${bytes.length}${msg}`
}

export function toHex(bytes: Uint8Array): HexString {
  return Buffer.from(bytes).toString('hex')
}

export function fromHex(hex: HexString): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, 'hex'))
}
