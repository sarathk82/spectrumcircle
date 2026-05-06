import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ForumCategory } from '@spectrumcircle/shared'
import {
  Heart,
  HandHelping,
  Briefcase,
  TrendingUp,
  BookOpen,
  MessageCircle,
  ArrowRight,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.FC<{ size: number; color?: string }>> = {
  'heart':          ({ size, color }) => <Heart          size={size} color={color} />,
  'helping-hand':   ({ size, color }) => <HandHelping    size={size} color={color} />,
  'briefcase':      ({ size, color }) => <Briefcase      size={size} color={color} />,
  'trending-up':    ({ size, color }) => <TrendingUp     size={size} color={color} />,
  'book-open':      ({ size, color }) => <BookOpen       size={size} color={color} />,
  'message-circle': ({ size, color }) => <MessageCircle size={size} color={color} />,
}

export default async function ForumsPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = (await (supabase as any)
    .from('forum_categories')
    .select('id, name, slug, description, icon, color, post_count')
    .order('sort_order', { ascending: true })) as { data: ForumCategory[] | null }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-nunito text-text mb-1">Discussion Forums</h1>
        <p className="text-text-muted text-sm">
          A space for every conversation in the autism community.
        </p>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS['message-circle']
            return (
              <Link
                key={category.id}
                href={`/forums/${category.slug}`}
                className="group bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-6 flex items-start gap-4"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${category.color}18` }}
                  aria-hidden="true"
                >
                  <Icon size={22} color={category.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold font-nunito text-text group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-text-light">
                      {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                    </span>
                    <ArrowRight
                      size={14}
                      style={{ color: category.color }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <MessageCircle size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p>Forum categories not found.</p>
        </div>
      )}
    </div>
  )
}
