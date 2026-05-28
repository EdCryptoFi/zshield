import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"
import CookieBanner from "@/components/CookieBanner"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal","italic"],
})

const BASE_URL = 'https://zshield.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ZShield — Sign in with Zcash',
    template: '%s | ZShield',
  },
  description: 'Privacy-first identity for the web. Authenticate with your Zcash address via W3C DID + OIDC — no password, no email, no KYC.',
  keywords: ['Zcash', 'ZK login', 'privacy', 'W3C DID', 'OIDC', 'sign in with Zcash', 'zero-knowledge', 'Web3 identity', 'shielded identity'],
  authors: [{ name: 'Ed', url: 'https://x.com/EdCriptoFi' }],
  creator: 'Ed (@EdCriptoFi)',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'ZShield',
    title: 'ZShield — Sign in with Zcash',
    description: 'Prove who you are. Reveal nothing else. Zcash-powered OIDC identity with W3C DID and ZK claims.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZShield — Sign in with Zcash',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZShield — Sign in with Zcash',
    description: 'Prove who you are. Reveal nothing else. Zcash-powered OIDC identity.',
    creator: '@EdCriptoFi',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
