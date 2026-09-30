'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PrivacyLevel, UserRole } from '@spectrumcircle/shared'

const ADMIN_ROLES: UserRole[] = ['admin', 'parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur', 'member']
const PRIVACY_LEVELS: PrivacyLevel[] = ['public', 'members_only', 'private']

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: UserRole } | null }

  if (profile?.role !== 'admin') throw new Error('Not authorized')
  return { supabase, user }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const { supabase } = await requireAdmin()
    const userId = String(formData.get('user_id') ?? '')
    const role = String(formData.get('role')) as UserRole
    const privacyLevel = String(formData.get('privacy_level')) as PrivacyLevel
    if (!userId || !ADMIN_ROLES.includes(role) || !PRIVACY_LEVELS.includes(privacyLevel)) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ role, privacy_level: privacyLevel })
      .eq('id', userId)
    if (error) return

    revalidatePath('/admin')
    revalidatePath('/connect')
    return
  } catch {
    return
  }
}

export async function addFinancialEntry(formData: FormData) {
  try {
    const { supabase, user } = await requireAdmin()
    const kind = String(formData.get('kind'))
    const category = String(formData.get('category') ?? '').trim()
    const amount = Number(formData.get('amount'))
    const currency = String(formData.get('currency') ?? 'USD').trim().toUpperCase()
    const occurredOn = String(formData.get('occurred_on') ?? '')
    const note = String(formData.get('note') ?? '').trim()
    const isPublic = formData.get('is_public') === 'on'

    if (!['income', 'expense'].includes(kind) || !category || !Number.isFinite(amount) || amount <= 0 || !occurredOn) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('financial_entries').insert({
      kind,
      category,
      amount,
      currency,
      occurred_on: occurredOn,
      note: note || null,
      is_public: isPublic,
      created_by: user.id,
    })
    if (error) return

    revalidatePath('/admin')
    revalidatePath('/transparency')
    return
  } catch {
    return
  }
}
