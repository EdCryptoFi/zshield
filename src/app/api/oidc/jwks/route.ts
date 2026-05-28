import { NextRequest, NextResponse } from 'next/server'
import { getJWKS } from '@/lib/oidc-keys'
import { corsHeaders } from '@/lib/cors'

/**
 * JWKS endpoint — exposes the public signing key for id_token verification.
 * Clients use this to verify id_tokens without sharing secrets.
 *
 * Cache-Control: public keys change rarely, cache aggressively.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const jwks = await getJWKS()

  return NextResponse.json(jwks, {
    headers: {
      ...corsHeaders(req),
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
