import { NextRequest, NextResponse } from 'next/server'
import { verifyZip304Signature, type Signature } from '@/lib/crypto'
import { consumeNonce } from '@/lib/store'
import { issueToken } from '@/lib/oidc'
import { didFromAddress } from '@/lib/did'
import { resolveZKClaims } from '@/lib/claims'
import { verifyRateLimit } from '@/lib/rate-limit'

/** Valid Zcash address prefixes (demo + mainnet Sapling + Unified). */
const VALID_ADDRESS_PREFIXES = ['zauth1', 'zs1', 'u1']

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** 32-byte hex string (64 hex chars). */
const HEX_32_RE = /^[0-9a-f]{64}$/i

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rl = await verifyRateLimit(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

  const body = await req.json().catch(() => null)

  if (!body?.nonce || !body?.signature || !body?.address) {
    return NextResponse.json({ error: 'Missing nonce, signature or address' }, { status: 400 })
  }

  const { nonce, signature, address } = body as { nonce: unknown; signature: unknown; address: unknown }

  // ── Validate nonce (UUID v4) ─────────────────────────────────────────────
  if (typeof nonce !== 'string' || !UUID_RE.test(nonce)) {
    return NextResponse.json({ error: 'nonce must be a valid UUID v4' }, { status: 400 })
  }

  // ── Validate address format ──────────────────────────────────────────────
  if (typeof address !== 'string' || address.length > 256) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 })
  }
  if (!VALID_ADDRESS_PREFIXES.some((p) => (address as string).startsWith(p))) {
    return NextResponse.json(
      { error: `address must start with one of: ${VALID_ADDRESS_PREFIXES.join(', ')}` },
      { status: 400 },
    )
  }

  // ── Validate signature shape ─────────────────────────────────────────────
  if (
    typeof signature !== 'object' ||
    signature === null ||
    typeof (signature as Signature).r !== 'string' ||
    typeof (signature as Signature).s !== 'string' ||
    !HEX_32_RE.test((signature as Signature).r) ||
    !HEX_32_RE.test((signature as Signature).s)
  ) {
    return NextResponse.json(
      { error: 'signature must have r and s as 64-char hex strings (32 bytes each)' },
      { status: 400 },
    )
  }

  const validSig = signature as Signature
  const validAddress = address as string

  // ── Nonce consumption ────────────────────────────────────────────────────
  const entry = await consumeNonce(nonce as string)
  if (!entry) {
    return NextResponse.json({ error: 'Invalid or expired nonce' }, { status: 401 })
  }

  const valid = await verifyZip304Signature(entry.message, validSig, validAddress)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ── Issue token with claims ──────────────────────────────────────────────
  const did    = didFromAddress(validAddress)
  const claims = await resolveZKClaims(validAddress, {
    lightwalletdUrl: process.env.LIGHTWALLETD_URL,
    viewingKey:      process.env.VIEWING_KEY,
  })
  const token  = await issueToken({ address: validAddress, did, sub: did, ...claims })

  return NextResponse.json({ token, address: validAddress, did, claims })
}
