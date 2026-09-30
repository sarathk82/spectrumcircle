import type { Metadata } from 'next'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar profile={null} />

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md animate-slide-up">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
