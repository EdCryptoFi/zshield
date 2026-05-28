/**
 * OIDC Authorization Code Management
 *
 * Implements proper OAuth2 authorization code flow with PKCE (RFC 7636).
 * Authorization codes are:
 *   - Opaque, random strings (not JWTs)
 *   - Single-use (consumed on token exchange)
 *   - Short-lived (10 minutes TTL)
 *   - Bound to a PKCE code_challenge when provided
 *   - Bound to the redirect_uri used during authorization
 */

import { randomBytes, createHash } from 'crypto'

// Re-use the existing store adapter for persistence
const CODE_TTL_MS = 10 * 60 * 1_000 // 10 minutes

export interface AuthorizationCode {
  code:            string
  clientId:        string
  redirectUri:     string
  scope:           string
  subject:         string        // DID
  address:         string
  claims:          Record<string, unknown>
  codeChallenge?:  string        // PKCE S256 challenge
  createdAt:       number
  expiresAt:       number
}

// In-memory map — uses the same store adapter pattern when STORE_ADAPTER=redis
// For now we store codes in a Map; production should use the StoreAdapter.
const codes = new Map<string, AuthorizationCode>()

/**
 * Generate a cryptographically random authorization code.
 * Format: 43-char URL-safe base64 (256 bits of entropy).
 */
export function generateAuthCode(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Store an authorization code entry.
 */
export function storeAuthCode(entry: Omit<AuthorizationCode, 'code' | 'createdAt' | 'expiresAt'>): string {
  const code = generateAuthCode()
  const now = Date.now()
  const full: AuthorizationCode = {
    ...entry,
    code,
    createdAt: now,
    expiresAt: now + CODE_TTL_MS,
  }
  codes.set(code, full)
  // Schedule cleanup
  setTimeout(() => codes.delete(code), CODE_TTL_MS)
  return code
}

/**
 * Consume an authorization code (single-use).
 * Returns null if the code is invalid, expired, or already consumed.
 */
export function consumeAuthCode(code: string): AuthorizationCode | null {
  const entry = codes.get(code)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    codes.delete(code)
    return null
  }
  // Single-use: delete immediately
  codes.delete(code)
  return entry
}

/**
 * Verify PKCE code_verifier against the stored code_challenge (S256).
 * RFC 7636 §4.6: code_challenge = BASE64URL(SHA256(code_verifier))
 */
export function verifyPKCE(codeVerifier: string, codeChallenge: string): boolean {
  const computed = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  return computed === codeChallenge
}

/**
 * Generate a PKCE code_verifier and code_challenge pair (for clients/testing).
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  return { codeVerifier, codeChallenge }
}
