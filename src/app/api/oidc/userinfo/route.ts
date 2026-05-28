import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/oidc-keys'
import { verifyToken } from '@/lib/oidc'
import { corsHeaders } from '@/lib/cors'

/**
 * OIDC UserInfo Endpoint (RFC 7662)
 *
 * Accepts a Bearer access_token and returns the user's claims.
 * Supports both the new EdDSA id_tokens and legacy HS256 tokens for
 * backward compatibility during migration.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth  = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')

  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const issuer = process.env.NEXTAUTH_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

  try {
    // Try new EdDSA token first
    let claims: Record<string, unknown>
    try {
      claims = await verifyIdToken(token, { issuer, audience: '' })
    } catch {
      // Fallback to legacy HS256 token
      const legacyClaims = await verifyToken(token)
      claims = legacyClaims as unknown as Record<string, unknown>
    }

    return NextResponse.json({
      sub:           claims.sub,
      address:       claims.address,
      did:           claims.did,
      zec_holder:    claims.zec_holder,
      senior_holder: claims.senior_holder,
      active_user:   claims.active_user,
      holder_tier:   claims.holder_tier,
    }, { headers: corsHeaders(req) })
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  }
}

/**
 * CORS preflight for SPA clients.
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
