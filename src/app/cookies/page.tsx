import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'ZShield uses only essential session cookies. No tracking, no analytics.',
}

const ROWS = [
  { name: 'next-auth.session-token', purpose: 'Authentication session', type: 'Essential', duration: 'Session', thirdParty: 'No' },
  { name: '__Host-next-auth.csrf-token', purpose: 'CSRF protection', type: 'Essential', duration: 'Session', thirdParty: 'No' },
]

export default function CookiePage() {
  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 24px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ maxWidth: 760, width: '100%' }}>
        {/* Back */}
        <Link href="/" style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← back
        </Link>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold-bright)', letterSpacing: '-0.01em', marginBottom: 8 }}>
          Cookie Policy
        </h1>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 40 }}>
          Last updated: May 2026
        </p>

        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 14, color: 'var(--gold)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            Summary
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.8, marginBottom: 12 }}>
            ZShield is a privacy-first application. We use <strong style={{ color: 'var(--ink)' }}>only essential session cookies</strong> required for authentication to function. We do not use tracking cookies, advertising cookies, or analytics services.
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.8 }}>
            Your private keys are generated entirely in your browser and are never transmitted to our servers.
          </p>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 14, color: 'var(--gold)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            Cookies we use
          </h2>
          <div style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', background: 'rgba(244,183,40,0.05)', borderBottom: '1px solid var(--line)' }}>
              {['Cookie', 'Purpose', 'Type', 'Duration', '3rd Party'].map(h => (
                <span key={h} style={{ padding: '8px 12px', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {ROWS.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', borderBottom: i < ROWS.length - 1 ? '1px solid var(--line-soft)' : undefined }}>
                <code style={{ padding: '10px 12px', fontSize: 11, color: 'var(--gold-bright)' }}>{r.name}</code>
                <span style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-dim)' }}>{r.purpose}</span>
                <span style={{ padding: '10px 12px', fontSize: 11, color: 'var(--ok)' }}>{r.type}</span>
                <span style={{ padding: '10px 12px', fontSize: 11, color: 'var(--ink-mute)' }}>{r.duration}</span>
                <span style={{ padding: '10px 12px', fontSize: 11, color: 'var(--ink-mute)' }}>{r.thirdParty}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 14, color: 'var(--gold)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            What we do NOT collect
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {[
              'No advertising or tracking cookies',
              'No analytics (Google Analytics, Mixpanel, etc.)',
              'No social media tracking pixels',
              'No fingerprinting or device identification',
              'No sale or sharing of data with third parties',
              'No IP address logging in application code',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--ok)', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 14, color: 'var(--gold)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            Contact
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.8 }}>
            Questions about this policy? Reach out on{' '}
            <a href="https://x.com/EdCriptoFi" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
              X @EdCriptoFi
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
