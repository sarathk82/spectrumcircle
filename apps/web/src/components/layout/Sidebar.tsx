'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SpectrumCircleLogo } from '@spectrumcircle/ui'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  MessageCircle,
  MessageSquare,
  Search,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/connect',   label: 'Connect',    icon: Users },
  { href: '/jobs',      label: 'Jobs',       icon: Briefcase },
  { href: '/business',  label: 'Business',   icon: TrendingUp },
  { href: '/forums',    label: 'Forums',     icon: MessageCircle },
  { href: '/messages',  label: 'Messages',   icon: MessageSquare },
]

const BOTTOM_ITEMS = [
  { href: '/search',  label: 'Search',     icon: Search },
  { href: '/profile', label: 'My Profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" aria-label="Spectrum Circle home">
          <SpectrumCircleLogo size={32} showWordmark />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Sidebar navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-text-muted hover:bg-gray-50 hover:text-text'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={18}
                className={active ? 'text-primary-500' : 'text-text-muted'}
                aria-hidden="true"
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer links */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-text-muted hover:bg-gray-50 hover:text-text'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={18}
                className={active ? 'text-primary-500' : 'text-text-muted'}
                aria-hidden="true"
              />
              {label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
