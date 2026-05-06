'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, Briefcase, TrendingUp, MessageCircle, Search, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/connect',    label: 'Connect',    icon: Users },
  { href: '/jobs',       label: 'Jobs',       icon: Briefcase },
  { href: '/business',   label: 'Business',   icon: TrendingUp },
  { href: '/forums',     label: 'Forums',     icon: MessageCircle },
  { href: '/messages',   label: 'Messages',   icon: MessageSquare },
  { href: '/search',     label: 'Search',     icon: Search },
  { href: '/profile',    label: 'My Profile', icon: User },
]

export default function MobileNavDrawer() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl md:hidden transition-transform duration-300 ease-out flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-base font-bold font-nunito text-text">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-text-muted hover:bg-gray-50 hover:text-text'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-primary-500' : 'text-text-muted'}
                  aria-hidden="true"
                />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
