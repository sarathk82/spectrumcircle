'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── Reactions ──────────────────────────────────────────────────────────────

const VALID_REACTIONS = ['like', 'helpful', 'heart', 'support'] as const
type ReactionType = typeof VALID_REACTIONS[number]

function isValidReaction(r: string): r is ReactionType {
  return (VALID_REACTIONS as readonly string[]).includes(r)
}

export async function togglePostReaction(
  postId: string,
  reactionType: string,
  categorySlug: string
) {
  if (!isValidReaction(reactionType)) return { error: 'Invalid reaction type' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // Check if reaction already exists
  const { data: existing } = await sb
    .from('forum_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType)
    .maybeSingle() as { data: { id: string } | null }

  if (existing) {
    await sb.from('forum_reactions').delete().eq('id', existing.id)
  } else {
    await sb.from('forum_reactions').insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
    })
  }

  revalidatePath(`/forums/${categorySlug}/${postId}`)
  return { success: true, removed: !!existing }
}

// ── Post Edit / Delete ──────────────────────────────────────────────────────

export async function editPost(
  postId: string,
  title: string,
  content: string,
  categorySlug: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const trimmedTitle = title.trim().slice(0, 200)
  const trimmedContent = content.trim().slice(0, 10000)

  if (!trimmedTitle || !trimmedContent) return { error: 'Title and content are required' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('forum_posts')
    .update({ title: trimmedTitle, content: trimmedContent })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/forums/${categorySlug}/${postId}`)
  return { success: true }
}

export async function deletePost(postId: string, categorySlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('forum_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/forums/${categorySlug}`)
  return { success: true }
}

// ── Reply Edit / Delete ─────────────────────────────────────────────────────

export async function editReply(
  replyId: string,
  content: string,
  postId: string,
  categorySlug: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const trimmed = content.trim().slice(0, 5000)
  if (!trimmed) return { error: 'Content cannot be empty' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('forum_replies')
    .update({ content: trimmed })
    .eq('id', replyId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/forums/${categorySlug}/${postId}`)
  return { success: true }
}

export async function deleteReply(
  replyId: string,
  postId: string,
  categorySlug: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('forum_replies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', replyId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/forums/${categorySlug}/${postId}`)
  return { success: true }
}
