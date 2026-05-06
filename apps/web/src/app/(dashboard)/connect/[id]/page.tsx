import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  formatRelativeTime,
  getInitials,
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
  OPPORTUNITY_TYPE_LABELS,
  JOB_TYPE_LABELS,
} from '@spectrumcircle/shared'
import type { UserRole, OpportunityType, JobType, Connection, JobPosting, BusinessOpportunity, ForumPost } from '@spectrumcircle/shared'
import {
  MapPin,
  Globe,
  ChevronLeft,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import ConnectButton from '@/components/connect/ConnectButton'

export default async function MemberProfilePage({
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
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select(
      'id, display_name, bio, location, avatar_url, role, website_url, tags, privacy_level, created_at'
    )
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Enforce privacy: private profiles are only visible to self
  if (
    profile.privacy_level === 'private' &&
    user?.id !== id
  ) {
    notFound()
  }

  // members_only: must be logged in
  if (profile.privacy_level === 'members_only' && !user) {
    notFound()
  }

  const role = profile.role as UserRole
  const roleColor = USER_ROLE_COLORS[role]
  const roleLabel = USER_ROLE_LABELS[role]
  const tags: string[] = Array.isArray(profile.tags) ? profile.tags : []
  const isOwnProfile = user?.id === id

  // Fetch connection status between current user and this profile
  let connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' = 'none'
  let connectionId: string | undefined

  if (user && !isOwnProfile) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conn } = (await (supabase as any)
      .from('connections')
      .select('id, status, requester_id, recipient_id')
      .or(
        `and(requester_id.eq.${user.id},recipient_id.eq.${id}),and(requester_id.eq.${id},recipient_id.eq.${user.id})`
      )
      .neq('status', 'declined')
      .maybeSingle()) as { data: Pick<Connection, 'id' | 'status' | 'requester_id' | 'recipient_id'> | null }

    if (conn) {
      connectionId = conn.id
      if (conn.status === 'accepted') connectionStatus = 'accepted'
      else if (conn.requester_id === user.id) connectionStatus = 'pending_sent'
      else connectionStatus = 'pending_received'
    }
  }

  // Fetch recent job postings if employer/entrepreneur
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobs } = (role === 'employer' || role === 'entrepreneur'
    ? await (supabase as any)
        .from('job_postings')
        .select('id, title, company_name, job_type, is_remote, status, created_at')
        .eq('employer_id', id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: null }) as { data: Pick<JobPosting, 'id' | 'title' | 'company_name' | 'job_type' | 'is_remote' | 'status' | 'created_at'>[] | null }

  // Fetch recent business opportunities if entrepreneur
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: opportunities } = (role === 'entrepreneur'
    ? await (supabase as any)
        .from('business_opportunities')
        .select('id, title, opportunity_type, status, created_at')
        .eq('owner_id', id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: null }) as { data: Pick<BusinessOpportunity, 'id' | 'title' | 'opportunity_type' | 'status' | 'created_at'>[] | null }

  // Fetch recent forum posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: posts } = (await (supabase as any)
    .from('forum_posts')
    .select('id, title, reply_count, created_at, category_id, forum_categories(slug)')
    .eq('author_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(3)) as { data: (Pick<ForumPost, 'id' | 'title' | 'reply_count' | 'created_at' | 'category_id'> & { forum_categories: { slug: string } | null })[] | null }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted">
        <Link
          href="/connect"
          className="hover:text-text transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Connect
        </Link>
      </nav>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-7">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden"
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold font-nunito text-text">
                  {profile.display_name}
                </h1>
                <span
                  className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: roleColor }}
                >
                  {roleLabel}
                </span>
              </div>
              {isOwnProfile ? (
                <Link
                  href="/profile"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors flex-shrink-0"
                >
                  Edit profile
                </Link>
              ) : user ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ConnectButton
                    targetUserId={id}
                    initialStatus={connectionStatus}
                    connectionId={connectionId}
                  />
                  {connectionStatus === 'accepted' && (
                    <Link
                      href={`/messages/${id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-text hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle size={15} aria-hidden="true" />
                      Message
                    </Link>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-muted">
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} aria-hidden="true" />
                  {profile.location}
                </span>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
                >
                  <Globe size={13} aria-hidden="true" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} aria-hidden="true" />
                Joined {formatRelativeTime(profile.created_at)}
              </span>
            </div>

            {profile.bio && (
              <p className="mt-4 text-text-muted text-sm leading-relaxed">{profile.bio}</p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open job postings */}
      {jobs && jobs.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-text mb-3 flex items-center gap-2">
            <Briefcase size={16} className="text-yellow-600" aria-hidden="true" />
            Open positions
          </h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5"
              >
                <p className="font-semibold text-text font-nunito">{job.title}</p>
                <p className="text-sm text-text-muted mt-0.5">
                  {job.company_name} ·{' '}
                  {JOB_TYPE_LABELS[job.job_type as JobType]} ·{' '}
                  {job.is_remote ? 'Remote' : 'On-site'}
                </p>
                <p className="text-xs text-text-light mt-1">{formatRelativeTime(job.created_at)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Business opportunities */}
      {opportunities && opportunities.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-text mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" aria-hidden="true" />
            Business opportunities
          </h2>
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/business/${opp.id}`}
                className="block bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5"
              >
                <p className="font-semibold text-text font-nunito">{opp.title}</p>
                <p className="text-sm text-text-muted mt-0.5">
                  {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type as OpportunityType]}
                </p>
                <p className="text-xs text-text-light mt-1">{formatRelativeTime(opp.created_at)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent forum posts */}
      {posts && posts.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-text mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-primary-500" aria-hidden="true" />
            Recent forum posts
          </h2>
          <div className="space-y-3">
            {posts.map((post) => {
              const category = Array.isArray(post.forum_categories)
                ? post.forum_categories[0]
                : post.forum_categories
              return (
                <Link
                  key={post.id}
                  href={`/forums/${category?.slug ?? 'general'}/${post.id}`}
                  className="block bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5"
                >
                  <p className="font-semibold text-text font-nunito">{post.title}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                    <span>{post.reply_count} replies</span>
                    <span>{formatRelativeTime(post.created_at)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

