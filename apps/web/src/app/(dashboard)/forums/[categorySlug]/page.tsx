import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@spectrumcircle/shared'
import type { ForumPost, ForumCategory } from '@spectrumcircle/shared'
import { MessageSquare, Pin, Plus, ChevronLeft } from 'lucide-react'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}) {
  const { categorySlug } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: category } = await sb
    .from('forum_categories')
    .select('id, name, slug, description, color')
    .eq('slug', categorySlug)
    .single() as { data: Pick<ForumCategory, 'id' | 'name' | 'slug' | 'description' | 'color'> | null }

  if (!category) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: posts } = (await sb
    .from('forum_posts')
    .select(
      'id, title, content, is_pinned, view_count, reply_count, created_at, last_reply_at, tags, profiles(display_name, avatar_url, role)'
    )
    .eq('category_id', category.id)
    .is('deleted_at', null)
    .order('is_pinned', { ascending: false })
    .order('last_reply_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(40)) as { data: ForumPost[] | null }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/forums"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-4"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          All forums
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${category.color}20` }}
              aria-hidden="true"
            />
            <div>
              <h1 className="text-2xl font-bold font-nunito text-text">{category.name}</h1>
              <p className="text-sm text-text-muted">{category.description}</p>
            </div>
          </div>
          <Link
            href={`/forums/${categorySlug}/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} aria-hidden="true" />
            New thread
          </Link>
        </div>
      </div>

      {/* Posts list */}
      {posts && posts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
          {posts.map((post) => {
            const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
            const activity = post.last_reply_at ?? post.created_at
            return (
              <Link
                key={post.id}
                href={`/forums/${categorySlug}/${post.id}`}
                className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.is_pinned && (
                      <Pin size={12} className="text-primary-500 flex-shrink-0" aria-label="Pinned" />
                    )}
                    <h2 className="font-semibold text-text font-nunito group-hover:text-primary-600 transition-colors truncate">
                      {post.title}
                    </h2>
                  </div>
                  <p className="text-sm text-text-muted line-clamp-1">
                    {post.content.slice(0, 120)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-light">
                    <span>by {author?.display_name ?? 'Unknown'}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(activity)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={11} aria-hidden="true" />
                    {post.reply_count}
                  </span>
                  <span>{post.view_count} views</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted bg-white rounded-2xl border border-border">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="font-medium">No discussions yet</p>
          <p className="text-sm mt-1">
            <Link
              href={`/forums/${categorySlug}/new`}
              className="text-primary-500 hover:underline"
            >
              Start the first thread
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
