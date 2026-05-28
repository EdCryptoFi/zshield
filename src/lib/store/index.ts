import type { StoreAdapter } from './types'
import { MemoryAdapter } from './memory'

// ── TTL constants ───────────────────────────────────────────────────────────
export const NONCE_TTL_MS   = 5 * 60 * 1_000        // 5 minutes
export const SESSION_TTL_MS = 24 * 60 * 60 * 1_000   // 24 hours

// ── Domain types ────────────────────────────────────────────────────────────
export interface NonceEntry {
  nonce:     string
  message:   string
  expiresAt: number
}

export interface SessionEntry {
  address: string
  did:     string
  claims:  Record<string, unknown>
}

// ── Adapter factory (singleton) ─────────────────────────────────────────────
let _adapter: StoreAdapter | null = null

function getAdapter(): StoreAdapter {
  if (_adapter) return _adapter

  const backend = process.env.STORE_ADAPTER ?? 'memory'

  switch (backend) {
    case 'redis': {
      // Redis adapter requires ioredis to be installed separately.
      // To enable: npm install ioredis, set REDIS_URL, STORE_ADAPTER=redis.
      //
      // We use a dynamic require with a computed path to prevent Turbopack
      // from statically resolving the import at build time.
      const adapterPath = ['./redis'].join('')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(adapterPath) as { RedisAdapter: new () => StoreAdapter }
      _adapter = new mod.RedisAdapter()
      break
    }
    case 'memory':
    default:
      _adapter = new MemoryAdapter()
      break
  }

  return _adapter
}

// Key prefixes
const nonceKey   = (id: string) => `nonce:${id}`
const sessionKey = (token: string) => `session:${token}`

// ── Nonces ──────────────────────────────────────────────────────────────────

export async function storeNonce(nonce: string, message: string): Promise<void> {
  const entry: NonceEntry = {
    nonce,
    message,
    expiresAt: Date.now() + NONCE_TTL_MS,
  }
  await getAdapter().set(nonceKey(nonce), JSON.stringify(entry), NONCE_TTL_MS)
}

export async function consumeNonce(nonce: string): Promise<NonceEntry | null> {
  const adapter = getAdapter()
  const raw = await adapter.get(nonceKey(nonce))
  if (!raw) return null

  const entry: NonceEntry = JSON.parse(raw)
  if (Date.now() > entry.expiresAt) {
    await adapter.del(nonceKey(nonce))
    return null
  }

  // One-time use: delete immediately
  await adapter.del(nonceKey(nonce))
  return entry
}

export async function hasNonce(nonce: string): Promise<boolean> {
  const adapter = getAdapter()
  const raw = await adapter.get(nonceKey(nonce))
  if (!raw) return false

  const entry: NonceEntry = JSON.parse(raw)
  if (Date.now() > entry.expiresAt) {
    await adapter.del(nonceKey(nonce))
    return false
  }
  return true
}

// ── Sessions ────────────────────────────────────────────────────────────────

export async function storeSession(token: string, data: SessionEntry): Promise<void> {
  await getAdapter().set(sessionKey(token), JSON.stringify(data), SESSION_TTL_MS)
}

export async function getSession(token: string): Promise<SessionEntry | null> {
  const raw = await getAdapter().get(sessionKey(token))
  if (!raw) return null
  return JSON.parse(raw) as SessionEntry
}

export async function deleteSession(token: string): Promise<void> {
  await getAdapter().del(sessionKey(token))
}

// ── Cleanup ─────────────────────────────────────────────────────────────────

export async function purgeExpiredNonces(): Promise<void> {
  // For Redis, TTL-based expiry handles this automatically.
  // For MemoryAdapter, the periodic cleanup handles it.
  // This function exists for API compatibility and can be called as a manual sweep.
  // No-op in adapters with built-in TTL expiry.
}

// ── Re-exports ──────────────────────────────────────────────────────────────
export type { StoreAdapter } from './types'
