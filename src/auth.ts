import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyZip304Signature, type Signature } from '@/lib/crypto'
import { consumeNonce } from '@/lib/store'
import { didFromAddress } from '@/lib/did'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id:   'zcash',
      name: 'Zcash',
      credentials: {
        nonce:     { label: 'Nonce',     type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        address:   { label: 'Address',   type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.nonce || !credentials?.signature || !credentials?.address) {
          return null
        }
        const signature: Signature = JSON.parse(credentials.signature as string)
        const entry = await consumeNonce(credentials.nonce as string)
        if (!entry) return null

        const valid = await verifyZip304Signature(entry.message, signature, credentials.address as string)
        if (!valid) return null

        const did = didFromAddress(credentials.address as string)
        return { id: did, name: credentials.address as string, email: did }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = user.name
        token.did     = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.name  = token.address as string
      session.user.email = token.did    as string
      return session
    },
  },
  pages: { signIn: '/login' },
  trustHost: true,
})
