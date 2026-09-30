import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Globe, MapPin, Search, Plus } from 'lucide-react'

const CATEGORIES = [
  'All categories',
  'Speech & language',
  'Occupational therapy',
  'Academic support',
  'Social skills',
  'Recreation & movement',
  'Family support',
]

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; remote?: string }>
}) {
  const params = await searchParams
  const queryText = params.q?.trim() ?? ''
  const category = params.category ?? 'All categories'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('tutors')
    .select('id, title, description, tutor_name, category, specialties, location, is_remote, age_group, schedule, cost, currency, created_by, profiles(display_name, role)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (category !== 'All categories') query = query.eq('category', category)
  if (params.remote === '1') query = query.eq('is_remote', true)
  if (queryText) {
    const escaped = queryText.replace(/[%(),]/g, ' ')
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tutor_name.ilike.%${escaped}%,category.ilike.%${escaped}%`)
  }

  const { data: tutors } = await query as { data: Array<{ id: string; title: string; description: string; tutor_name: string; category: string; specialties: string[]; location: string | null; is_remote: boolean; age_group: string | null; schedule: string | null; cost: number | null; currency: string; created_by: string | null; profiles: { display_name: string; role: string } | null }> | null }

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams()
    if (queryText) next.set('q', queryText)
    if (category !== 'All categories') next.set('category', category)
    if (params.remote === '1') next.set('remote', '1')
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    const value = next.toString()
    return value ? `/tutors?${value}` : '/tutors'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold font-nunito text-text mb-1">Find a tutor</h1><p className="text-text-muted text-sm">Search trusted tutors and supportive learning options for autistic children and families.</p></div>{user && <Link href="/tutors/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 whitespace-nowrap"><Plus size={16} aria-hidden="true" />Add tutor</Link>}</div>

      <form action="/tutors" className="bg-white rounded-2xl border border-border shadow-card p-4 flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1"><span className="sr-only">Search tutors</span><Search size={17} className="absolute left-3 top-3 text-text-light" aria-hidden="true" /><input name="q" defaultValue={queryText} placeholder="Search by tutor, subject, or specialty" className="w-full rounded-xl border border-border pl-10 pr-3 py-2.5 text-sm" /></label>
        {category !== 'All categories' && <input type="hidden" name="category" value={category} />}
        {params.remote === '1' && <input type="hidden" name="remote" value="1" />}
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">Search</button>
      </form>

      <div className="flex flex-wrap gap-2" aria-label="Tutor categories">
        {CATEGORIES.map((item) => <a key={item} href={buildUrl({ category: item === 'All categories' ? undefined : item })} className={`px-3 py-1.5 rounded-full border text-xs font-medium ${category === item ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-border text-text-muted hover:border-primary-300'}`}>{item}</a>)}
        <a href={buildUrl({ remote: params.remote === '1' ? undefined : '1' })} className={`px-3 py-1.5 rounded-full border text-xs font-medium ${params.remote === '1' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-border text-text-muted hover:border-green-300'}`}>Remote only</a>
      </div>

      {tutors && tutors.length > 0 ? <div className="grid md:grid-cols-2 gap-4">{tutors.map((tutor) => <article key={tutor.id} className="bg-white rounded-2xl border border-border shadow-card p-5 space-y-3"><div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0"><BookOpen size={21} className="text-primary-500" aria-hidden="true" /></div><div><span className="text-xs font-semibold text-primary-600">{tutor.category}</span><h2 className="font-bold font-nunito text-text">{tutor.title}</h2><p className="text-sm text-text-muted">{tutor.tutor_name}</p></div></div><p className="text-sm text-text-muted leading-relaxed">{tutor.description}</p>{tutor.specialties.length > 0 && <div className="flex flex-wrap gap-1.5">{tutor.specialties.map((specialty) => <span key={specialty} className="px-2 py-1 rounded-lg bg-gray-100 text-text-muted text-xs">{specialty}</span>)}</div>}<div className="flex flex-wrap gap-3 text-xs text-text-muted">{tutor.age_group && <span>{tutor.age_group}</span>}{tutor.schedule && <span>{tutor.schedule}</span>}{tutor.is_remote ? <span className="flex items-center gap-1"><Globe size={12} aria-hidden="true" />Remote</span> : tutor.location && <span className="flex items-center gap-1"><MapPin size={12} aria-hidden="true" />{tutor.location}</span>}</div><div className="flex items-end justify-between gap-3"><p className="text-sm font-semibold text-primary-600">{tutor.cost == null || tutor.cost === 0 ? 'Contact for pricing' : `${tutor.currency} ${Number(tutor.cost).toFixed(2)}`}</p>{tutor.profiles ? <Link href={`/connect/${tutor.created_by}`} className="text-xs text-primary-500 hover:underline">Added by {tutor.profiles.display_name} · {tutor.profiles.role}</Link> : <span className="text-xs text-text-light">Contributor details available to members</span>}{user && tutor.created_by === user.id && <Link href={`/tutors/${tutor.id}/edit`} className="text-xs font-semibold text-primary-600 hover:underline">Edit</Link>}</div></article>)}</div> : <div className="bg-white rounded-2xl border border-border p-12 text-center text-text-muted"><BookOpen size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" /><p>No tutors match your search.</p><a href="/tutors" className="inline-block mt-2 text-primary-500 hover:underline text-sm">Clear filters</a></div>}
    </div>
  )
}