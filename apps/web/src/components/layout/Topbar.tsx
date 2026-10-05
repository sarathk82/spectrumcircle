"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { SpectrumCircleLogo } from "@spectrumcircle/ui";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@spectrumcircle/shared";
import { USER_ROLE_LABELS, USER_ROLE_COLORS } from "@spectrumcircle/shared";
import type { UserRole } from "@spectrumcircle/shared";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getVisibleNavigationItems,
  isNavigationItemActive,
} from "./navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/forums", label: "Forums" },
  { href: "/jobs", label: "Jobs" },
  { href: "/tutors", label: "Tutors" },
  { href: "/connect", label: "Community" },
  { href: "/messages", label: "Messages" },
  { href: "/search", label: "Search" },
  { href: "/admin", label: "Admin" },
];

interface TopbarProps {
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    onboarded_at: string | null;
  } | null;
  unreadCount?: number;
}

export default function Topbar({ profile, unreadCount = 0 }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = profile?.role as UserRole | undefined;
  const roleColor = role ? USER_ROLE_COLORS[role] : "#5B4FCF";
  const roleLabel = role ? USER_ROLE_LABELS[role] : "Member";
  const visibleNavItems = getVisibleNavigationItems(
    NAV_ITEMS,
    !!profile,
  ).filter(({ href }) => href !== "/admin" || profile?.role === "admin");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 flex items-center gap-3 md:gap-5">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
      >
        {menuOpen ? (
          <X size={22} aria-hidden="true" />
        ) : (
          <Menu size={22} aria-hidden="true" />
        )}
      </button>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/"
          aria-label="Spectrum Circle home"
          className="flex items-center"
        >
          <SpectrumCircleLogo size={32} showWordmark />
        </Link>
      </div>

      <nav
        className="hidden md:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto"
        aria-label="Main navigation"
      >
        {visibleNavItems.map(({ href, label }) => {
          const active = isNavigationItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-primary-50 text-primary-600"
                  : "text-text-muted hover:bg-gray-50 hover:text-text",
              )}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        {profile && (
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={
              unreadCount > 0
                ? `Notifications — ${unreadCount} unread`
                : "Notifications"
            }
          >
            <Bell size={20} className="text-text-muted" aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
                aria-hidden="true"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* Profile */}
        {profile && (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity rounded-xl p-1.5 hover:bg-gray-50"
            >
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
                <span className="text-sm font-semibold text-text">
                  {profile.display_name}
                </span>
                <span className="text-xs mt-0.5" style={{ color: roleColor }}>
                  {roleLabel}
                </span>
              </div>
            </Link>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 text-xs text-text-muted hover:text-destructive px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
        {!profile && (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-text-muted hover:text-text transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Join free
            </Link>
          </>
        )}
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-3 flex flex-col gap-1"
        >
          {visibleNavItems.map(({ href, label }) => {
            const active = isNavigationItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-3 rounded-lg text-base font-medium transition-colors",
                  active
                    ? "bg-primary-50 text-primary-600"
                    : "text-text-muted hover:bg-gray-50 hover:text-text",
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
          {profile && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-text-muted hover:bg-red-50 hover:text-destructive text-left"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
