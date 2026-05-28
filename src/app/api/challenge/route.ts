import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { buildChallengeMessage } from '@/lib/crypto'
import { storeNonce } from '@/lib/store'
import { challengeRateLimit } from '@/lib/rate-limit'

/** Maximum request body size (2 KB — a challenge payload is tiny). */
const MAX_BODY_SIZE = 2048

/** Valid Zcash address prefixes (demo + mainnet Sapling + Unified). */
const VALID_ADDRESS_PREFIXES = ['zauth1', 'zs1', 'u1']

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rl = await challengeRateLimit(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

  // ── Body size guard ──────────────────────────────────────────────────────
  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
  }

  const body = await req.json().catch(() => ({}))

  // ── Input validation ─────────────────────────────────────────────────────
  const address = body.address as unknown
  if (address !== undefined) {
    if (typeof address !== 'string') {
      return NextResponse.json({ error: 'address must be a string' }, { status: 400 })
    }
    if (address.length > 256) {
      return NextResponse.json({ error: 'address too long' }, { status: 400 })
    }
    if (!VALID_ADDRESS_PREFIXES.some((p) => address.startsWith(p))) {
      return NextResponse.json(
        { error: `address must start with one of: ${VALID_ADDRESS_PREFIXES.join(', ')}` },
        { status: 400 },
      )
    }
  }

  const domain = req.headers.get('host') ?? 'localhost:3000'

  const nonce    = uuidv4()
  const issuedAt = new Date().toISOString()
  const message  = buildChallengeMessage({ domain, nonce, issuedAt, address: address as string | undefined })

  await storeNonce(nonce, message)

  return NextResponse.json({ nonce, message, issuedAt })
}
