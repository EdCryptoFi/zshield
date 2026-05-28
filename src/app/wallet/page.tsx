import DemoWallet from '@/components/DemoWallet'
import Link from 'next/link'

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-8">

        {/* ── Stepper ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs">
          <Step n={1} label="Create wallet" active />
          <Connector />
          <Step n={2} label="Sign in" />
          <Connector />
          <Step n={3} label="Dashboard" />
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div>
          <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs transition">
            ← Back
          </Link>
          <h1 className="text-3xl font-black text-[#F4B728] mt-2">
            Step 1: Create your wallet
          </h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            In production, you&apos;d use <strong className="text-zinc-300">Zashi</strong> or
            any ZIP 304 wallet. For this demo, we generate a keypair in your browser.
          </p>
        </div>

        {/* ── Wallet component ────────────────────────────────────── */}
        <DemoWallet />

        {/* ── What just happened ──────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm">What happens here</h3>
          <div className="space-y-2">
            {explanations.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[#F4B728]
                                flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-zinc-300 text-sm">{e.what}</p>
                  <p className="text-zinc-600 text-xs">{e.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Next step CTA ───────────────────────────────────────── */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#F4B728] hover:text-[#e0a820] text-sm font-semibold transition"
          >
            I have a wallet — take me to sign in →
          </Link>
        </div>

      </div>
    </main>
  )
}

function Step({ n, label, active }: { n: number; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
        ${active
          ? 'bg-[#F4B728] text-black'
          : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
        }`}>
        {n}
      </div>
      <span className={active ? 'text-white font-medium' : 'text-zinc-600'}>{label}</span>
    </div>
  )
}

function Connector() {
  return <div className="flex-1 h-px bg-zinc-800 min-w-4" />
}

const explanations = [
  {
    what: 'An Ed25519 keypair is generated in your browser',
    why:  'Same cryptographic family as Zcash\'s Jubjub curve — identical interface',
  },
  {
    what: 'The public key is encoded as a bech32m address (zauth1...)',
    why:  'Same format as real Zcash shielded addresses (zs1...) — just a different prefix for demo',
  },
  {
    what: 'A W3C DID is derived: did:zcash:mainnet:zauth1...',
    why:  'This DID is your portable identity — it resolves to a DID Document with your public key',
  },
  {
    what: 'The private key stays in your browser only',
    why:  'The server never sees it — just like a real Zcash wallet',
  },
]
