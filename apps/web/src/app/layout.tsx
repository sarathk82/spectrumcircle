import type { Metadata, Viewport } from 'next'
import { Nunito, Inter } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Spectrum Circle — Autism Community Platform',
    template: '%s | Spectrum Circle',
  },
  description:
    'Connect parents, volunteers, employers, and entrepreneurs in the autism community. Find support, jobs, business opportunities, and meaningful discussions.',
  keywords: ['autism', 'community', 'support', 'jobs', 'neurodivergent', 'spectrum'],
  openGraph: {
    title: 'Spectrum Circle — Autism Community Platform',
    description:
      'Where the autism community connects, grows, and thrives together.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#5B4FCF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
