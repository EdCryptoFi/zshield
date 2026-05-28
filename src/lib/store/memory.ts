import type { StoreAdapter } from './types'

interface MemoryEntry {
  value: string
  expiresAt: number
}

/**
 * In-memory store adapter with TTL support.
 * Suitable for development and single-instance deployments.
 */
export class MemoryAdapter implements StoreAdapter {
  private data = new Map<string, MemoryEntry>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Periodic cleanup every 60 seconds
    this.cleanupTimer = setInterval(() => this.purge(), 60_000)
    // Allow the process to exit even if the timer is still running
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  async get(key: string): Promise<string | null> {
    const entry = this.data.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.data.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    this.data.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  async del(key: string): Promise<void> {
    this.data.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const val = await this.get(key)
    return val !== null
  }

  /** Remove all expired entries */
  private purge(): void {
    const now = Date.now()
    for (const [key, entry] of this.data) {
      if (now > entry.expiresAt) {
        this.data.delete(key)
      }
    }
  }

  /** Stop the cleanup timer (useful for tests) */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}
