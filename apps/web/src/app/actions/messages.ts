'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const OFFLINE_AFTER_MS = 5 * 60 * 1000

async function sendOfflineEmail({
  recipientEmail,
  recipientName,
  senderName,
  content,
}: {
  recipientEmail: string
  recipientName: string
  senderName: string
  content: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) return false

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `New message from ${senderName} on Spectrum Circle`,
      text: `Hi ${recipientName},\n\n${senderName} sent you a message on Spectrum Circle:\n\n${content}\n\nSign in to reply: ${process.env.NEXT_PUBLIC_APP_URL}/messages`,
    }),
  })
  if (!response.ok) {
    console.error('Offline message email failed:', response.status, await response.text())
    return false
  }
  return true
}

export async function sendMessage(recipientId: string, content: string, sendEmail = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === recipientId) return { error: 'Cannot message yourself' }

  const trimmed = content.trim().slice(0, 2000)
  if (!trimmed) return { error: 'Message cannot be empty' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('messages').insert({
    sender_id: user.id,
    recipient_id: recipientId,
    content: trimmed,
  })

  if (error) return { error: error.message }

  const admin = createAdminClient()
  const [{ data: senderProfile }, { data: recipientProfile }, { data: recipientAuth }] = await Promise.all([
    (supabase as any).from('profiles').select('display_name').eq('id', user.id).single(),
    (supabase as any).from('profiles').select('display_name, last_seen_at').eq('id', recipientId).single(),
    admin ? admin.auth.admin.getUserById(recipientId) : Promise.resolve({ data: { user: null } }),
  ])

  await (supabase as any).rpc('create_message_notification', {
    p_recipient_id: recipientId,
    p_sender_id: user.id,
    p_body: trimmed,
  })

  const lastSeen = recipientProfile?.last_seen_at
    ? new Date(recipientProfile.last_seen_at).getTime()
    : 0
  const isOffline = Date.now() - lastSeen > OFFLINE_AFTER_MS
  const recipientEmail = recipientAuth?.user?.email
  let emailSent = false
  if (sendEmail && isOffline && recipientEmail) {
    try {
      emailSent = await sendOfflineEmail({
        recipientEmail,
        recipientName: recipientProfile?.display_name ?? 'there',
        senderName: senderProfile?.display_name ?? 'A community member',
        content: trimmed,
      })
    } catch {
      // Email delivery must not prevent the in-app notification or message send.
    }
  }

  revalidatePath(`/messages/${recipientId}`)
  revalidatePath('/messages')
  return { success: true, emailSent }
}
