'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OPPORTUNITY_TYPE_LABELS } from '@spectrumcircle/shared'
import type { OpportunityType } from '@spectrumcircle/shared'
import { TrendingUp, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const OPPORTUNITY_TYPES = Object.entries(OPPORTUNITY_TYPE_LABELS) as [OpportunityType, string][]

export default function NewBusinessPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [opportunityType, setOpportunityType] = useState<OpportunityType>('partnership')
  const [isRemote, setIsRemote] = useState(false)
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        owner_id: user.id,
        title: title.trim(),
        description: description.trim(),
        company_name: companyName.trim() || null,
        opportunity_type: opportunityType,
        is_remote: isRemote,
        location: location.trim() || null,
        tags: parsedTags,
        status: 'open' as const,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('business_opportunities')
        .insert(payload)
        .select('id')
        .single() as { data: { id: string } | null; error: Error | null }

      if (insertError || !data) throw insertError

      router.push(`/business/${data.id}`)
    } catch {
      setError('Could not post opportunity. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <TrendingUp size={20} className="text-blue-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text">Post an Opportunity</h1>
          <p className="text-sm text-text-muted">
            Share partnership, investment, mentorship, or project opportunities.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-card p-7 space-y-6">
        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Type */}
        <div>
          <label htmlFor="opportunity_type" className="block text-sm font-medium text-text mb-1.5">
            Opportunity type <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="opportunity_type"
            value={opportunityType}
            onChange={(e) => setOpportunityType(e.target.value as OpportunityType)}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {OPPORTUNITY_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">
            Title <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Seeking co-founder for accessibility startup"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Company name (optional) */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-text mb-1.5">
            Company / organisation name{' '}
            <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            maxLength={120}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Spectrum Ventures"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">
            Description <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={7}
            maxLength={10000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're looking for, what you offer, and how to get involved…"
            className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{description.length}/10,000</p>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="e.g. San Francisco, CA"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-text">Open to remote collaboration</span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-text mb-1.5">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="accessibility, saas, autism-tech"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-text-muted mt-1">Comma-separated</p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href="/business"
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
            <TrendingUp size={15} aria-hidden="true" />
            {submitting ? 'Posting…' : 'Post opportunity'}
          </button>
        </div>
      </form>
    </div>
  )
}
