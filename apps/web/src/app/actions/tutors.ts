'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateTutor(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const tutorName = String(formData.get('tutor_name') ?? '').trim()
  const category = String(formData.get('category') ?? 'Other')
  const description = String(formData.get('description') ?? '').trim()
  if (!id || !title || !tutorName || !description) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('tutors')
    .update({
      title,
      tutor_name: tutorName,
      category,
      description,
      specialties: String(formData.get('specialties') ?? '').split(',').map((item) => item.trim()).filter(Boolean),
      age_group: String(formData.get('age_group') ?? '').trim() || null,
      schedule: String(formData.get('schedule') ?? '').trim() || null,
      location: String(formData.get('location') ?? '').trim() || null,
      cost: formData.get('cost') ? Number(formData.get('cost')) : null,
      currency: String(formData.get('currency') ?? 'INR').trim().toUpperCase() || 'INR',
      is_remote: formData.get('is_remote') === 'on',
    })
    .eq('id', id)
    .eq('created_by', user.id)

  if (!error) {
    revalidatePath('/tutors')
    revalidatePath(`/tutors/${id}/edit`)
    redirect('/tutors')
  }
}
