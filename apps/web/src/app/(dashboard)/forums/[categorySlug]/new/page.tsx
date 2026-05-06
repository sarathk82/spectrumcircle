'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

// This is a client page that needs the category. We resolve via props.
export default function NewThreadPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}) {
  const { categorySlug } = use(params)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimTitle = title.trim()
    const trimContent = content.trim()

    if (!trimTitle || !trimContent) {
      setError('Title and content are required.')
      return
    }
    if (trimTitle.length < 5) {
      setError('Title must be at least 5 characters.')
      return
    }
    if (trimContent.length < 10) {
      setError('Post content must be at least 10 characters.')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get the category id from the slug
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      const { data: category, error: catError } = await sb
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single() as { data: { id: string } | null; error: Error | null }

      if (catError || !category) throw new Error('Category not found')

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const { data: post, error: insertError } = await sb
        .from('forum_posts')
        .insert({
          category_id: category.id,
          author_id: user.id,
          title: trimTitle,
          content: trimContent,
          tags: parsedTags,
        })
        .select('id')
        .single() as { data: { id: string } | null; error: Error | null }

      if (insertError) throw insertError
      if (!post) throw new Error('Failed to create post')

      router.push(`/forums/${categorySlug}/${post.id}`)
    } catch {
      setError('Could not create thread. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted">
        <Link
          href="/forums"
          className="hover:text-text transition-colors"
        >
          Forums
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/forums/${categorySlug}`}
          className="hover:text-text transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          {categorySlug.replace(/-/g, ' ')}
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <MessageSquare size={20} className="text-primary-500" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text">Start a new thread</h1>
          <p className="text-sm text-text-muted">
            Share your thoughts, questions, or experiences with the community.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-border shadow-card p-7 space-y-6"
      >
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="post_title" className="block text-sm font-medium text-text mb-1.5">
            Title <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="post_title"
            type="text"
            required
            minLength={5}
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your thread about?"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{title.length}/200</p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="post_content" className="block text-sm font-medium text-text mb-1.5">
            Content <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="post_content"
            required
            rows={10}
            minLength={10}
            maxLength={20000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, experiences, or questions in detail…"
            className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{content.length}/20,000</p>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="post_tags" className="block text-sm font-medium text-text mb-1.5">
            Tags <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id="post_tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="support, diagnosis, resources"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-text-muted mt-1">Comma-separated</p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href={`/forums/${categorySlug}`}
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
            <MessageSquare size={15} aria-hidden="true" />
            {submitting ? 'Posting…' : 'Post thread'}
          </button>
        </div>
      </form>
    </div>
  )
}
