'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

interface JobApplyFormProps {
  jobId: string
  jobTitle: string
}

export default function JobApplyForm({ jobId, jobTitle }: JobApplyFormProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any).from('job_applications').insert({
        job_id: jobId,
        applicant_id: user.id,
        cover_letter: coverLetter.trim() || null,
        status: 'submitted',
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You have already applied to this position.')
          return
        }
        throw insertError
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError('Could not submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-700 font-semibold text-lg mb-1">Application submitted!</p>
        <p className="text-text-muted text-sm">
          The employer has been notified. Good luck!
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold font-nunito text-text mb-4">
        Apply for {jobTitle}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="cover_letter"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Cover letter{' '}
            <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            id="cover_letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
            maxLength={5000}
            aria-label="Cover letter"
            className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
            placeholder="Tell the employer why you're a great fit for this role…"
          />
          <p className="text-xs text-text-muted mt-1 text-right">
            {coverLetter.length}/5,000
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-busy={submitting}
        >
          <Send size={15} aria-hidden="true" />
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </div>
  )
}
