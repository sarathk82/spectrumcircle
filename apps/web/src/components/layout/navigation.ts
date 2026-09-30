export interface NavigationItem {
  href: string
  label: string
}

export const PUBLIC_NAVIGATION_HREFS = ['/forums', '/jobs', '/business', '/connect'] as const

export function isPublicNavigationHref(href: string) {
  return PUBLIC_NAVIGATION_HREFS.includes(href as (typeof PUBLIC_NAVIGATION_HREFS)[number])
}

export function getVisibleNavigationItems<T extends NavigationItem>(
  items: readonly T[],
  isAuthenticated: boolean,
) {
  return isAuthenticated ? items : items.filter(({ href }) => isPublicNavigationHref(href))
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
}