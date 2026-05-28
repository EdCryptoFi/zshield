/**
 * ZK Claims — prove attributes without revealing private data.
 *
 * Architecture:
 * - In demo mode (default): returns configurable demo claims
 * - In production mode (LIGHTWALLETD_URL set): queries lightwalletd gRPC
 *   to derive claims from blockchain data
 *
 * Production requires a viewing key to check shielded balance.
 * The viewing key is provided by the wallet during the auth flow.
 *
 * Lightwalletd public endpoints (mainnet):
 *   - mainnet.lightwalletd.com:9067  (Zcash Foundation)
 *   - zec.rocks:443                  (community)
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface ClaimsResult {
  /** Has balance >= minBalanceZat (default 0.001 ZEC / 100_000 zatoshi). */
  zec_holder:    boolean
  /** Address first seen on-chain > seniorMonths ago (default 6). */
  senior_holder: boolean
  /** Transacted within the last activeDays (default 30). */
  active_user:   boolean
  /** Tiered classification based on ZEC balance. */
  holder_tier:   'none' | 'holder' | 'senior' | 'whale'
}

export interface ClaimsConfig {
  /** Lightwalletd REST proxy URL, e.g. 'https://mainnet.lightwalletd.com:9067'. */
  lightwalletdUrl?: string
  /** Extended full viewing key — required for shielded balance lookups. */
  viewingKey?: string
  /** Minimum balance in zatoshi to qualify as a holder (default: 100_000 = 0.001 ZEC). */
  minBalanceZat?: bigint
  /** Months since first on-chain appearance for senior holder (default: 6). */
  seniorMonths?: number
  /** Days of inactivity threshold — if last tx is within this window, user is active (default: 30). */
  activeDays?: number
}

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS: Required<Pick<ClaimsConfig, 'minBalanceZat' | 'seniorMonths' | 'activeDays'>> = {
  minBalanceZat: 100_000n,  // 0.001 ZEC
  seniorMonths: 6,
  activeDays: 30,
}

// ── Balance → tier classification ───────────────────────────────────────────

/** Tier thresholds in zatoshi (1 ZEC = 100_000_000 zat). */
const TIER_THRESHOLDS = {
  whale:  10_000_000_000n,   // 100 ZEC
  senior: 1_000_000_000n,    //  10 ZEC
  holder: 100_000n,          //   0.001 ZEC
} as const

/**
 * Classifies a balance (in zatoshi) into a holder tier.
 *
 * - whale:  >= 100 ZEC
 * - senior: >=  10 ZEC
 * - holder: >=   0.001 ZEC
 * - none:   below holder threshold
 */
