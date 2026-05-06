export type ForumCategoryColor =
  | '#FF5A5A'
  | '#FF9A3C'
  | '#FFD23F'
  | '#4CAF7D'
  | '#4BADE8'
  | '#9B59B6'

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sort_order: number
  post_count: number
  created_at: string
}

export interface ForumPost {
  id: string
  category_id: string
  author_id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  last_reply_at: string | null
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
  author?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role'>
  category?: Pick<ForumCategory, 'id' | 'name' | 'slug' | 'color'>
  /** Supabase join aliases */
  profiles?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role' | 'bio'> | null
  forum_categories?: Pick<ForumCategory, 'id' | 'name' | 'slug' | 'color'> | null
}

export type ForumPostInsert = {
  category_id: string
  author_id: string
  title: string
  content: string
  tags?: string[]
}

export type ForumPostUpdate = Partial<{
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  tags: string[]
  view_count: number
}>

export interface ForumReply {
  id: string
  post_id: string
  parent_reply_id: string | null
  author_id: string
  content: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  author?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role'>
  replies?: ForumReply[]
  /** Supabase join alias */
  profiles?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role'> | null
}

export type ForumReplyInsert = {
  post_id: string
  parent_reply_id?: string | null
  author_id: string
  content: string
}

export type ReactionType = 'helpful' | 'like' | 'heart' | 'support'

export interface ForumReaction {
  id: string
  post_id: string | null
  reply_id: string | null
  user_id: string
  reaction_type: ReactionType
  created_at: string
}
