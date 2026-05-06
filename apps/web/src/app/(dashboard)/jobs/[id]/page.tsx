import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  JOB_TYPE_LABELS,
  formatRelativeTime,
  formatDate,
  formatSalary,
  getInitials,
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
} from '@spectrumcircle/shared'
import type { JobType, UserRole, JobPosting } from '@spectrumcircle/shared'
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronLeft,
  Eye,
  Calendar,
  Globe,
  CheckCircle2,
} from 'lucide-react'
import JobApplyForm from '@/components/jobs/JobApplyForm'

export default async function JobDetailPage({
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
  const { data: job } = (await (supabase as any)
    .from('job_postings')
    .select(
      'id, title, description, company_name, location, is_remote, job_type, salary_min, salary_max, salary_currency, autism_accommodations, required_skills, tags, deadline, status, view_count, created_at, employer_id, profiles(display_name, avatar_url, role, bio, location)'
    )
    .eq('id', id)
    .single()) as { data: JobPosting | null }

  if (!job || job.status === 'draft') notFound()

  // Increment view count (fire-and-forget)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(supabase as any)
    .from('job_postings')
    .update({ view_count: job.view_count + 1 })
    .eq('id', id)
    .then(() => {})

  const employer = Array.isArray(job.profiles) ? job.profiles[0] : job.profiles
  const employerRole = employer?.role as UserRole | undefined
  const employerRoleColor = employerRole ? USER_ROLE_COLORS[employerRole] : '#5B4FCF'

  // Check if user already applied
  let alreadyApplied = false
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('job_applications')
      .select('id')
      .eq('job_id', id)
      .eq('applicant_id', user.id)
      .maybeSingle() as { data: { id: string } | null }
    alreadyApplied = !!existing
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single() as { data: { role: string } | null }

  const isOwner = user?.id === job.employer_id
  const canApply = user && !isOwner && !alreadyApplied && job.status === 'open'

  const skills: string[] = Array.isArray(job.required_skills) ? job.required_skills : []
  const tags: string[] = Array.isArray(job.tags) ? job.tags : []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted">
        <Link href="/jobs" className="hover:text-text transition-colors flex items-center gap-1">
          <ChevronLeft size={14} aria-hidden="true" />
          Jobs Board
        </Link>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-7">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <Briefcase size={26} className="text-yellow-600" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-nunito text-text">{job.title}</h1>
                <p className="text-text-muted mt-1 font-medium">{job.company_name}</p>
              </div>
              <span
                className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  job.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {job.status === 'open' ? 'Hiring' : job.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} aria-hidden="true" />
                {job.is_remote ? 'Remote' : (job.location ?? 'On-site')}
                {job.is_remote && job.location && ` · ${job.location}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} aria-hidden="true" />
                {JOB_TYPE_LABELS[job.job_type as JobType]}
              </span>
              {(job.salary_min || job.salary_max) && (
                <span className="flex items-center gap-1.5">
                  <DollarSign size={14} aria-hidden="true" />
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye size={14} aria-hidden="true" />
                {job.view_count} views
              </span>
            </div>

            {job.deadline && (
              <p className="mt-3 text-sm text-orange-600 flex items-center gap-1.5">
                <Calendar size={13} aria-hidden="true" />
                Apply by {formatDate(job.deadline)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-white rounded-2xl border border-border shadow-card p-7">
            <h2 className="text-lg font-bold font-nunito text-text mb-4">About this role</h2>
            <div className="prose prose-sm max-w-none text-text-muted leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </section>

          {/* Required skills */}
          {skills.length > 0 && (
            <section className="bg-white rounded-2xl border border-border shadow-card p-7">
              <h2 className="text-lg font-bold font-nunito text-text mb-4">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium"
                  >
                    <CheckCircle2 size={12} aria-hidden="true" />
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Autism accommodations */}
          {job.autism_accommodations && (
            <section className="bg-purple-50 border border-purple-200 rounded-2xl p-7">
              <h2 className="text-lg font-bold font-nunito text-purple-900 mb-3">
                Autism-friendly accommodations
              </h2>
              <p className="text-purple-800 text-sm leading-relaxed whitespace-pre-line">
                {job.autism_accommodations}
              </p>
            </section>
          )}

          {/* Apply section */}
          {user ? (
            <section className="bg-white rounded-2xl border border-border shadow-card p-7">
              {isOwner ? (
                <p className="text-text-muted text-sm">
                  This is your job posting. You can manage it from your profile.
                </p>
              ) : alreadyApplied ? (
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Application submitted</p>
                    <p className="text-sm text-green-600">
                      You have already applied to this position.
                    </p>
                  </div>
                </div>
              ) : job.status !== 'open' ? (
                <p className="text-text-muted text-sm">This position is no longer accepting applications.</p>
              ) : (
                <JobApplyForm jobId={job.id} jobTitle={job.title} />
              )}
            </section>
          ) : (
            <div className="bg-white rounded-2xl border border-border shadow-card p-7 text-center">
              <p className="text-text-muted mb-4">Sign in to apply for this position.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Sign in to apply
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
          {employer && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-5">
              <h3 className="text-sm font-semibold text-text mb-3">Posted by</h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: employerRoleColor }}
                  aria-hidden="true"
                >
                  {employer.avatar_url ? (
                    <img
                      src={employer.avatar_url}
                      alt={employer.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(employer.display_name ?? '?')
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/connect/${job.employer_id}`}
                    className="font-semibold text-sm text-text hover:text-primary-600 transition-colors truncate block"
                  >
                    {employer.display_name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {employerRole ? USER_ROLE_LABELS[employerRole] : ''}
                  </p>
                  {employer.location && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Globe size={10} aria-hidden="true" />
                      {employer.location}
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
              <span className="text-text font-medium">{formatRelativeTime(job.created_at)}</span>
            </div>
            {job.deadline && (
              <div className="flex justify-between">
                <span>Deadline</span>
                <span className="text-orange-600 font-medium">{formatDate(job.deadline)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Work type</span>
              <span className="text-text font-medium">
                {job.is_remote ? 'Remote' : 'On-site'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
