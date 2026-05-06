export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked'
export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'message'
  | 'job_application'
  | 'forum_reply'
  | 'forum_reaction'
  | 'system'

export interface Connection {
  id: string
  requester_id: string
  recipient_id: string
  status: ConnectionStatus
  message: string | null
  created_at: string
  updated_at: string
  requester?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role'>
  recipient?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role'>
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read_at: string | null
  deleted_by_sender: boolean
  deleted_by_recipient: boolean
  created_at: string
  sender?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url'>
  recipient?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url'>
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  payload: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  connection_request: 'Connection Request',
  connection_accepted: 'Connection Accepted',
  message: 'New Message',
  job_application: 'Job Application',
  forum_reply: 'Forum Reply',
  forum_reaction: 'Forum Reaction',
  system: 'System',
}
