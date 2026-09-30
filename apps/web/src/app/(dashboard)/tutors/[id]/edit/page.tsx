import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteTutor, updateTutor } from '@/app/actions/tutors'
import ConfirmDeleteButton from '@/components/ConfirmDeleteButton'

const CATEGORIES = ['Speech & language', 'Occupational therapy', 'Academic support', 'Social skills', 'Recreation & movement', 'Family support', 'Volunteer support', 'Other']
const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD']

export default async function EditTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tutor } = await (supabase as any)
    .from('tutors')
    .select('id, title, tutor_name, category, description, specialties, age_group, schedule, location, cost, currency, is_remote, created_by')
    .eq('id', id)
    .eq('created_by', user.id)
    .single() as { data: { id: string; title: string; tutor_name: string; category: string; description: string; specialties: string[]; age_group: string | null; schedule: string | null; location: string | null; cost: number | null; currency: string | null; is_remote: boolean; created_by: string } | null }

  if (!tutor) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/tutors" className="text-sm text-text-muted hover:text-text">Back to tutors</Link>
      <div><h1 className="text-2xl font-bold font-nunito text-text">Edit tutor reference</h1><p className="text-sm text-text-muted mt-1">Only the person who added this reference can edit it.</p></div>
      <form action={updateTutor} className="bg-white rounded-2xl border border-border shadow-card p-7 space-y-5">
        <input type="hidden" name="id" value={tutor.id} />
        <label className="block text-sm font-medium text-text">Listing title<input name="title" required defaultValue={tutor.title} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Tutor or volunteer name<input name="tutor_name" required defaultValue={tutor.tutor_name} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Category<select name="category" defaultValue={tutor.category} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="block text-sm font-medium text-text">Description<textarea name="description" required rows={6} defaultValue={tutor.description} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Specialties<input name="specialties" defaultValue={tutor.specialties.join(', ')} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <div className="grid sm:grid-cols-2 gap-4"><label className="block text-sm font-medium text-text">Age group<input name="age_group" defaultValue={tutor.age_group ?? ''} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-text">Schedule<input name="schedule" defaultValue={tutor.schedule ?? ''} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label></div>
        <div className="grid sm:grid-cols-3 gap-4"><label className="block text-sm font-medium text-text">Location<input name="location" defaultValue={tutor.location ?? ''} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-text">Cost<input name="cost" type="number" min="0" step="0.01" defaultValue={tutor.cost ?? ''} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-text">Currency<select name="currency" defaultValue={tutor.currency ?? 'INR'} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white">{CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}</select></label></div>
        <label className="flex items-center gap-2 text-sm text-text"><input name="is_remote" type="checkbox" defaultChecked={tutor.is_remote} />Available remotely</label>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600">Save changes</button>
      </form>
      <div className="flex justify-end"><ConfirmDeleteButton action={deleteTutor} id={tutor.id} label="Delete tutor reference" /></div>
    </div>
  )
}
