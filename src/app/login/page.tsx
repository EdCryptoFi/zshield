import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ZcashLoginButton from '@/components/ZcashLoginButton'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">

        {/* ── Stepper ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs">
          <StepDone n={1} label="Wallet" />
          <Connector done />
          <StepActive n={2} label="Sign in" />
          <Connector />
          <StepPending n={3} label="Dashboard" />
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div>
          <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs transition">
            ← Back
          </Link>
          <h1 className="text-3xl font-black text-[#F4B728] mt-2">
            Step 2: Prove ownership
          </h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            Click below and watch the protocol in action.
            Your wallet will sign a challenge to prove you own the address — no data leaves your browser except the signature.
          </p>
        </div>

        {/* ── Login button (with live protocol steps) ─────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <ZcashLoginButton />
        </div>

        {/* ── What happens ────────────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5 space-y-3">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Protocol flow</h3>
          <div className="space-y-1.5">
            {flowSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-zinc-700 text-xs font-mono mt-0.5">{i + 1}.</span>
                <div>
                  <p className="text-zinc-400 text-sm">{s.label}</p>
                  <p className="text-zinc-600 text-xs">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}

function StepDone({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white font-bold">
        &#10003;
      </div>
      <span className="text-green-400 font-medium">{label}</span>
    </div>
  )
}

function StepActive({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-[#F4B728] flex items-center justify-center text-[10px] text-black font-bold">
        {n}
      </div>
      <span className="text-white font-medium">{label}</span>
    </div>
  )
}

function StepPending({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500
                      flex items-center justify-center text-[10px] font-bold">
        {n}
      </div>
      <span className="text-zinc-600">{label}</span>
    </div>
  )
}

function Connector({ done }: { done?: boolean }) {
  return <div className={`flex-1 h-px min-w-4 ${done ? 'bg-green-800' : 'bg-zinc-800'}`} />
}

const flowSteps = [
  { label: 'Server sends a random nonce',        detail: 'Anti-replay: each challenge is unique and expires in 5 min' },
  { label: 'Wallet signs it with your private key', detail: 'ZIP 304 signature — your key never leaves the browser' },
  { label: 'Server verifies the signature',       detail: 'Proves you own the address without seeing your private key' },
  { label: 'JWT + DID + OIDC token issued',        detail: 'Standard tokens any app can verify — your identity, portable' },
]
