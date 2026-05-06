import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, Plus } from 'lucide-react'
import { JOB_TYPE_LABELS, formatRelativeTime } from '@spectrumcircle/shared'
import type { JobType, JobPosting, Profile } from '@spectrumcircle/shared'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; remote?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('job_postings')
    .select('id, title, company_name, location, is_remote, job_type, autism_accommodations, required_skills, tags, created_at, employer_id')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(30)

  if (params.type) query = query.eq('job_type', params.type)
  if (params.remote === '1') query = query.eq('is_remote', true)

  const { data: jobs } = await query as { data: Pick<JobPosting, 'id' | 'title' | 'company_name' | 'location' | 'is_remote' | 'job_type' | 'autism_accommodations' | 'required_skills' | 'tags' | 'created_at' | 'employer_id'>[] | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single() as { data: Pick<Profile, 'role'> | null }

  const canPost = profile?.role === 'employer' || profile?.role === 'entrepreneur'

  const TYPE_FILTERS: Array<{ value: string; label: string }> = [
    { value: '', label: 'All Types' },
    ...Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text mb-1">Jobs Board</h1>
          <p className="text-text-muted text-sm">Autism-friendly opportunities from inclusive employers.</p>
        </div>
        {canPost && (
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} aria-hidden="true" />
            Post a job
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by job type">
          {TYPE_FILTERS.map(({ value, label }) => {
            const isActive = (params.type ?? '') === value
            return (
              <Link
                key={value}
                href={value ? `/jobs?type=${value}` : '/jobs'}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-text-muted border-border hover:border-primary-300 hover:text-text'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {label}
              </Link>
            )
          })}
        </div>
        <Link
          href={params.remote === '1' ? '/jobs' : '/jobs?remote=1'}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            params.remote === '1'
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-text-muted border-border hover:border-green-300 hover:text-text'
          }`}
          aria-pressed={params.remote === '1'}
        >
          Remote only
        </Link>
      </div>

      {/* Job listings */}
      {jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-yellow-600" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold font-nunito text-text">{job.title}</h2>
                    <p className="text-sm text-text-muted mt-0.5">{job.company_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <MapPin size={11} aria-hidden="true" />
                        {job.is_remote ? 'Remote' : (job.location ?? 'On-site')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={11} aria-hidden="true" />
                        {JOB_TYPE_LABELS[job.job_type as JobType]}
                      </span>
                      <span className="text-xs text-text-light">
                        {formatRelativeTime(job.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {job.is_remote && (
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                      Remote
                    </span>
                  )}
                  {job.autism_accommodations && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      Accommodations
                    </span>
                  )}
                </div>
              </div>
              {job.required_skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.required_skills.slice(0, 5).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 text-text-muted text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="font-medium">No open jobs at the moment</p>
          {canPost && (
            <p className="text-sm mt-1">
              <Link href="/jobs/new" className="text-primary-500 hover:underline">
                Be the first to post one
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
