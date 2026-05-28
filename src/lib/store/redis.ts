import type { StoreAdapter } from './types'

/**
 * Redis store adapter.
 * Requires `ioredis` package: npm install ioredis
 * Requires REDIS_URL environment variable.
 *
 * Uses dynamic import so ioredis is only loaded when this adapter is selected.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedisClient = any

export class RedisAdapter implements StoreAdapter {
  private clientPromise: Promise<RedisClient>

  constructor(url?: string) {
    const redisUrl = url ?? process.env.REDIS_URL
    if (!redisUrl) {
      throw new Error('RedisAdapter requires REDIS_URL environment variable or a url parameter')
    }

    this.clientPromise = this.connect(redisUrl)
  }

  private async connect(url: string): Promise<RedisClient> {
    // Dynamic import — ioredis is only resolved at runtime.
    // @ts-expect-error -- ioredis is an optional peer dependency
    const ioredis = await import('ioredis')
    const Redis = ioredis.default
    const client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 10) return null          // stop retrying after 10 attempts
        return Math.min(times * 200, 5_000)  // exponential backoff, max 5s
      },
      lazyConnect: false,
    })

    client.on('error', (err: Error) => {
      console.error('[RedisAdapter] connection error:', err.message)
    })

    return client
  }

  async get(key: string): Promise<string | null> {
    const client = await this.clientPromise
    return client.get(key)
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    const client = await this.clientPromise
    // PX = milliseconds TTL
    await client.set(key, value, 'PX', ttlMs)
  }

  async del(key: string): Promise<void> {
    const client = await this.clientPromise
    await client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const client = await this.clientPromise
    const count = await client.exists(key)
    return count > 0
  }

  /** Disconnect from Redis (useful for graceful shutdown). */
  async destroy(): Promise<void> {
    const client = await this.clientPromise
    await client.quit()
  }
}
