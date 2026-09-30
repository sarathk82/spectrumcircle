import { describe, expect, it } from 'vitest'
import {
  getVisibleNavigationItems,
  isNavigationItemActive,
} from './navigation'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/forums', label: 'Forums' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/messages', label: 'Messages' },
]

describe('navigation visibility', () => {
  it('shows only public sections to logged-out visitors', () => {
    expect(getVisibleNavigationItems(navigationItems, false)).toEqual([
      { href: '/forums', label: 'Forums' },
      { href: '/jobs', label: 'Jobs' },
    ])
  })

  it('shows private and public sections to authenticated users', () => {
    expect(getVisibleNavigationItems(navigationItems, true)).toEqual(navigationItems)
  })
})

describe('navigation active state', () => {
  it('matches nested pages but does not mark dashboard for unrelated paths', () => {
    expect(isNavigationItemActive('/forums/autism-parenting', '/forums')).toBe(true)
    expect(isNavigationItemActive('/dashboard/settings', '/dashboard')).toBe(false)
    expect(isNavigationItemActive('/jobs', '/jobs')).toBe(true)
  })
})