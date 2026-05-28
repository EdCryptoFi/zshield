import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { storeAuthCode } from '@/lib/oidc-codes'
import { resolveZKClaims } from '@/lib/claims'
import { didFromAddress } from '@/lib/did'

/**
 * OIDC Authorization Endpoint
 *
 * Implements the Authorization Code flow (RFC 6749 §4.1) with PKCE (RFC 7636).
 *
 * Flow:
 * 1. Client redirects user here with client_id, redirect_uri, scope, state, code_challenge
 * 2. User must already be authenticated via ZShield (NextAuth session)
 * 3. Server generates an authorization code bound to the session
 * 4. Redirects back to client's redirect_uri with code + state
 *
 * Supported parameters:
 *   - response_type: must be "code"
 *   - client_id:     the relying party identifier
 *   - redirect_uri:  where to send the code
 *   - scope:         space-separated (openid profile zec_holder)
 *   - state:         CSRF token from client (echoed back)
 *   - code_challenge: PKCE challenge (S256)
 *   - code_challenge_method: must be "S256" if code_challenge is present
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const params = req.nextUrl.searchParams

  const responseType         = params.get('response_type')
  const clientId             = params.get('client_id')
  const redirectUri          = params.get('redirect_uri')
  const scope                = params.get('scope') ?? 'openid'
  const state                = params.get('state')
  const codeChallenge        = params.get('code_challenge')
  const codeChallengeMethod  = params.get('code_challenge_method')

  // ── Validate required params ───────────────────────────────────────────
  if (responseType !== 'code') {
    return NextResponse.json(
      { error: 'unsupported_response_type', error_description: 'Only response_type=code is supported' },
      { status: 400 },
    )
  }

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'client_id and redirect_uri are required' },
      { status: 400 },
    )
  }

  // Validate PKCE method if challenge is present
  if (codeChallenge && codeChallengeMethod !== 'S256') {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'code_challenge_method must be S256' },
      { status: 400 },
    )
  }

  // ── Check authentication ───────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.name) {
    // User not authenticated — redirect to login with return URL
    const loginUrl = new URL('/', req.nextUrl.origin)
    loginUrl.searchParams.set('returnTo', req.nextUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  const address = session.user.name
  const did = didFromAddress(address)

  // ── Resolve claims for the token ───────────────────────────────────────
  const claims = await resolveZKClaims(address, {
    lightwalletdUrl: process.env.LIGHTWALLETD_URL,
    viewingKey:      process.env.VIEWING_KEY,
  })

  // ── Issue authorization code ───────────────────────────────────────────
  const code = storeAuthCode({
    clientId,
    redirectUri,
    scope,
    subject: did,
    address,
    claims: claims as unknown as Record<string, unknown>,
    ...(codeChallenge ? { codeChallenge } : {}),
  })

  // ── Redirect to client ─────────────────────────────────────────────────
  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set('code', code)
  if (state) callbackUrl.searchParams.set('state', state)

  return NextResponse.redirect(callbackUrl)
}
