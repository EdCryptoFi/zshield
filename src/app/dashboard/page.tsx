import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { didFromAddress, resolveDID } from '@/lib/did'
import SignOutButton from '@/components/SignOutButton'

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) redirect('/')

  const address = session.user.name ?? ''
  const did     = didFromAddress(address)
  const doc     = resolveDID(did)

  return (
    <main className="min-h-screen bg-zinc-950 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Stepper (step 3 active) ─────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs">
          <StepDone n={1} label="Wallet" />
          <Connector done />
          <StepDone n={2} label="Signed" />
          <Connector done />
          <StepActive n={3} label="Dashboard" />
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#F4B728]">You&apos;re in.</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Authenticated with zero personal data.
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* ── Identity card ───────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Session active</span>
          </div>

          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Zcash Address</p>
            <code className="text-[#F4B728] text-sm break-all font-mono">{address}</code>
          </div>

          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">W3C DID</p>
            <code className="text-zinc-300 text-sm break-all font-mono">{did}</code>
          </div>
        </div>

        {/* ── What was proven vs what stays private ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proven */}
          <div className="bg-green-950/20 border border-green-900/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">Proven</span>
            </div>
            <div className="space-y-2">
              {provenClaims.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-green-400 text-xs mt-0.5">&#10003;</span>
                  <div>
                    <p className="text-white text-sm font-medium">{c.label}</p>
                    <p className="text-zinc-500 text-xs">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Private */}
          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Hidden</span>
            </div>
            <div className="space-y-2">
              {hiddenItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-zinc-700 text-xs mt-0.5">&#10007;</span>
                  <p className="text-zinc-600 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DID Document (collapsible feel) ─────────────────────── */}
        <details className="bg-zinc-900 border border-zinc-800 rounded-2xl">
          <summary className="p-5 cursor-pointer text-white font-semibold text-sm hover:text-[#F4B728] transition select-none">
            DID Document (W3C standard)
          </summary>
          <div className="px-5 pb-5">
            <pre className="text-xs text-zinc-400 overflow-auto bg-zinc-950 rounded-lg p-4 max-h-64 font-mono">
              {JSON.stringify(doc, null, 2)}
            </pre>
          </div>
        </details>

        {/* ── OIDC Integration ────────────────────────────────────── */}
        <details className="bg-zinc-900 border border-zinc-800 rounded-2xl">
          <summary className="p-5 cursor-pointer text-white font-semibold text-sm hover:text-[#F4B728] transition select-none">
            OIDC Endpoints (for developers)
          </summary>
          <div className="px-5 pb-5 space-y-3">
            <p className="text-zinc-500 text-xs">
              Any OAuth2 / OIDC-compatible app can verify this identity.
              Point your client at the discovery endpoint:
            </p>
            <div className="space-y-1.5">
              {endpoints.map(([label, path]) => (
                <div key={path} className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-600 w-20 shrink-0">{label}</span>
                  <code className="text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded font-mono text-[11px]">{path}</code>
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* ── What happened behind the scenes ─────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5 space-y-3">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">What just happened</h3>
          <div className="space-y-2">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-900/50 border border-green-800/50 text-green-400
                                flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-zinc-300 text-sm">{t.step}</p>
                  <p className="text-zinc-600 text-xs">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────
function StepDone({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white font-bold">
        &#10003;
      </div>
      <span className="text-green-400 font-medium">{label}</span>
    </div>
  )
}

function StepActive({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="w-6 h-6 rounded-full bg-[#F4B728] flex items-center justify-center text-[10px] text-black font-bold">
        {n}
      </div>
      <span className="text-white font-medium">{label}</span>
    </div>
  )
}

function Connector({ done }: { done?: boolean }) {
  return <div className={`flex-1 h-px min-w-4 ${done ? 'bg-green-800' : 'bg-zinc-800'}`} />
}

// ── Data ────────────────────────────────────────────────────────────────
const provenClaims = [
  { label: 'Address ownership',  desc: 'You proved you control this Zcash address via signature' },
  { label: 'ZEC holder',         desc: 'You hold ZEC — without revealing your balance' },
  { label: 'Active user',        desc: 'You transacted recently on the Zcash network' },
]

const hiddenItems = [
  'Your real name or identity',
  'How much ZEC you hold',
  'Your transaction history',
  'Your email, phone, or IP',
]

const endpoints = [
  ['Discovery', '/.well-known/openid-configuration'],
  ['Authorize', '/api/oidc/authorize'],
  ['Token',     '/api/oidc/token'],
  ['Userinfo',  '/api/oidc/userinfo'],
  ['JWKS',      '/api/oidc/jwks'],
]

const timeline = [
  { step: 'Wallet signed a random challenge',        detail: 'Server sent a nonce → wallet signed it with your private key → server verified the signature' },
  { step: 'DID created from your address',            detail: 'did:zcash:mainnet:your_address → resolves to a W3C DID Document with your public key' },
  { step: 'ZK claims resolved',                       detail: 'Proved you hold ZEC and are an active user — balance stays private' },
  { step: 'OIDC token issued',                        detail: 'A standard JWT signed with EdDSA — any OAuth2-compatible app can verify it via JWKS' },
]
