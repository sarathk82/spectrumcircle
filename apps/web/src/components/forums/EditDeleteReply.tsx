'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { editReply, deleteReply } from '@/app/actions/forums'

interface EditDeleteReplyProps {
  replyId: string
  postId: string
  categorySlug: string
  initialContent: string
  onDeleted: (replyId: string) => void
  onEdited: (replyId: string, newContent: string) => void
}

export default function EditDeleteReply({
  replyId,
  postId,
  categorySlug,
  initialContent,
  onDeleted,
  onEdited,
}: EditDeleteReplyProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleEdit = () => {
    setError(null)
    startTransition(async () => {
      const result = await editReply(replyId, content, postId, categorySlug)
      if (result.error) setError(result.error)
      else { onEdited(replyId, content); setMode('view') }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReply(replyId, postId, categorySlug)
      if (result.error) setError(result.error)
      else onDeleted(replyId)
    })
  }

  if (mode === 'edit') {
    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={4}
          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y text-text"
          aria-label="Edit reply"
          disabled={isPending}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Save
          </button>
          <button
            onClick={() => { setMode('view'); setContent(initialContent) }}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-text-muted text-xs font-medium hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'delete') {
    return (
      <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
        <p className="text-xs font-medium text-red-700 mb-2">Delete this reply?</p>
        {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete
          </button>
          <button
            onClick={() => setMode('view')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-text-muted text-xs font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={() => setMode('edit')}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-text-muted hover:bg-gray-100 hover:text-text transition-colors"
      >
        <Pencil size={11} /> Edit
      </button>
      <button
        onClick={() => setMode('delete')}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 size={11} /> Delete
      </button>
    </div>
  )
}
