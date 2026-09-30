'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const companyName = String(formData.get('company_name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (!id || !title || !companyName || !description) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('job_postings')
    .update({
      title,
      company_name: companyName,
      description,
      location: String(formData.get('location') ?? '').trim() || null,
      is_remote: formData.get('is_remote') === 'on',
      autism_accommodations: String(formData.get('accommodations') ?? '').trim() || null,
      required_skills: String(formData.get('skills') ?? '').split(',').map((item) => item.trim()).filter(Boolean),
      tags: String(formData.get('tags') ?? '').split(',').map((item) => item.trim()).filter(Boolean),
    })
    .eq('id', id)
    .eq('employer_id', user.id)

  if (!error) {
    revalidatePath('/jobs')
    revalidatePath(`/jobs/${id}`)
    redirect(`/jobs/${id}`)
  }
}
