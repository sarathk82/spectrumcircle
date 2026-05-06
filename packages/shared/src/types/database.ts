import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  UserRole,
  PrivacyLevel,
  AccessibilityPrefs,
} from './user'
import type {
  ForumCategory,
  ForumPost,
  ForumPostInsert,
  ForumPostUpdate,
  ForumReply,
  ForumReplyInsert,
  ForumReaction,
  ReactionType,
} from './forum'
import type {
  JobPosting,
  JobPostingInsert,
  JobPostingUpdate,
  JobApplication,
  BusinessOpportunity,
  BusinessOpportunityInsert,
  JobType,
  JobStatus,
  ApplicationStatus,
  OpportunityType,
  OpportunityStatus,
} from './jobs'
import type {
  Connection,
  ConnectionStatus,
  Message,
  Notification,
  NotificationType,
} from './connections'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile & Record<string, unknown>
        Insert: ProfileInsert & Record<string, unknown>
        Update: ProfileUpdate & Record<string, unknown>
        Relationships: []
      }
      connections: {
        Row: Connection & Record<string, unknown>
        Insert: {
          id?: string
          requester_id: string
          recipient_id: string
          status?: ConnectionStatus
          message?: string | null
          created_at?: string
          updated_at?: string
        } & Record<string, unknown>
        Update: Partial<{
          status: ConnectionStatus
          updated_at: string
        }> & Record<string, unknown>
        Relationships: []
      }
      messages: {
        Row: Message & Record<string, unknown>
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          read_at?: string | null
          deleted_by_sender?: boolean
          deleted_by_recipient?: boolean
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<{
          read_at: string | null
          deleted_by_sender: boolean
          deleted_by_recipient: boolean
        }> & Record<string, unknown>
        Relationships: []
      }
      job_postings: {
        Row: JobPosting & Record<string, unknown>
        Insert: JobPostingInsert & Record<string, unknown>
        Update: JobPostingUpdate & Record<string, unknown>
        Relationships: [
          {
            foreignKeyName: 'job_postings_employer_id_fkey'
            columns: ['employer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      job_applications: {
        Row: JobApplication & Record<string, unknown>
        Insert: {
          id?: string
          job_id: string
          applicant_id: string
          cover_letter?: string | null
          resume_url?: string | null
          status?: ApplicationStatus
          created_at?: string
          updated_at?: string
        } & Record<string, unknown>
        Update: Partial<{
          status: ApplicationStatus
          cover_letter: string | null
          resume_url: string | null
        }> & Record<string, unknown>
        Relationships: []
      }
      business_opportunities: {
        Row: BusinessOpportunity & Record<string, unknown>
        Insert: BusinessOpportunityInsert & Record<string, unknown>
        Update: (Partial<BusinessOpportunityInsert> & { view_count?: number }) & Record<string, unknown>
        Relationships: [
          {
            foreignKeyName: 'business_opportunities_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      forum_categories: {
        Row: ForumCategory & Record<string, unknown>
        Insert: Omit<ForumCategory, 'id' | 'created_at' | 'post_count'> & Record<string, unknown>
        Update: Partial<Omit<ForumCategory, 'id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
      forum_posts: {
        Row: ForumPost & Record<string, unknown>
        Insert: ForumPostInsert & Record<string, unknown>
        Update: ForumPostUpdate & Record<string, unknown>
        Relationships: [
          {
            foreignKeyName: 'forum_posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'forum_posts_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'forum_categories'
            referencedColumns: ['id']
          }
        ]
      }
      forum_replies: {
        Row: ForumReply & Record<string, unknown>
        Insert: ForumReplyInsert & Record<string, unknown>
        Update: Partial<{ content: string; deleted_at: string | null }> & Record<string, unknown>
        Relationships: [
          {
            foreignKeyName: 'forum_replies_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'forum_replies_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'forum_posts'
            referencedColumns: ['id']
          }
        ]
      }
      forum_reactions: {
        Row: ForumReaction & Record<string, unknown>
        Insert: {
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
          reaction_type?: ReactionType
          created_at?: string
        } & Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notifications: {
        Row: Notification & Record<string, unknown>
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          body?: string | null
          payload?: Record<string, unknown>
          read_at?: string | null
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<{ read_at: string | null }> & Record<string, unknown>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_type: string
          target_id: string
          reason: string
          status: string
          created_at: string
        } & Record<string, unknown>
        Insert: {
          id?: string
          reporter_id: string
          target_type: string
          target_id: string
          reason: string
          status?: string
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<{ status: string }> & Record<string, unknown>
        Relationships: []
      }
    }
    Views: Record<string, { Row: Record<string, unknown>; Relationships: never[] }>
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>
    Enums: {
      user_role: UserRole
      privacy_level: PrivacyLevel
      connection_status: ConnectionStatus
      job_type: JobType
      job_status: JobStatus
      application_status: ApplicationStatus
      opportunity_type: OpportunityType
      opportunity_status: OpportunityStatus
      notification_type: NotificationType
      reaction_type: ReactionType
    }
    CompositeTypes: {
      accessibility_prefs: AccessibilityPrefs
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
