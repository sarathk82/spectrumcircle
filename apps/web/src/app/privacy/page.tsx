import type { Metadata } from 'next'
import Topbar from '@/components/layout/Topbar'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = { title: 'Privacy Statement' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar profile={null} />
      <main id="main-content" className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold font-nunito text-text">Privacy Statement</h1>
        <p className="mt-3 text-text-muted">Last updated September 30, 2026</p>
        <div className="mt-8 space-y-6 text-text-muted leading-relaxed">
          <section><h2 className="text-xl font-bold text-text mb-2">What we collect</h2><p>We collect the account, profile, and community content you choose to provide. We also collect limited technical information needed to keep the service secure and reliable.</p></section>
          <section><h2 className="text-xl font-bold text-text mb-2">How we use it</h2><p>We use information to provide community features, protect members, respond to support requests, and improve accessibility. We do not sell personal information.</p></section>
          <section><h2 className="text-xl font-bold text-text mb-2">Your choices</h2><p>You can edit your profile privacy settings, request access to your information, or ask us to delete your account. Public posts and profiles may remain visible to others until removed or anonymized where legally permitted.</p></section>
          <section><h2 className="text-xl font-bold text-text mb-2">Contact</h2><p>For privacy questions or requests, contact the Spectrum Circle administrators through the support channel provided by the community.</p></section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
