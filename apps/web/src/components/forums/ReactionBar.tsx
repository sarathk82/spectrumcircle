'use client'

import { useState, useTransition } from 'react'
import { togglePostReaction } from '@/app/actions/forums'

const REACTIONS = [
  { type: 'like',    emoji: '👍', label: 'Like' },
  { type: 'heart',   emoji: '❤️', label: 'Heart' },
  { type: 'helpful', emoji: '✨', label: 'Helpful' },
  { type: 'support', emoji: '🤝', label: 'Support' },
] as const

interface ReactionCounts {
  like: number
  heart: number
  helpful: number
  support: number
}

interface ReactionBarProps {
  postId: string
  categorySlug: string
  initialCounts: ReactionCounts
  /** reaction types the current user has already made */
  userReactions: string[]
  isLoggedIn: boolean
}

export default function ReactionBar({
  postId,
  categorySlug,
  initialCounts,
  userReactions,
  isLoggedIn,
}: ReactionBarProps) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts)
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set(userReactions))
  const [isPending, startTransition] = useTransition()

  const handleReaction = (type: string) => {
    if (!isLoggedIn) return

    const alreadyReacted = myReactions.has(type)

    // Optimistic update
    setCounts((prev) => ({
      ...prev,
      [type]: alreadyReacted ? Math.max(0, (prev as unknown as Record<string, number>)[type] - 1) : (prev as unknown as Record<string, number>)[type] + 1,
    }))
    setMyReactions((prev) => {
      const next = new Set(prev)
      if (alreadyReacted) next.delete(type)
      else next.add(type)
      return next
    })

    startTransition(async () => {
      const result = await togglePostReaction(postId, type, categorySlug)
      if (result.error) {
        // Rollback optimistic update on error
        setCounts((prev) => ({
          ...prev,
          [type]: alreadyReacted ? (prev as unknown as Record<string, number>)[type] + 1 : Math.max(0, (prev as unknown as Record<string, number>)[type] - 1),
        }))
        setMyReactions((prev) => {
          const next = new Set(prev)
          if (alreadyReacted) next.add(type)
          else next.delete(type)
          return next
        })
      }
    })
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = (counts as unknown as Record<string, number>)[type] ?? 0
        const active = myReactions.has(type)
        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isPending || !isLoggedIn}
            aria-label={`${label}${count > 0 ? ` (${count})` : ''}${active ? ' — remove reaction' : ''}`}
            aria-pressed={active}
            title={isLoggedIn ? label : 'Sign in to react'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              active
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-gray-50 border-border text-text-muted hover:bg-gray-100 hover:text-text'
            } ${!isLoggedIn ? 'cursor-default' : 'cursor-pointer'} disabled:opacity-60`}
          >
            <span aria-hidden="true">{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
      {total > 0 && (
        <span className="text-xs text-text-muted ml-1">
          {total} {total === 1 ? 'reaction' : 'reactions'}
        </span>
      )}
      {!isLoggedIn && (
        <span className="text-xs text-text-muted ml-auto">Sign in to react</span>
      )}
    </div>
  )
}
