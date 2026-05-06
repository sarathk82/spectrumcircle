'use client'

import { useState } from 'react'
import { getInitials, USER_ROLE_LABELS, USER_ROLE_COLORS, formatRelativeTime } from '@spectrumcircle/shared'
import type { UserRole } from '@spectrumcircle/shared'
import EditDeleteReply from './EditDeleteReply'

interface Reply {
  id: string
  content: string
  created_at: string
  author_id: string
  parent_reply_id: string | null
  profiles?: {
    display_name: string
    avatar_url: string | null
    role: string
  } | null | Array<{
    display_name: string
    avatar_url: string | null
    role: string
  }>
}

interface ForumRepliesSectionProps {
  replies: Reply[]
  currentUserId: string | null
  postId: string
  categorySlug: string
}

export default function ForumRepliesSection({
  replies: initialReplies,
  currentUserId,
  postId,
  categorySlug,
}: ForumRepliesSectionProps) {
  const [replies, setReplies] = useState(initialReplies)
  const [contents, setContents] = useState<Record<string, string>>(
    Object.fromEntries(initialReplies.map((r) => [r.id, r.content]))
  )

  const handleDeleted = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId))
  }

  const handleEdited = (replyId: string, newContent: string) => {
    setContents((prev) => ({ ...prev, [replyId]: newContent }))
  }

  if (replies.length === 0) return null

  return (
    <section aria-label="Replies">
      <h2 className="text-lg font-bold font-nunito text-text mb-4">
        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
      </h2>
      <div className="space-y-4">
        {replies.map((reply) => {
          const replyAuthor = Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles
          const replyRole = replyAuthor?.role as UserRole | undefined
          const replyColor = replyRole ? USER_ROLE_COLORS[replyRole] : '#6B7280'
          const isOwn = currentUserId === reply.author_id

          return (
            <div
              key={reply.id}
              className="bg-white rounded-2xl border border-border p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: replyColor }}
                  aria-hidden="true"
                >
                  {replyAuthor?.avatar_url ? (
                    <img src={replyAuthor.avatar_url} alt={replyAuthor.display_name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(replyAuthor?.display_name ?? '?')
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-text">{replyAuthor?.display_name}</p>
                  <p className="text-xs text-text-muted">
                    {replyRole ? USER_ROLE_LABELS[replyRole] : ''} · {formatRelativeTime(reply.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                {contents[reply.id] ?? reply.content}
              </p>
              {isOwn && (
                <EditDeleteReply
                  replyId={reply.id}
                  postId={postId}
                  categorySlug={categorySlug}
                  initialContent={contents[reply.id] ?? reply.content}
                  onDeleted={handleDeleted}
                  onEdited={handleEdited}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
