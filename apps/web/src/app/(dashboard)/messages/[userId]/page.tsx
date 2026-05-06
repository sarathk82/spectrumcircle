import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInitials, USER_ROLE_COLORS, USER_ROLE_LABELS, formatRelativeTime } from '@spectrumcircle/shared'
import type { UserRole, Profile, Message } from '@spectrumcircle/shared'
import { ChevronLeft } from 'lucide-react'
import MessageInput from '@/components/messages/MessageInput'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.id === userId) redirect('/messages')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: otherProfile } = await sb
    .from('profiles')
    .select('id, display_name, avatar_url, role, bio')
    .eq('id', userId)
    .single() as { data: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role' | 'bio'> | null }

  if (!otherProfile) notFound()

  const { data: messages } = await sb
    .from('messages')
    .select('id, content, created_at, sender_id, recipient_id')
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true }) as { data: Pick<Message, 'id' | 'content' | 'created_at' | 'sender_id' | 'recipient_id'>[] | null }

  const role = otherProfile.role as UserRole
  const roleColor = USER_ROLE_COLORS[role]
  const roleLabel = USER_ROLE_LABELS[role]

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="bg-white rounded-t-2xl border border-border border-b-0 p-4 flex items-center gap-3">
        <Link
          href="/messages"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Back to messages"
        >
          <ChevronLeft size={18} className="text-text-muted" aria-hidden="true" />
        </Link>
        <Link href={`/connect/${userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: roleColor }}
            aria-hidden="true"
          >
            {otherProfile.avatar_url ? (
              <img src={otherProfile.avatar_url} alt={otherProfile.display_name} className="w-full h-full object-cover" />
            ) : (
              getInitials(otherProfile.display_name)
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-text">{otherProfile.display_name}</p>
            <p className="text-xs" style={{ color: roleColor }}>{roleLabel}</p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gray-50 border-x border-border overflow-y-auto p-4 space-y-3">
        {messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === user.id
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-white text-text border border-border rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-text-muted'}`}>
                    {formatRelativeTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-text-muted text-sm">No messages yet.</p>
            <p className="text-xs text-text-muted mt-1">
              Say hello to {otherProfile.display_name}!
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-2xl border border-border border-t-0">
        <MessageInput recipientId={userId} />
      </div>
    </div>
  )
}
