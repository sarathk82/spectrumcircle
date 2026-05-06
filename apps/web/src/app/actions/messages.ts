'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sendMessage(recipientId: string, content: string) {
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

  revalidatePath(`/messages/${recipientId}`)
  revalidatePath('/messages')
  return { success: true }
}
