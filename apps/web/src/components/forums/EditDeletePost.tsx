'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { editPost, deletePost } from '@/app/actions/forums'

interface EditDeletePostProps {
  postId: string
  categorySlug: string
  initialTitle: string
  initialContent: string
}

export default function EditDeletePost({
  postId,
  categorySlug,
  initialTitle,
  initialContent,
}: EditDeletePostProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleEdit = () => {
    setError(null)
    startTransition(async () => {
      const result = await editPost(postId, title, content, categorySlug)
      if (result.error) setError(result.error)
      else setMode('view')
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost(postId, categorySlug)
      if (result.error) setError(result.error)
      else router.push(`/forums/${categorySlug}`)
    })
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 mt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-nunito font-bold text-text"
          aria-label="Edit post title"
          disabled={isPending}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={10000}
          rows={8}
          className="w-full px-4 py-3 border border-border rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y text-text"
          aria-label="Edit post content"
          disabled={isPending}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save changes
          </button>
          <button
            onClick={() => { setMode('view'); setTitle(initialTitle); setContent(initialContent) }}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-text-muted text-sm font-medium hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'delete') {
    return (
      <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
        <p className="text-sm font-medium text-red-700 mb-3">
          Delete this post? This action cannot be undone.
        </p>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete post
          </button>
          <button
            onClick={() => setMode('view')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-border text-text-muted text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
      <button
        onClick={() => setMode('edit')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:bg-gray-100 hover:text-text transition-colors"
      >
        <Pencil size={12} /> Edit
      </button>
      <button
        onClick={() => setMode('delete')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 size={12} /> Delete
      </button>
    </div>
  )
}