export function classifyTier(balanceZat: bigint): ClaimsResult['holder_tier'] {
  if (balanceZat >= TIER_THRESHOLDS.whale)  return 'whale'
  if (balanceZat >= TIER_THRESHOLDS.senior) return 'senior'
  if (balanceZat >= TIER_THRESHOLDS.holder) return 'holder'
  return 'none'
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolves ZK claims for a Zcash address.
 *
 * If `config.lightwalletdUrl` is set, queries the lightwalletd REST proxy
 * to derive real claims from on-chain data. Otherwise falls back to demo
 * mode which returns sensible defaults for local development.
 *
 * @param address - Zcash address (transparent, Sapling, or Unified)
 * @param config  - Optional overrides for thresholds and lightwalletd connection
 */
export async function resolveZKClaims(
  address: string,
  config?: ClaimsConfig,
): Promise<ClaimsResult> {
  const merged = {
    lightwalletdUrl: config?.lightwalletdUrl,
    viewingKey:      config?.viewingKey,
    minBalanceZat:   config?.minBalanceZat   ?? DEFAULTS.minBalanceZat,
    seniorMonths:    config?.seniorMonths    ?? DEFAULTS.seniorMonths,
    activeDays:      config?.activeDays      ?? DEFAULTS.activeDays,
  }

  if (merged.lightwalletdUrl) {
    try {
      return await resolveLightwalletdClaims(address, merged as unknown as Required<ClaimsConfig>)
    } catch (err) {
      console.error('[ZShield/claims] lightwalletd query failed, falling back to demo:', err)
      return resolveDemoClaims()
    }
  }

  return resolveDemoClaims()
}

// ── Demo mode ───────────────────────────────────────────────────────────────

/**
 * Returns hardcoded demo claims for local development.
 * Always reports the user as a basic holder with recent activity.
 */
export function resolveDemoClaims(): ClaimsResult {
  return {
    zec_holder:    true,
    senior_holder: false,
    active_user:   true,
    holder_tier:   'holder',
  }
}

// ── Lightwalletd integration ────────────────────────────────────────────────

/**
 * Internal: lightwalletd REST proxy response types.
 * These mirror the gRPC CompactTxStreamer service responses.
 */
interface BalanceResponse {
  /** Balance in zatoshi as a string (JSON doesn't support bigint). */
  balance: string
}

interface TransactionInfo {
  /** Block height of the transaction. */
  height: number
  /** Unix timestamp of the block. */
  time: number
}

interface TransactionsResponse {
  transactions: TransactionInfo[]
}

/**
 * Derives claims from lightwalletd blockchain data.
 *
 * Architecture notes for production:
 * - The lightwalletd gRPC service exposes CompactTxStreamer.
 * - For shielded (Sapling/Orchard) balances, a viewing key is required.
 * - Transparent balances can be queried by address alone.
 * - This implementation targets a REST proxy that wraps the gRPC service,
 *   such as the one provided by some lightwalletd deployments or a
 *   custom grpc-gateway. For direct gRPC, use @grpc/grpc-js with the
 *   lightwalletd .proto definitions.
 *
 * @param address - The Zcash address to query
 * @param config  - Full config with all fields required
 */
export async function resolveLightwalletdClaims(
  address: string,
  config: Required<ClaimsConfig>,
): Promise<ClaimsResult> {
  const [balanceZat, transactions] = await Promise.all([
    getBalance(address, config),
    getTransactions(address, config),
  ])

  const now = Date.now()
  const seniorCutoff = now - config.seniorMonths * 30 * 24 * 60 * 60 * 1000
  const activeCutoff = now - config.activeDays * 24 * 60 * 60 * 1000

  // Determine if address has been seen on-chain before the senior cutoff
  const earliestTxTime = transactions.length > 0
    ? Math.min(...transactions.map((tx) => tx.time * 1000))
    : now

  // Determine if there's any activity within the active window
  const latestTxTime = transactions.length > 0
    ? Math.max(...transactions.map((tx) => tx.time * 1000))
    : 0

  return {
    zec_holder:    balanceZat >= config.minBalanceZat,
    senior_holder: earliestTxTime < seniorCutoff,
    active_user:   latestTxTime > activeCutoff,
    holder_tier:   classifyTier(balanceZat),
  }
}

// ── Lightwalletd REST proxy calls ───────────────────────────────────────────

/**
 * Fetches the balance for an address via the lightwalletd REST proxy.
 *
 * Production gRPC equivalent:
 * ```
 * const client = new CompactTxStreamerClient(url, credentials)
 * const resp = await client.getBalance({ address, viewingKey })
 * return BigInt(resp.valueZat)
 * ```
 *
 * @returns Balance in zatoshi
 */
async function getBalance(
  address: string,
  config: Required<ClaimsConfig>,
): Promise<bigint> {
  const url = `${config.lightwalletdUrl}/v1/getbalance`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address,
      viewing_key: config.viewingKey,
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!resp.ok) {
    throw new Error(`lightwalletd getbalance failed: ${resp.status} ${resp.statusText}`)
  }

  const data = (await resp.json()) as BalanceResponse
  return BigInt(data.balance ?? '0')
}

/**
 * Fetches recent transactions for an address via the lightwalletd REST proxy.
 *
 * Used to determine:
 * - senior_holder: earliest transaction timestamp vs. seniorMonths threshold
 * - active_user:   latest transaction timestamp vs. activeDays threshold
 *
 * Production gRPC equivalent:
 * ```
 * const stream = client.getTaddressTxids({ address, range: { start, end } })
 * for await (const tx of stream) { ... }
 * ```
 *
 * @returns Array of transaction info objects with height and time
 */
async function getTransactions(
  address: string,
  config: Required<ClaimsConfig>,
): Promise<TransactionInfo[]> {
  const url = `${config.lightwalletdUrl}/v1/gettransactions`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address,
      viewing_key: config.viewingKey,
      // Request enough history to determine senior status
      // (roughly 6 months of blocks at ~75s block time)
      max_blocks: 210_000,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!resp.ok) {
    throw new Error(`lightwalletd gettransactions failed: ${resp.status} ${resp.statusText}`)
  }

  const data = (await resp.json()) as TransactionsResponse
  return data.transactions ?? []
}
