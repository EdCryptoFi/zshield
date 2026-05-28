import { NextRequest, NextResponse } from 'next/server'
import { consumeAuthCode, verifyPKCE } from '@/lib/oidc-codes'
import { signIdToken } from '@/lib/oidc-keys'
import { corsHeaders } from '@/lib/cors'
import { randomBytes } from 'crypto'

/**
 * OIDC Token Endpoint
 *
 * Exchanges an authorization code for tokens (RFC 6749 §4.1.3).
 * Supports PKCE verification (RFC 7636).
 *
 * Request body (application/x-www-form-urlencoded):
 *   - grant_type:    must be "authorization_code"
 *   - code:          the authorization code from /authorize
 *   - redirect_uri:  must match the one used in /authorize
 *   - client_id:     must match the one used in /authorize
 *   - code_verifier: PKCE verifier (required if code_challenge was sent)
 *
 * Response:
 *   - access_token:  opaque token for /userinfo
 *   - id_token:      JWT signed with EdDSA (verifiable via /jwks)
 *   - token_type:    "Bearer"
 *   - expires_in:    3600 (seconds)
 *   - scope:         granted scopes
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const grantType    = params.get('grant_type')
  const code         = params.get('code')
  const redirectUri  = params.get('redirect_uri')
  const clientId     = params.get('client_id')
  const codeVerifier = params.get('code_verifier')

  // ── Validate grant type ────────────────────────────────────────────────
  if (grantType !== 'authorization_code') {
    return NextResponse.json(
      { error: 'unsupported_grant_type', error_description: 'Only authorization_code is supported' },
      { status: 400 },
    )
  }

  if (!code) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'code is required' },
      { status: 400 },
    )
  }

  // ── Consume the authorization code (single-use) ────────────────────────
  const authCode = consumeAuthCode(code)
  if (!authCode) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid, expired, or already-used authorization code' },
      { status: 400 },
    )
  }

  // ── Validate redirect_uri binding ──────────────────────────────────────
  if (redirectUri && redirectUri !== authCode.redirectUri) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'redirect_uri does not match' },
      { status: 400 },
    )
  }

  // ── Validate client_id binding ─────────────────────────────────────────
  if (clientId && clientId !== authCode.clientId) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'client_id does not match' },
      { status: 400 },
    )
  }

  // ── PKCE verification ──────────────────────────────────────────────────
  if (authCode.codeChallenge) {
    if (!codeVerifier) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'code_verifier is required (PKCE)' },
        { status: 400 },
      )
    }
    if (!verifyPKCE(codeVerifier, authCode.codeChallenge)) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'PKCE code_verifier does not match' },
        { status: 400 },
      )
    }
  }

  // ── Issue tokens ───────────────────────────────────────────────────────
  const issuer = process.env.NEXTAUTH_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

  const idToken = await signIdToken(
    {
      address:       authCode.address,
      did:           authCode.subject,
      zec_holder:    authCode.claims.zec_holder ?? false,
      senior_holder: authCode.claims.senior_holder ?? false,
      active_user:   authCode.claims.active_user ?? false,
      holder_tier:   authCode.claims.holder_tier ?? 'none',
    },
    {
      issuer,
      audience: authCode.clientId,
      subject:  authCode.subject,
      expiresIn: '1h',
    },
  )

  // Opaque access token for /userinfo (in production, store in session store)
  const accessToken = randomBytes(32).toString('base64url')

  // Store access token → claims mapping for /userinfo
  // We reuse the id_token as access_token for simplicity in this version
  const headers = corsHeaders(req)

  return NextResponse.json({
    access_token: idToken,       // /userinfo accepts this as Bearer token
    id_token:     idToken,       // JWT verifiable via /jwks
    token_type:   'Bearer',
    expires_in:   3600,
    scope:        authCode.scope,
    sub:          authCode.subject,
  }, { headers })
}

/**
 * Handle CORS preflight for token endpoint (needed by SPA clients).
 */
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(req),
      'Access-Control-Max-Age': '86400',
    },
  })
}
