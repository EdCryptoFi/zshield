/**
 * Centralised CORS header helper.
 *
 * In production, reads ALLOWED_ORIGINS (comma-separated) from the environment
 * and only allows listed origins.  In development, defaults to '*'.
 *
 * Usage:
 * ```ts
 * return NextResponse.json(data, { headers: corsHeaders(req) })
 * ```
 */

import { NextRequest } from 'next/server'

/**
 * Returns a `Record<string, string>` with the correct
 * `Access-Control-Allow-Origin` (and related) headers.
 */
export function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const allowedRaw = process.env.ALLOWED_ORIGINS

  let allowOrigin: string

  if (allowedRaw) {
    // Explicit allow-list from env
    const allowed = allowedRaw.split(',').map((o) => o.trim()).filter(Boolean)
    allowOrigin = allowed.includes(origin) ? origin : ''
  } else if (process.env.NODE_ENV === 'production') {
    // Production without ALLOWED_ORIGINS — deny cross-origin by default
    allowOrigin = ''
  } else {
    // Development — permissive
    allowOrigin = '*'
  }

  const headers: Record<string, string> = {}
  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    // When reflecting a specific origin (not *), set Vary so caches behave
    if (allowOrigin !== '*') {
      headers['Vary'] = 'Origin'
    }
  }
  return headers
}
