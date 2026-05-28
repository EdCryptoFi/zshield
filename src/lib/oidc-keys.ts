/**
 * OIDC Signing Keys (JWKS)
 *
 * Manages the asymmetric keypair used to sign OIDC id_tokens.
 * Uses EdDSA (Ed25519) via jose — fast, small signatures, modern standard.
 *
 * In production, the keypair should be loaded from environment:
 *   OIDC_SIGNING_KEY_JWK = JSON-encoded JWK private key
 *
 * In development, a keypair is auto-generated on first use (ephemeral per process).
 *
 * The JWKS endpoint exposes only the public key.
 */

import { generateKeyPair, exportJWK, importJWK, SignJWT, jwtVerify, type JWK } from 'jose'

interface KeyPair {
  privateKey: CryptoKey
  publicJWK:  JWK & { kid: string; use: string; alg: string }
}

let _keyPair: KeyPair | null = null

const KID = 'zshield-oidc-1'
const ALG = 'EdDSA'

/**
 * Resolve or generate the OIDC signing keypair.
 */
async function getKeyPair(): Promise<KeyPair> {
  if (_keyPair) return _keyPair

  const envJwk = process.env.OIDC_SIGNING_KEY_JWK

  if (envJwk) {
    // Production: load from env
    const jwk = JSON.parse(envJwk) as JWK
    const privateKey = await importJWK(jwk, ALG) as CryptoKey

    // Derive public JWK (strip private fields)
    const fullJwk = await exportJWK(privateKey)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { d: _d, ...publicFields } = fullJwk

    _keyPair = {
      privateKey,
      publicJWK: { ...publicFields, kid: KID, use: 'sig', alg: ALG },
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[ZShield] OIDC_SIGNING_KEY_JWK is not set — generating ephemeral key. ' +
        'Generate a persistent key for production.'
      )
    }
    // Dev: generate ephemeral keypair
    const { privateKey, publicKey } = await generateKeyPair(ALG, { extractable: true })
    const publicJWK = await exportJWK(publicKey)

    _keyPair = {
      privateKey: privateKey as CryptoKey,
      publicJWK: { ...publicJWK, kid: KID, use: 'sig', alg: ALG },
    }
  }

  return _keyPair
}

/**
 * Sign an OIDC id_token with the private key.
 */
export async function signIdToken(payload: Record<string, unknown>, opts: {
  issuer:   string
  audience: string
  subject:  string
  expiresIn?: string
}): Promise<string> {
  const kp = await getKeyPair()

  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG, kid: KID, typ: 'JWT' })
    .setIssuer(opts.issuer)
    .setAudience(opts.audience)
    .setSubject(opts.subject)
    .setIssuedAt()
    .setExpirationTime(opts.expiresIn ?? '1h')
    .sign(kp.privateKey)
}

/**
 * Verify an OIDC id_token with the public key.
 */
export async function verifyIdToken(token: string, opts: {
  issuer:   string
  audience: string
}): Promise<Record<string, unknown>> {
  const kp = await getKeyPair()
  const publicKey = await importJWK(kp.publicJWK, ALG)

  const { payload } = await jwtVerify(token, publicKey, {
    issuer:   opts.issuer,
    audience: opts.audience,
  })
  return payload as Record<string, unknown>
}

/**
 * Get the JWKS document (public keys only).
 */
export async function getJWKS(): Promise<{ keys: JWK[] }> {
  const kp = await getKeyPair()
  return { keys: [kp.publicJWK] }
}

/**
 * Utility: generate a new Ed25519 JWK private key for env configuration.
 * Run: npx tsx -e "import('./src/lib/oidc-keys').then(m => m.generateSigningKey().then(console.log))"
 */
export async function generateSigningKey(): Promise<string> {
  const { privateKey } = await generateKeyPair(ALG, { extractable: true })
  const jwk = await exportJWK(privateKey)
  return JSON.stringify(jwk)
}
