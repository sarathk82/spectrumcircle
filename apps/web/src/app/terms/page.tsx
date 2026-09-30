import type { Metadata } from 'next'
import Topbar from '@/components/layout/Topbar'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar profile={null} />
      <main id="main-content" className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold font-nunito text-text">Terms of Service</h1>
        <p className="mt-3 text-text-muted">Last updated September 30, 2026</p>
        <div className="mt-8 space-y-6 text-text-muted leading-relaxed">
          <section><h2 className="text-xl font-bold text-text mb-2">Use of the service</h2><p>Spectrum Circle is a community platform. Use it respectfully, provide accurate information, and do not use it to harass, exploit, impersonate, or harm other members.</p></section>
          <section><h2 className="text-xl font-bold text-text mb-2">Community content</h2><p>You are responsible for content you post. Do not share private information about another person without permission. We may remove content that violates these terms or creates a safety risk.</p></section>
          <section><h2 className="text-xl font-bold text-text mb-2">Availability</h2><p>The service is provided as a community project and may change or become temporarily unavailable. We work to protect member data and maintain a safe, accessible experience.</p></section>
          <section><h2 className="text-xl font-bold text-text mb-2">Questions</h2><p>Questions about these terms can be directed to the Spectrum Circle administrators through the community support channel.</p></section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
