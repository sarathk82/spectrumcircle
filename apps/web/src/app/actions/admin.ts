'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@spectrumcircle/shared'

const ADMIN_ROLES: UserRole[] = ['admin', 'parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur', 'member']

function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Admin user creation is not configured')
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

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
    if (!userId || !ADMIN_ROLES.includes(role)) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ role, privacy_level: 'members_only' })
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

export async function createUser(formData: FormData) {
  try {
    const { user: adminUser } = await requireAdmin()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')
    const displayName = String(formData.get('display_name') ?? '').trim()
    const role = String(formData.get('role')) as UserRole

    if (!email || password.length < 8 || displayName.length < 2 || !ADMIN_ROLES.includes(role)) {
      return
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    })
    if (error || !data.user) return

    // The signup trigger creates the profile; this update applies admin choices.
    await (adminClient as any).from('profiles').update({
      display_name: displayName,
      role,
      privacy_level: 'members_only',
    }).eq('id', data.user.id)

    void adminUser
    revalidatePath('/admin')
    redirect('/admin?created=1')
  } catch {
    redirect('/admin?error=user_creation_failed')
  }
}
