'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, ChevronLeft } from 'lucide-react'

const CATEGORIES = [
  'Speech & language',
  'Occupational therapy',
  'Academic support',
  'Social skills',
  'Recreation & movement',
  'Family support',
  'Volunteer support',
  'Other',
]
const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD']

export default function NewTutorPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', tutorName: '', category: CATEGORIES[0], description: '', specialties: '', ageGroup: '', schedule: '', location: '', cost: '', currency: 'INR', isRemote: false })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!form.title.trim() || !form.tutorName.trim() || !form.description.trim()) {
      setError('Title, tutor name, and description are required.')
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any).from('tutors').insert({
        title: form.title.trim(),
        tutor_name: form.tutorName.trim(),
        category: form.category,
        description: form.description.trim(),
        specialties: form.specialties.split(',').map((item) => item.trim()).filter(Boolean),
        age_group: form.ageGroup.trim() || null,
        schedule: form.schedule.trim() || null,
        location: form.location.trim() || null,
        cost: form.cost ? Number(form.cost) : null,
        currency: form.currency.trim().toUpperCase() || 'USD',
        is_remote: form.isRemote,
        status: 'open',
        created_by: user.id,
      })
      if (insertError) throw insertError
      router.push('/tutors')
      router.refresh()
    } catch (caughtError) {
      const message = caughtError && typeof caughtError === 'object' && 'message' in caughtError
        ? String(caughtError.message)
        : caughtError instanceof Error
          ? caughtError.message
          : 'Could not add tutor. Please try again.'
      setError(message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/tutors" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text"><ChevronLeft size={15} aria-hidden="true" />Back to tutors</Link>
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><BookOpen size={20} className="text-primary-500" aria-hidden="true" /></div><div><h1 className="text-2xl font-bold font-nunito text-text">Add a tutor</h1><p className="text-sm text-text-muted">Share a tutor or volunteer support reference with families.</p></div></div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-card p-7 space-y-5">
        {error && <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <label className="block text-sm font-medium text-text">Listing title<input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Reading support for ages 7-10" className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Tutor or volunteer name<input required value={form.tutorName} onChange={(event) => update('tutorName', event.target.value)} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Category<select value={form.category} onChange={(event) => update('category', event.target.value)} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="block text-sm font-medium text-text">Description<textarea required rows={6} value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Specialties<span className="font-normal text-text-muted"> (comma-separated)</span><input value={form.specialties} onChange={(event) => update('specialties', event.target.value)} placeholder="phonics, sensory-friendly, homework help" className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <div className="grid sm:grid-cols-2 gap-4"><label className="block text-sm font-medium text-text">Age group<input value={form.ageGroup} onChange={(event) => update('ageGroup', event.target.value)} placeholder="e.g. 7-12 years" className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-text">Schedule<input value={form.schedule} onChange={(event) => update('schedule', event.target.value)} placeholder="Weekends" className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label></div>
        <div className="grid sm:grid-cols-3 gap-4"><label className="block text-sm font-medium text-text">Location<input value={form.location} onChange={(event) => update('location', event.target.value)} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-text">Cost<input type="number" min="0" step="0.01" value={form.cost} onChange={(event) => update('cost', event.target.value)} placeholder="Leave blank for contact" className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-text">Currency<select value={form.currency} onChange={(event) => update('currency', event.target.value)} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white">{CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}</select></label></div>
        <label className="flex items-center gap-2 text-sm text-text"><input type="checkbox" checked={form.isRemote} onChange={(event) => update('isRemote', event.target.checked)} />Available remotely</label>
        <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50">{submitting ? 'Adding…' : 'Add tutor reference'}</button>
      </form>
    </div>
  )
}
