import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

// ── Secret handling ────────────────────────────────────────────────────────
// In production, ZCASHAUTH_SECRET is mandatory — we refuse to start without it.
// In development, a fallback is allowed but a warning is logged so devs notice.

const DEV_FALLBACK = 'zshield-dev-secret-change-in-production'

function resolveSecret(): Uint8Array {
  const raw = process.env.ZCASHAUTH_SECRET
  if (raw) {
    return new TextEncoder().encode(raw)
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[ZShield] ZCASHAUTH_SECRET must be set in production. ' +
      'Generate one with: openssl rand -base64 32'
    )
  }
  console.warn(
    '[ZShield] ZCASHAUTH_SECRET is not set — using insecure dev fallback. ' +
    'Do NOT deploy to production without setting this variable.'
  )
  return new TextEncoder().encode(DEV_FALLBACK)
}

const SECRET = resolveSecret()

const ISSUER   = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
const AUDIENCE = 'zshield'

export interface ZcashClaims extends JWTPayload {
  address:       string
  did:           string
  zec_holder:    boolean
  senior_holder?: boolean
  active_user?:   boolean
  holder_tier?:  'none' | 'holder' | 'senior' | 'whale'
}

export interface TokenOptions {
  /** Override the signing secret (useful for tests). */
  secret?: Uint8Array
  /** Override the issuer (useful for tests). */
  issuer?: string
  /** Override the audience (useful for tests). */
  audience?: string
}

export async function issueToken(
  claims: Omit<ZcashClaims, 'iss' | 'aud' | 'iat' | 'exp'>,
  opts?: TokenOptions,
): Promise<string> {
  const secret   = opts?.secret   ?? SECRET
  const issuer   = opts?.issuer   ?? ISSUER
  const audience = opts?.audience ?? AUDIENCE

  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyToken(
  token: string,
  opts?: TokenOptions,
): Promise<ZcashClaims> {
  const secret   = opts?.secret   ?? SECRET
  const issuer   = opts?.issuer   ?? ISSUER
  const audience = opts?.audience ?? AUDIENCE

  const { payload } = await jwtVerify(token, secret, {
    issuer,
    audience,
  })
  return payload as ZcashClaims
}

export function buildOIDCDiscovery(baseUrl: string) {
  return {
    issuer:                                baseUrl,
    authorization_endpoint:               `${baseUrl}/api/oidc/authorize`,
    token_endpoint:                        `${baseUrl}/api/oidc/token`,
    userinfo_endpoint:                     `${baseUrl}/api/oidc/userinfo`,
    jwks_uri:                              `${baseUrl}/api/oidc/jwks`,
    response_types_supported:             ['code'],
    subject_types_supported:              ['public'],
    id_token_signing_alg_values_supported: ['EdDSA'],
    scopes_supported:                     ['openid', 'profile', 'zec_holder'],
    claims_supported:                     ['sub', 'address', 'did', 'zec_holder', 'senior_holder', 'active_user', 'holder_tier'],
    grant_types_supported:                ['authorization_code'],
    code_challenge_methods_supported:     ['S256'],
    token_endpoint_auth_methods_supported: ['none'],  // Public clients (SPAs, wallets)
  }
}
