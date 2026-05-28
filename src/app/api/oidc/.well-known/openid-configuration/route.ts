import { NextRequest, NextResponse } from 'next/server'
import { buildOIDCDiscovery } from '@/lib/oidc'
import { corsHeaders } from '@/lib/cors'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const base = process.env.NEXTAUTH_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
  return NextResponse.json(buildOIDCDiscovery(base), {
    headers: {
      ...corsHeaders(req),
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600',
    },
  })
}
