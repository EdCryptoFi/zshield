import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"

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

export const metadata: Metadata = {
  title: "ZShield — Zcash Identity Provider",
  description: "Sign in with your Zcash address. No password. No email. No KYC. W3C DID + OIDC bridge for shielded identity.",
  openGraph: {
    title: "ZShield — Zcash Identity Provider",
    description: "Authenticate with your Zcash address via W3C DID and OIDC. Privacy-first identity.",
    type: "website",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
