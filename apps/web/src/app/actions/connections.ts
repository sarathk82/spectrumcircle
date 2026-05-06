'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sendConnectionRequest(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === targetUserId) return { error: 'Cannot connect to yourself' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { error } = await sb
    .from('connections')
    .insert({ requester_id: user.id, recipient_id: targetUserId, status: 'pending' })

  if (error) {
    if (error.code === '23505') return { error: 'Connection request already sent' }
    return { error: error.message }
  }

  await sb.from('notifications').insert({
    user_id: targetUserId,
    type: 'connection_request' as const,
    title: 'New connection request',
    body: 'Someone wants to connect with you.',
  })

  revalidatePath(`/connect/${targetUserId}`)
  revalidatePath('/connect')
  return { success: true }
}

export async function acceptConnection(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: conn, error: fetchError } = await sb
    .from('connections')
    .select('id, requester_id, recipient_id')
    .eq('id', connectionId)
    .eq('recipient_id', user.id)
    .eq('status', 'pending')
    .single() as { data: { id: string; requester_id: string; recipient_id: string } | null; error: Error | null }

  if (fetchError || !conn) return { error: 'Connection not found' }

  const { error } = await sb
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)

  if (error) return { error: error.message }

  await sb.from('notifications').insert({
    user_id: conn.requester_id,
    type: 'connection_accepted' as const,
    title: 'Connection accepted',
    body: 'Your connection request was accepted.',
  })

  revalidatePath('/connect')
  revalidatePath('/notifications')
  revalidatePath(`/connect/${conn.requester_id}`)
  return { success: true }
}

export async function declineConnection(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('connections')
    .update({ status: 'declined' })
    .eq('id', connectionId)
    .eq('recipient_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/connect')
  revalidatePath('/notifications')
  return { success: true }
}

export async function withdrawConnection(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('connections')
    .delete()
    .eq('id', connectionId)
    .eq('requester_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/connect')
  return { success: true }
}
