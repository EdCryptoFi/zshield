'use client'

import { useState, useEffect } from 'react'
import type { KeyPair } from '@/lib/crypto'

export default function DemoWallet() {
  const [wallet,  setWallet]  = useState<KeyPair | null>(null)
  const [copied,  setCopied]  = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('zcash_demo_wallet')
    if (stored) setWallet(JSON.parse(stored))
  }, [])

  async function generateWallet() {
    setLoading(true)
    const { generateKeyPair } = await import('@/lib/crypto')
    const kp = await generateKeyPair()
    localStorage.setItem('zcash_demo_wallet', JSON.stringify(kp))
    setWallet(kp)
    setLoading(false)
  }

  function copyAddress() {
    if (!wallet) return
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function deleteWallet() {
    localStorage.removeItem('zcash_demo_wallet')
    setWallet(null)
  }

  // ── Not generated yet ─────────────────────────────────────────
  if (!wallet) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">🔑</div>
        <p className="text-zinc-400 text-sm">
          Click below to generate a demo Zcash keypair.
          <br />
          <span className="text-zinc-600">Takes less than a second.</span>
        </p>
        <button
          onClick={generateWallet}
          disabled={loading}
          className="w-full py-3.5 bg-[#F4B728] hover:bg-[#e0a820] disabled:opacity-60
                     text-black font-bold rounded-xl transition text-base"
        >
          {loading ? 'Generating...' : 'Generate wallet'}
        </button>
      </div>
    )
  }

  // ── Wallet exists ─────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-green-900/30 rounded-2xl p-6 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Wallet ready</span>
          </div>
          <button
            onClick={deleteWallet}
            className="text-xs text-zinc-600 hover:text-red-400 transition"
          >
            Reset
          </button>
        </div>

        {/* Address */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Your shielded address</p>
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3">
            <code className="text-[#F4B728] text-xs break-all flex-1 font-mono">{wallet.address}</code>
            <button onClick={copyAddress} className="text-zinc-500 hover:text-white text-xs shrink-0 transition">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* DID */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Your W3C DID</p>
          <code className="text-zinc-400 text-xs break-all block bg-zinc-800/50 rounded-lg p-3 font-mono">
            did:zcash:mainnet:{wallet.address}
          </code>
        </div>

        {/* What this means */}
        <div className="flex items-start gap-2 bg-zinc-800/30 rounded-lg p-3">
          <span className="text-zinc-500 text-xs mt-px">ℹ</span>
          <p className="text-zinc-500 text-xs leading-relaxed">
            This keypair lives only in your browser.
            In production, it would be inside <strong className="text-zinc-400">Zashi</strong> or
            a hardware wallet.
          </p>
        </div>
      </div>

      {/* Next step CTA */}
      <a
        href="/login"
        className="block w-full py-3.5 bg-[#F4B728] hover:bg-[#e0a820]
                   text-black font-bold rounded-xl transition text-center text-base"
      >
        Next: Sign in with this wallet →
      </a>
    </div>
  )
}
