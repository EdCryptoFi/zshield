'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('zshield-cookie-ok')) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('zshield-cookie-ok', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 48, right: 20, zIndex: 200,
      maxWidth: 380, padding: '14px 18px',
      background: 'rgba(8,6,2,0.96)',
      border: '1px solid rgba(244,183,40,0.3)',
      backdropFilter: 'blur(12px)',
      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--ink-mute)', lineHeight: 1.65,
        margin: '0 0 12px',
        letterSpacing: '0.08em',
      }}>
        <span style={{ color: 'var(--gold)' }}>🔒 Cookies</span>
        {' '}— We use only essential session cookies for authentication (HttpOnly, Secure).
        No tracking. No analytics. No third-party data sharing.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <a
          href="/cookies"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--gold)', letterSpacing: '0.14em',
            textTransform: 'uppercase', textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          policy
        </a>
        <button
          onClick={dismiss}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            padding: '5px 14px',
            background: 'linear-gradient(180deg, var(--gold), var(--gold-deep))',
            color: '#0a0700', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            border: 'none', cursor: 'pointer',
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}
