import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white px-6 py-6 text-sm text-text-muted">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Spectrum Circle. Built with care for the autism community.</span>
        <nav className="flex items-center gap-5" aria-label="Legal and transparency links">
          <Link href="/transparency" className="hover:text-text transition-colors">Transparency</Link>
          <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
