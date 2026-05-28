// Store adapter interface — implement this for any backend (memory, Redis, etc.)

export interface StoreAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlMs: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
}
