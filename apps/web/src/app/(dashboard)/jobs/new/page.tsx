'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { JOB_TYPE_LABELS } from '@spectrumcircle/shared'
import type { JobType } from '@spectrumcircle/shared'
import { Briefcase, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const JOB_TYPES = Object.entries(JOB_TYPE_LABELS) as [JobType, string][]

export default function NewJobPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [jobType, setJobType] = useState<JobType>('full_time')
  const [isRemote, setIsRemote] = useState(false)
  const [location, setLocation] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [accommodations, setAccommodations] = useState('')
  const [skills, setSkills] = useState('')
  const [tags, setTags] = useState('')
  const [deadline, setDeadline] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !companyName.trim() || !description.trim()) {
      setError('Title, company name, and description are required.')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        employer_id: user.id,
        title: title.trim(),
        company_name: companyName.trim(),
        description: description.trim(),
        job_type: jobType,
        is_remote: isRemote,
        location: location.trim() || null,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        autism_accommodations: accommodations.trim() || null,
        required_skills: parsedSkills,
        tags: parsedTags,
        deadline: deadline || null,
        status: 'open' as const,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('job_postings')
        .insert(payload)
        .select('id')
        .single() as { data: { id: string } | null; error: Error | null }

      if (insertError || !data) throw insertError

      router.push(`/jobs/${data.id}`)
    } catch {
      setError('Could not post job. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted">
        <Link href="/jobs" className="hover:text-text transition-colors flex items-center gap-1">
          <ChevronLeft size={14} aria-hidden="true" />
          Jobs Board
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
          <Briefcase size={20} className="text-yellow-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text">Post a Job</h1>
          <p className="text-sm text-text-muted">
            Reach qualified autistic candidates and highlight your accommodations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-card p-7 space-y-6">
        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-text mb-2">Basic information</legend>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">
              Job title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-text mb-1.5">
              Company name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="company"
              type="text"
              required
              maxLength={120}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-text mb-1.5">
                Employment type <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="job_type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {JOB_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                maxLength={100}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, NY"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_remote"
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="is_remote" className="text-sm font-medium text-text">
              Remote position
            </label>
          </div>
        </fieldset>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">
            Job description <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={8}
            maxLength={20000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role, responsibilities, and what makes your team a great place to work…"
            className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{description.length}/20,000</p>
        </div>

        {/* Autism accommodations */}
        <div>
          <label htmlFor="accommodations" className="block text-sm font-medium text-text mb-1">
            Autism-friendly accommodations
          </label>
          <p className="text-xs text-text-muted mb-2">
            Describe specific workplace accommodations available (e.g. quiet workspace, flexible hours, clear written communication, sensory-friendly environment).
          </p>
          <textarea
            id="accommodations"
            rows={4}
            maxLength={3000}
            value={accommodations}
            onChange={(e) => setAccommodations(e.target.value)}
            placeholder="e.g. Flexible start times, remote-first culture, dedicated quiet rooms, written instructions preferred…"
            className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
          />
        </div>

        {/* Salary */}
        <fieldset>
          <legend className="block text-sm font-medium text-text mb-2">Salary range (USD, annual)</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="salary_min" className="sr-only">Minimum salary</label>
              <input
                id="salary_min"
                type="number"
                min={0}
                max={10000000}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Min (e.g. 60000)"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="salary_max" className="sr-only">Maximum salary</label>
              <input
                id="salary_max"
                type="number"
                min={0}
                max={10000000}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Max (e.g. 90000)"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Skills & tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-text mb-1.5">
              Required skills
            </label>
            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-text-muted mt-1">Comma-separated</p>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-text mb-1.5">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="startups, fintech, accessibility"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-text-muted mt-1">Comma-separated</p>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-text mb-1.5">
            Application deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href="/jobs"
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-busy={submitting}
          >
            <Briefcase size={15} aria-hidden="true" />
            {submitting ? 'Posting…' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  )
}
