import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  OPPORTUNITY_TYPE_LABELS,
  formatRelativeTime,
  getInitials,
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
} from '@spectrumcircle/shared'
import type { BusinessOpportunity, OpportunityType, UserRole } from '@spectrumcircle/shared'
import { TrendingUp, MapPin, Globe, ChevronLeft, Eye } from 'lucide-react'

const TYPE_COLORS: Record<OpportunityType, string> = {
  partnership: '#4BADE8',
  investment: '#4CAF7D',
  mentorship: '#9B59B6',
  project: '#FF9A3C',
  other: '#6B7280',
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: opp } = (await (supabase as any)
    .from('business_opportunities')
    .select(
      'id, title, description, company_name, opportunity_type, location, is_remote, tags, status, view_count, created_at, owner_id, profiles(display_name, avatar_url, role, bio, location)'
    )
    .eq('id', id)
    .single()) as { data: BusinessOpportunity | null }

  if (!opp || opp.status === 'draft') notFound()

  // Increment view count (fire-and-forget)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(supabase as any)
    .from('business_opportunities')
    .update({ view_count: opp.view_count + 1 })
    .eq('id', id)
    .then(() => {})

  const owner = Array.isArray(opp.profiles) ? opp.profiles[0] : opp.profiles
  const ownerRole = owner?.role as UserRole | undefined
  const ownerRoleColor = ownerRole ? USER_ROLE_COLORS[ownerRole] : '#5B4FCF'
  const type = opp.opportunity_type as OpportunityType
  const typeColor = TYPE_COLORS[type] ?? '#5B4FCF'
  const typeLabel = OPPORTUNITY_TYPE_LABELS[type] ?? 'Other'
  const tags: string[] = Array.isArray(opp.tags) ? opp.tags : []
  const isOwner = user?.id === opp.owner_id

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted">
        <Link
          href="/business"
          className="hover:text-text transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Business Opportunities
        </Link>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-7">
        <div className="flex items-start gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${typeColor}18` }}
          >
            <TrendingUp size={26} style={{ color: typeColor }} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white mb-2"
                  style={{ backgroundColor: typeColor }}
                >
                  {typeLabel}
                </span>
                <h1 className="text-2xl font-bold font-nunito text-text">{opp.title}</h1>
                {opp.company_name && (
                  <p className="text-text-muted mt-1 font-medium">{opp.company_name}</p>
                )}
              </div>
              <span
                className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  opp.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {opp.status === 'open' ? 'Open' : opp.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
              {(opp.location || opp.is_remote) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} aria-hidden="true" />
                  {opp.is_remote ? 'Remote' : opp.location}
                  {opp.is_remote && opp.location && ` · ${opp.location}`}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye size={14} aria-hidden="true" />
                {opp.view_count} views
              </span>
              <span className="text-xs">{formatRelativeTime(opp.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-border shadow-card p-7">
            <h2 className="text-lg font-bold font-nunito text-text mb-4">About this opportunity</h2>
            <div className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
              {opp.description}
            </div>
          </section>

          {/* CTA */}
          {!isOwner && user && opp.status === 'open' && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-7">
              <h2 className="text-lg font-bold font-nunito text-text mb-2">Interested?</h2>
              <p className="text-text-muted text-sm mb-4">
                Connect with {owner?.display_name ?? 'the poster'} to learn more about this
                opportunity.
              </p>
              <Link
                href={`/connect/${opp.owner_id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                View profile &amp; connect
              </Link>
            </div>
          )}

          {!user && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-7 text-center">
              <p className="text-text-muted mb-4">Sign in to connect with this opportunity.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-text mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posted by */}
          {owner && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-text mb-3">Posted by</h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: ownerRoleColor }}
                  aria-hidden="true"
                >
                  {owner.avatar_url ? (
                    <img
                      src={owner.avatar_url}
                      alt={owner.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(owner.display_name ?? '?')
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/connect/${opp.owner_id}`}
                    className="font-semibold text-sm text-text hover:text-primary-600 transition-colors truncate block"
                  >
                    {owner.display_name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {ownerRole ? USER_ROLE_LABELS[ownerRole] : ''}
                  </p>
                  {owner.location && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Globe size={10} aria-hidden="true" />
                      {owner.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5 space-y-3 text-sm text-text-muted">
            <div className="flex justify-between">
              <span>Posted</span>
              <span className="text-text font-medium">{formatRelativeTime(opp.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span className="text-text font-medium">{typeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Setting</span>
              <span className="text-text font-medium">
                {opp.is_remote ? 'Remote' : 'In-person'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
