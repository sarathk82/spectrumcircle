import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, getInitials, USER_ROLE_LABELS, USER_ROLE_COLORS } from '@spectrumcircle/shared'
import type { UserRole, ForumPost, ForumReply } from '@spectrumcircle/shared'
import { ChevronLeft, MessageSquare, Eye } from 'lucide-react'
import ReplyForm from '@/components/forums/ReplyForm'
import ReactionBar from '@/components/forums/ReactionBar'
import EditDeletePost from '@/components/forums/EditDeletePost'
import ForumRepliesSection from '@/components/forums/ForumRepliesSection'

export default async function PostPage({
  params,
}: {
  params: Promise<{ categorySlug: string; postId: string }>
}) {
  const { categorySlug, postId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = (await (supabase as any)
    .from('forum_posts')
    .select(
      'id, title, content, view_count, reply_count, created_at, is_pinned, is_locked, tags, category_id, author_id, profiles(display_name, avatar_url, role, bio)'
    )
    .eq('id', postId)
    .is('deleted_at', null)
    .single()) as { data: ForumPost | null }

  if (!post) notFound()

  // Increment view count (fire-and-forget)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(supabase as any)
    .from('forum_posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', postId)
    .then(() => {})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: replies } = (await (supabase as any)
    .from('forum_replies')
    .select(
      'id, content, created_at, author_id, parent_reply_id, profiles(display_name, avatar_url, role)'
    )
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })) as { data: ForumReply[] | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: category } = (await (supabase as any)
    .from('forum_categories')
    .select('name, slug, color')
    .eq('id', post.category_id)
    .single()) as { data: { name: string; slug: string; color: string } | null }

  // Fetch reaction counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allReactions } = (await (supabase as any)
    .from('forum_reactions')
    .select('reaction_type, user_id')
    .eq('post_id', postId)) as { data: { reaction_type: string; user_id: string }[] | null }

  const reactionCounts = { like: 0, heart: 0, helpful: 0, support: 0 }
  const userReactionTypes: string[] = []
  for (const r of allReactions ?? []) {
    if (r.reaction_type in reactionCounts) {
      (reactionCounts as Record<string, number>)[r.reaction_type]++
    }
    if (r.user_id === user?.id) {
      userReactionTypes.push(r.reaction_type)
    }
  }

  const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
  const authorRole = author?.role as UserRole | undefined
  const authorRoleColor = authorRole ? USER_ROLE_COLORS[authorRole] : '#5B4FCF'
  const isOwnPost = user?.id === post.author_id

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted">
        <Link href="/forums" className="hover:text-text transition-colors">Forums</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/forums/${categorySlug}`} className="hover:text-text transition-colors">
          {category?.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-text truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Post */}
      <article className="bg-white rounded-2xl border border-border shadow-card p-7">
        <h1 className="text-2xl font-bold font-nunito text-text mb-5">{post.title}</h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: authorRoleColor }}
            aria-hidden="true"
          >
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.display_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(author?.display_name ?? '?')
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-text">{author?.display_name}</p>
            <p className="text-xs text-text-muted">
              {authorRole ? USER_ROLE_LABELS[authorRole] : ''} · {formatRelativeTime(post.created_at)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Eye size={12} aria-hidden="true" />
              {post.view_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} aria-hidden="true" />
              {post.reply_count}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-text leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-border">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-text-muted text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <ReactionBar
          postId={postId}
          categorySlug={categorySlug}
          initialCounts={reactionCounts}
          userReactions={userReactionTypes}
          isLoggedIn={!!user}
        />

        {/* Edit / Delete (own post only) */}
        {isOwnPost && (
          <EditDeletePost
            postId={postId}
            categorySlug={categorySlug}
            initialTitle={post.title}
            initialContent={post.content}
          />
        )}
      </article>

      {/* Replies section */}
      <ForumRepliesSection
        replies={replies ?? []}
        currentUserId={user?.id ?? null}
        postId={postId}
        categorySlug={categorySlug}
      />

      {/* Reply form */}
      {user && !post.is_locked && (
        <ReplyForm postId={post.id} categorySlug={categorySlug} />
      )}
      {post.is_locked && (
        <p className="text-sm text-center text-text-muted bg-white rounded-xl border border-border p-4">
          This thread is locked.
        </p>
      )}
    </div>
  )
}

