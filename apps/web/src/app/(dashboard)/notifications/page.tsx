import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@spectrumcircle/shared'
import type { Notification } from '@spectrumcircle/shared'
import { Bell, Check, MessageSquare, Briefcase, Users, Heart, Zap } from 'lucide-react'
import MarkAllReadButton from '@/components/notifications/MarkAllReadButton'
import MarkReadButton from '@/components/notifications/MarkReadButton'

type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'message'
  | 'job_application'
  | 'forum_reply'
  | 'forum_reaction'
  | 'system'

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  connection_request: <Users size={16} aria-hidden="true" />,
  connection_accepted: <Users size={16} aria-hidden="true" />,
  message: <MessageSquare size={16} aria-hidden="true" />,
  job_application: <Briefcase size={16} aria-hidden="true" />,
  forum_reply: <MessageSquare size={16} aria-hidden="true" />,
  forum_reaction: <Heart size={16} aria-hidden="true" />,
  system: <Zap size={16} aria-hidden="true" />,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  connection_request: '#4BADE8',
  connection_accepted: '#4CAF7D',
  message: '#5B4FCF',
  job_application: '#FFD23F',
  forum_reply: '#5B4FCF',
  forum_reaction: '#FF5A5A',
  system: '#9B59B6',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notifications } = (await (supabase as any)
    .from('notifications')
    .select('id, type, title, body, payload, read_at, created_at')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(50)) as { data: Pick<Notification, 'id' | 'type' | 'title' | 'body' | 'payload' | 'read_at' | 'created_at'>[] | null }

  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-muted mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
          {notifications.map((notif) => {
            const type = notif.type as NotificationType
            const icon = TYPE_ICONS[type] ?? <Bell size={16} />
            const color = TYPE_COLORS[type] ?? '#5B4FCF'
            const isUnread = !notif.read_at

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-5 transition-colors ${
                  isUnread ? 'bg-primary-50/40' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isUnread ? 'font-semibold text-text' : 'text-text-muted'}`}>
                    {notif.title}
                  </p>
                  {notif.body && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.body}</p>
                  )}
                  <p className="text-xs text-text-light mt-1">
                    {formatRelativeTime(notif.created_at)}
                  </p>
                </div>

                {/* Mark read */}
                {isUnread && (
                  <div className="flex-shrink-0">
                    <MarkReadButton notificationId={notif.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <Bell size={44} className="mx-auto mb-4 text-text-light" aria-hidden="true" />
          <p className="font-semibold text-text">You're all caught up!</p>
          <p className="text-sm text-text-muted mt-1">
            Notifications will appear here when there's activity.
          </p>
        </div>
      )}
    </div>
  )
}
