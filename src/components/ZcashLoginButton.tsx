'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

type Step = 'idle' | 'wallet' | 'challenge' | 'signing' | 'verifying' | 'done' | 'error'

const STEPS: { key: Step; label: string; detail: string }[] = [
  { key: 'wallet',    label: 'Reading wallet',       detail: 'Loading your keypair from browser storage' },
  { key: 'challenge', label: 'Requesting challenge',  detail: 'Server sends a random nonce to prevent replay' },
  { key: 'signing',   label: 'Signing challenge',     detail: 'Your wallet signs the nonce with your private key' },
  { key: 'verifying', label: 'Verifying signature',   detail: 'Server verifies you own this address → issues JWT' },
  { key: 'done',      label: 'Authenticated!',        detail: 'DID created, OIDC token issued, redirecting…' },
]

export default function ZcashLoginButton() {
  const [step,  setStep]  = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setStep('wallet')
    setError(null)

    try {
      // 1. Read wallet
      const stored = localStorage.getItem('zcash_demo_wallet')
      if (!stored) {
        setError('No wallet found. Generate one on the Wallet page first.')
        setStep('error')
        return
      }
      const wallet = JSON.parse(stored)

      // 2. Request challenge
      setStep('challenge')
      const challengeRes = await fetch('/api/challenge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ address: wallet.address }),
      })
      const { nonce, message } = await challengeRes.json()

      // 3. Sign
      setStep('signing')
      const { signZip304Message } = await import('@/lib/crypto')
      const signature = await signZip304Message(message, wallet.privateKey)

      // 4. Verify
      setStep('verifying')
      const result = await signIn('zcash', {
        nonce,
        signature: JSON.stringify(signature),
        address:   wallet.address,
        redirect:  false,
      })

      if (result?.ok) {
        setStep('done')
        setTimeout(() => { window.location.href = '/dashboard' }, 600)
      } else {
        setError('Signature verification failed.')
        setStep('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('error')
    }
  }

  const isRunning = !['idle', 'error'].includes(step)
  const currentIdx = STEPS.findIndex(s => s.key === step)

  return (
    <div className="w-full space-y-4">
      {/* ── Main button ──────────────────────────────────────────── */}
      {step === 'idle' || step === 'error' ? (
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4
                     bg-[#F4B728] hover:bg-[#e0a820] text-black font-bold
                     rounded-2xl transition-all duration-200 shadow-lg
                     shadow-yellow-500/20 text-lg"
        >
          <ZcashIcon />
          Sign in with Zcash
        </button>
      ) : null}

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => { setStep('idle'); setError(null) }}
            className="text-red-500 hover:text-red-300 text-xs mt-1 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Live protocol steps ──────────────────────────────────── */}
      {isRunning && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">
            Protocol in action
          </p>
          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const isDone    = i < currentIdx
              const isCurrent = i === currentIdx
              const isPending = i > currentIdx

              return (
                <div key={s.key} className="flex items-start gap-3">
                  {/* Status indicator */}
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">&#10003;</span>
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#F4B728] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#F4B728] animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700" />
                    )}
                  </div>

                  {/* Text */}
                  <div className={isPending ? 'opacity-30' : ''}>
                    <p className={`text-sm font-medium ${
                      isDone ? 'text-green-400' : isCurrent ? 'text-white' : 'text-zinc-500'
                    }`}>
                      {s.label}
                    </p>
                    {(isCurrent || isDone) && (
                      <p className="text-zinc-500 text-xs">{s.detail}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Stepper hint ─────────────────────────────────────────── */}
      {step === 'idle' && (
        <p className="text-zinc-600 text-xs text-center">
          No wallet?{' '}
          <a href="/wallet" className="text-[#F4B728] hover:underline">
            Create one first →
          </a>
        </p>
      )}
    </div>
  )
}

function ZcashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#F4B728" />
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">Z</text>
    </svg>
  )
}
