import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInitials, USER_ROLE_COLORS, formatRelativeTime } from '@spectrumcircle/shared'
import type { UserRole, Message, Profile } from '@spectrumcircle/shared'

type MsgRow = Pick<Message, 'id' | 'content' | 'created_at' | 'sender_id' | 'recipient_id'>
type ProfileRow = Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role'>
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // Get all messages involving current user, pick latest per conversation
  const { data: messages } = await sb
    .from('messages')
    .select('id, content, created_at, sender_id, recipient_id')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false }) as { data: MsgRow[] | null }

  // Build unique conversation list (other person's ID)
  const conversationMap = new Map<string, MsgRow>()
  for (const msg of messages ?? []) {
    if (!msg) continue
    const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
    if (!conversationMap.has(otherId)) {
      conversationMap.set(otherId, msg)
    }
  }

  const otherIds = Array.from(conversationMap.keys())

  // Fetch profiles of conversation partners
  const { data: profiles } = otherIds.length > 0
    ? await sb.from('profiles').select('id, display_name, avatar_url, role').in('id', otherIds) as { data: ProfileRow[] | null }
    : { data: [] as ProfileRow[] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const conversations = otherIds
    .map((id) => ({
      otherId: id,
      profile: profileMap.get(id),
      lastMessage: conversationMap.get(id)!,
    }))
    .filter((c) => c.profile)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-nunito text-text mb-1">Messages</h1>
        <p className="text-text-muted text-sm">Your private conversations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        {conversations.length > 0 ? (
          <ul className="divide-y divide-border">
            {conversations.map(({ otherId, profile, lastMessage }) => {
              if (!profile) return null
              const role = profile.role as UserRole
              const roleColor = USER_ROLE_COLORS[role]
              const isFromMe = lastMessage.sender_id === user.id
              return (
                <li key={otherId}>
                  <Link
                    href={`/messages/${otherId}`}
                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: roleColor }}
                      aria-hidden="true"
                    >
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(profile.display_name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text text-sm">{profile.display_name}</p>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {isFromMe ? 'You: ' : ''}{lastMessage.content}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">
                      {formatRelativeTime(lastMessage.created_at)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-primary-400" aria-hidden="true" />
            </div>
            <p className="font-bold font-nunito text-text mb-2">No messages yet</p>
            <p className="text-sm text-text-muted max-w-xs">
              Connect with community members and start a conversation from their profile.
            </p>
            <Link
              href="/connect"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Find people to connect with
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
