'use client'

import Link from 'next/link'
import { Bell, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { getInitials } from '@spectrumcircle/shared'
import { USER_ROLE_LABELS, USER_ROLE_COLORS } from '@spectrumcircle/shared'
import type { UserRole } from '@spectrumcircle/shared'
import MobileNavDrawer from './MobileNavDrawer'

interface TopbarProps {
  profile: {
    id: string
    display_name: string
    avatar_url: string | null
    role: string
    onboarded_at: string | null
  } | null
  unreadCount?: number
}

export default function Topbar({ profile, unreadCount = 0 }: TopbarProps) {
  const role = profile?.role as UserRole | undefined
  const roleColor = role ? USER_ROLE_COLORS[role] : '#5B4FCF'
  const roleLabel = role ? USER_ROLE_LABELS[role] : 'Member'

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      {/* Mobile menu */}
      <MobileNavDrawer />

      {/* Spacer for desktop (sidebar handles nav) */}
      <div className="hidden md:block flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label={unreadCount > 0 ? `Notifications — ${unreadCount} unread` : 'Notifications'}
        >
          <Bell size={20} className="text-text-muted" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        {profile && (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity rounded-xl p-1.5 hover:bg-gray-50">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold select-none overflow-hidden flex-shrink-0"
                style={{ backgroundColor: roleColor }}
                aria-hidden="true"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(profile.display_name)
                )}
              </div>
              <div className="hidden md:flex flex-col leading-none">
                <span className="text-sm font-semibold text-text">{profile.display_name}</span>
                <span className="text-xs mt-0.5" style={{ color: roleColor }}>
                  {roleLabel}
                </span>
              </div>
            </Link>

            {/* Sign out */}
            <form action={signOut}>
              <button
                type="submit"
                className="hidden md:flex items-center gap-1.5 text-xs text-text-muted hover:text-destructive px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={14} aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
