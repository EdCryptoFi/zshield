/**
 * Sliding-window rate limiter (in-memory).
 *
 * Uses a Map keyed by IP address, storing an array of request timestamps.
 * Expired entries are cleaned up automatically on every check.
 *
 * For production at scale, swap the in-memory store for Redis
 * (e.g. `@upstash/ratelimit`) — the interface stays the same.
 */

interface RateLimitConfig {
  /** Time window in milliseconds. */
  windowMs: number
  /** Maximum number of requests allowed in the window. */
  maxRequests: number
}

interface RateLimitResult {
  /** Whether the request is allowed. */
  success: boolean
  /** Number of requests remaining in the current window. */
  remaining: number
  /** Unix timestamp (ms) when the oldest entry in the window expires. */
  resetAt: number
}

/** Per-IP sliding window state. */
const windows = new Map<string, number[]>()

/** Interval handle for periodic cleanup (one per process). */
let cleanupTimer: ReturnType<typeof setInterval> | null = null

const CLEANUP_INTERVAL_MS = 60_000 // 1 minute

/**
 * Creates a rate-limit checker for the given config.
 *
 * @example
 * ```ts
 * const checkChallenge = rateLimit({ windowMs: 60_000, maxRequests: 10 })
 * const result = await checkChallenge(ip)
 * if (!result.success) return NextResponse.json({ error: 'rate limited' }, { status: 429 })
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  ensureCleanup()

  return async function check(ip: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - config.windowMs
    const key = `${ip}:${config.windowMs}:${config.maxRequests}`

    // Get or create timestamps array, then prune expired entries
    let timestamps = windows.get(key) ?? []
    timestamps = timestamps.filter((t) => t > windowStart)

    if (timestamps.length >= config.maxRequests) {
      // Denied — window is full
      const oldestInWindow = timestamps[0]!
      windows.set(key, timestamps)
      return {
        success: false,
        remaining: 0,
        resetAt: oldestInWindow + config.windowMs,
      }
    }

    // Allowed — record this request
    timestamps.push(now)
    windows.set(key, timestamps)

    return {
      success: true,
      remaining: config.maxRequests - timestamps.length,
      resetAt: timestamps[0]! + config.windowMs,
    }
  }
}

// ── Pre-configured limiters for each endpoint ───────────────────────────────

/** Challenge endpoint: 10 requests / minute / IP */
export const challengeRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 10 })

/** Verify endpoint: 5 requests / minute / IP */
export const verifyRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 5 })

// ── Cleanup ─────────────────────────────────────────────────────────────────

/**
 * Removes all entries whose timestamps have fully expired.
 * Runs on a 1-minute interval to prevent unbounded memory growth.
 */
function purgeExpired() {
  const now = Date.now()
  for (const [key, timestamps] of windows.entries()) {
    const live = timestamps.filter((t) => t > now - 300_000) // keep up to 5 min
    if (live.length === 0) {
      windows.delete(key)
    } else {
      windows.set(key, live)
    }
  }
}

function ensureCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(purgeExpired, CLEANUP_INTERVAL_MS)
  // Allow the Node process to exit even if the timer is still running
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}
