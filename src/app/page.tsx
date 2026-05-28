import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ZShieldHero from '@/components/zshield/ZShieldHero'

export default async function Home() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return <ZShieldHero />
}
