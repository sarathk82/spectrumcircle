'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

interface ReplyFormProps {
  postId: string
  categorySlug: string
}

export default function ReplyForm({ postId, categorySlug }: ReplyFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || trimmed.length < 1) return

    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any).from('forum_replies').insert({
        post_id: postId,
        author_id: user.id,
        content: trimmed,
      })

      if (insertError) throw insertError

      setContent('')
      router.refresh()
    } catch {
      setError('Could not post reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-label="Post a reply">
      <h2 className="text-lg font-bold font-nunito text-text mb-4">Add a reply</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-card p-5">
        {error && (
          <div role="alert" className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={10000}
          required
          aria-required="true"
          aria-label="Your reply"
          className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
          placeholder="Share your thoughts, experiences, or support…"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-text-muted">
            {content.length}/10,000
          </span>
          <button
            type="submit"
            disabled={submitting || content.trim().length < 1}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-busy={submitting}
          >
            <Send size={15} aria-hidden="true" />
            {submitting ? 'Posting…' : 'Post reply'}
          </button>
        </div>
      </form>
    </section>
  )
}
