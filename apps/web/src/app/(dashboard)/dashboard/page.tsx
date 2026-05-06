import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, USER_ROLE_LABELS, USER_ROLE_COLORS } from '@spectrumcircle/shared'
import type { UserRole, Profile, JobPosting, ForumPost, ForumCategory } from '@spectrumcircle/shared'
import { Users, Briefcase, MessageCircle, TrendingUp, ArrowRight, Bell, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  type RecentPost = Pick<ForumPost, 'id' | 'title' | 'created_at' | 'category_id'> & {
    forum_categories: Pick<ForumCategory, 'name' | 'color' | 'slug'> | null
  }
  type RecentJob = Pick<JobPosting, 'id' | 'title' | 'company_name' | 'location' | 'is_remote' | 'job_type'>

  const [
    { data: profile },
    { data: recentPosts },
    { data: recentJobs },
    { count: connectionCount },
    { count: applicationCount },
    { count: myPostCount },
    { count: unreadCount },
  ] = await Promise.all([
    sb.from('profiles').select('id, display_name, role, bio, location, avatar_url').eq('id', user.id).single() as Promise<{ data: Pick<Profile, 'id' | 'display_name' | 'role' | 'bio' | 'location' | 'avatar_url'> | null }>,
    sb.from('forum_posts').select('id, title, created_at, category_id, forum_categories(name, color, slug)').is('deleted_at', null).order('created_at', { ascending: false }).limit(5) as Promise<{ data: RecentPost[] | null }>,
    sb.from('job_postings').select('id, title, company_name, location, is_remote, job_type').eq('status', 'open').order('created_at', { ascending: false }).limit(4) as Promise<{ data: RecentJob[] | null }>,
    supabase.from('connections').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
    supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('applicant_id', user.id),
    supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id).is('deleted_at', null),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
  ])

  const role = profile?.role as UserRole | undefined
  const roleColor = role ? USER_ROLE_COLORS[role] : '#5B4FCF'
  const roleLabel = role ? USER_ROLE_LABELS[role] : 'Member'

  const QUICK_LINKS = [
    { href: '/connect',  label: 'Find Connections', icon: Users,         color: '#FF5A5A' },
    { href: '/jobs',     label: 'Browse Jobs',       icon: Briefcase,     color: '#E0A800' },
    { href: '/business', label: 'Opportunities',     icon: TrendingUp,    color: '#4CAF7D' },
    { href: '/forums',   label: 'Forums',            icon: MessageCircle, color: '#9B59B6' },
  ]

  const STATS = [
    { label: 'Connections', value: connectionCount ?? 0, icon: Users,         color: '#FF5A5A', href: '/connect' },
    { label: 'Applications', value: applicationCount ?? 0, icon: Briefcase,   color: '#E0A800', href: '/jobs' },
    { label: 'My Posts',    value: myPostCount ?? 0,    icon: MessageCircle,  color: '#9B59B6', href: '/forums' },
    { label: 'Unread',      value: unreadCount ?? 0,    icon: Bell,           color: '#4BADE8', href: '/notifications' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div
        className="rounded-3xl p-7 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${roleColor}CC 0%, ${roleColor} 100%)`,
        }}
      >
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium opacity-80 mb-1">{roleLabel}</p>
          <h1 className="text-2xl md:text-3xl font-bold font-nunito mb-2">
            Welcome back, {profile?.display_name ?? 'friend'} 👋
          </h1>
          <p className="opacity-80 text-sm">
            Here&apos;s what&apos;s happening in your community today.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <Users size={14} aria-hidden="true" /> Find people
            </Link>
            <Link
              href="/forums/general/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <Plus size={14} aria-hidden="true" /> Start a discussion
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Your stats">
        {STATS.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="stat-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ backgroundColor: `${color}18` }}
              aria-hidden="true"
            >
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold font-nunito text-text">{value}</p>
            <p className="text-xs text-text-muted font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <section aria-label="Quick navigation">
        <h2 className="text-lg font-bold font-nunito text-text mb-4">Explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all group"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={22} style={{ color }} aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-text text-center font-nunito">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent forum activity */}
        <section aria-label="Recent discussions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-nunito text-text">Recent Discussions</h2>
            <Link href="/forums" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
            {recentPosts && recentPosts.length > 0 ? (
              recentPosts.map((post) => {
                const cat = Array.isArray(post.forum_categories)
                  ? post.forum_categories[0]
                  : post.forum_categories
                return (
                  <Link
                    key={post.id}
                    href={`/forums/${cat?.slug ?? ''}/${post.id}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: cat?.color ?? '#5B4FCF' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{post.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {cat?.name} · {formatRelativeTime(post.created_at)}
                      </p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <p className="p-6 text-sm text-text-muted text-center">
                No discussions yet.{' '}
                <Link href="/forums" className="text-primary-500 hover:underline">
                  Start one
                </Link>
              </p>
            )}
          </div>
        </section>

        {/* Recent jobs */}
        <section aria-label="Latest job postings">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-nunito text-text">Latest Jobs</h2>
            <Link href="/jobs" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-yellow-600" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{job.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {job.company_name} · {job.is_remote ? 'Remote' : (job.location ?? 'On-site')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-6 text-sm text-text-muted text-center">
                No open jobs yet.{' '}
                <Link href="/jobs" className="text-primary-500 hover:underline">
                  Check the board
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
