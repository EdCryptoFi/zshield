'use client'

import { signOut } from 'next-auth/react'
// next-auth v5 react client

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm text-zinc-500 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg transition"
    >
      Sign out
    </button>
  )
}
