import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Briefcase, Users, MessageCircle, TrendingUp } from 'lucide-react'
import { USER_ROLE_LABELS, USER_ROLE_COLORS, getInitials, JOB_TYPE_LABELS } from '@spectrumcircle/shared'
import type { UserRole, JobType, JobPosting, Profile, ForumPost, ForumCategory, BusinessOpportunity } from '@spectrumcircle/shared'

type SearchJob = Pick<JobPosting, 'id' | 'title' | 'company_name' | 'location' | 'is_remote' | 'job_type'>
type SearchProfile = Pick<Profile, 'id' | 'display_name' | 'bio' | 'role' | 'avatar_url'>
type SearchPost = Pick<ForumPost, 'id' | 'title' | 'content' | 'category_id'> & { forum_categories: Pick<ForumCategory, 'name' | 'slug' | 'color'> | null }
type SearchBusiness = Pick<BusinessOpportunity, 'id' | 'title' | 'description' | 'opportunity_type'>

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? '').trim().slice(0, 100)
  const tab = params.tab ?? 'all'

  const supabase = await createClient()

  const hasQuery = query.length >= 2
  const likeQuery = `%${query}%`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [jobsResult, profilesResult, postsResult, businessResult] = hasQuery
    ? await Promise.all([
        sb.from('job_postings').select('id, title, company_name, location, is_remote, job_type').eq('status', 'open').or(`title.ilike.${likeQuery},company_name.ilike.${likeQuery},description.ilike.${likeQuery}`).limit(10) as Promise<{ data: SearchJob[] | null }>,
        sb.from('profiles').select('id, display_name, bio, role, avatar_url').in('privacy_level', ['public', 'members_only']).or(`display_name.ilike.${likeQuery},bio.ilike.${likeQuery}`).limit(10) as Promise<{ data: SearchProfile[] | null }>,
        sb.from('forum_posts').select('id, title, content, category_id, forum_categories(name, slug, color)').is('deleted_at', null).or(`title.ilike.${likeQuery},content.ilike.${likeQuery}`).limit(10) as Promise<{ data: SearchPost[] | null }>,
        sb.from('business_opportunities').select('id, title, description, opportunity_type').eq('status', 'open').or(`title.ilike.${likeQuery},description.ilike.${likeQuery}`).limit(10) as Promise<{ data: SearchBusiness[] | null }>,
      ])
    : [{ data: [] as SearchJob[] }, { data: [] as SearchProfile[] }, { data: [] as SearchPost[] }, { data: [] as SearchBusiness[] }]

  const jobs = jobsResult.data ?? []
  const profiles = profilesResult.data ?? []
  const posts = postsResult.data ?? []
  const business = businessResult.data ?? []

  const totalResults = jobs.length + profiles.length + posts.length + business.length

  const TABS = [
    { id: 'all',      label: 'All',        count: totalResults,    icon: Search },
    { id: 'people',   label: 'People',     count: profiles.length, icon: Users },
    { id: 'jobs',     label: 'Jobs',       count: jobs.length,     icon: Briefcase },
    { id: 'forums',   label: 'Forums',     count: posts.length,    icon: MessageCircle },
    { id: 'business', label: 'Business',   count: business.length, icon: TrendingUp },
  ]

  const showPeople   = tab === 'all' || tab === 'people'
  const showJobs     = tab === 'all' || tab === 'jobs'
  const showForums   = tab === 'all' || tab === 'forums'
  const showBusiness = tab === 'all' || tab === 'business'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-nunito text-text mb-5">Search</h1>
        {/* Search form */}
        <form method="GET" action="/search" className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search people, jobs, forums, opportunities…"
              className="w-full pl-11 pr-4 py-3 border border-border rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white text-text"
              aria-label="Search query"
              autoFocus
              maxLength={100}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {hasQuery && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 flex-wrap" role="tablist" aria-label="Search result categories">
            {TABS.map(({ id, label, count, icon: Icon }) => {
              const isActive = tab === id
              const href = `/search?q=${encodeURIComponent(query)}&tab=${id}`
              return (
                <Link
                  key={id}
                  href={href}
                  role="tab"
                  aria-selected={isActive}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-border text-text-muted hover:text-text hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100 text-text-muted'}`}>
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {totalResults === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-text-muted mt-1">Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* People */}
              {showPeople && profiles.length > 0 && (
                <section aria-label="People results">
                  <h2 className="text-base font-bold font-nunito text-text mb-3 flex items-center gap-2">
                    <Users size={16} aria-hidden="true" className="text-primary-500" />
                    People
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profiles.map((profile) => {
                      const role = profile.role as UserRole
                      const roleColor = USER_ROLE_COLORS[role]
                      return (
                        <Link
                          key={profile.id}
                          href={`/connect/${profile.id}`}
                          className="flex items-center gap-3 bg-white rounded-2xl border border-border p-4 hover:shadow-card hover:-translate-y-0.5 transition-all"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: roleColor }}
                            aria-hidden="true"
                          >
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(profile.display_name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-text truncate">{profile.display_name}</p>
                            <p className="text-xs" style={{ color: roleColor }}>
                              {USER_ROLE_LABELS[role]}
                            </p>
                            {profile.bio && (
                              <p className="text-xs text-text-muted mt-0.5 truncate">{profile.bio}</p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Jobs */}
              {showJobs && jobs.length > 0 && (
                <section aria-label="Job results">
                  <h2 className="text-base font-bold font-nunito text-text mb-3 flex items-center gap-2">
                    <Briefcase size={16} aria-hidden="true" className="text-yellow-600" />
                    Jobs
                  </h2>
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block bg-white rounded-2xl border border-border p-5 hover:shadow-card hover:-translate-y-0.5 transition-all"
                      >
                        <p className="font-semibold text-text font-nunito">{job.title}</p>
                        <p className="text-sm text-text-muted mt-0.5">
                          {job.company_name} · {JOB_TYPE_LABELS[job.job_type as JobType]} · {job.is_remote ? 'Remote' : (job.location ?? 'On-site')}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Forums */}
              {showForums && posts.length > 0 && (
                <section aria-label="Forum results">
                  <h2 className="text-base font-bold font-nunito text-text mb-3 flex items-center gap-2">
                    <MessageCircle size={16} aria-hidden="true" className="text-purple-600" />
                    Discussions
                  </h2>
                  <div className="space-y-3">
                    {posts.map((post) => {
                      const cat = Array.isArray(post.forum_categories) ? post.forum_categories[0] : post.forum_categories
                      return (
                        <Link
                          key={post.id}
                          href={`/forums/${cat?.slug ?? 'general'}/${post.id}`}
                          className="block bg-white rounded-2xl border border-border p-5 hover:shadow-card hover:-translate-y-0.5 transition-all"
                        >
                          <p className="font-semibold text-text font-nunito">{post.title}</p>
                          {cat && (
                            <span
                              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                              style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Business */}
              {showBusiness && business.length > 0 && (
                <section aria-label="Business opportunity results">
                  <h2 className="text-base font-bold font-nunito text-text mb-3 flex items-center gap-2">
                    <TrendingUp size={16} aria-hidden="true" className="text-green-600" />
                    Business Opportunities
                  </h2>
                  <div className="space-y-3">
                    {business.map((opp) => (
                      <Link
                        key={opp.id}
                        href={`/business/${opp.id}`}
                        className="block bg-white rounded-2xl border border-border p-5 hover:shadow-card hover:-translate-y-0.5 transition-all"
                      >
                        <p className="font-semibold text-text font-nunito">{opp.title}</p>
                        {opp.description && (
                          <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{opp.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {!hasQuery && (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
          <p className="text-text-muted text-sm">
            Search across people, jobs, discussions, and business opportunities.
          </p>
          <p className="text-xs text-text-muted mt-1">Type at least 2 characters to begin.</p>
        </div>
      )}
    </div>
  )
}
