import type { Metadata } from 'next'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'

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

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-text-muted">
        <p>
          By joining, you agree to our{' '}
          <Link href="/terms" className="text-primary-500 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-500 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}
