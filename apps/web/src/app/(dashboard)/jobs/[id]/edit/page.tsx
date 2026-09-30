import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateJob } from '@/app/actions/jobs'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: job } = await (supabase as any)
    .from('job_postings')
    .select('id, title, company_name, description, location, is_remote, autism_accommodations, required_skills, tags, employer_id')
    .eq('id', id)
    .eq('employer_id', user.id)
    .single() as { data: { id: string; title: string; company_name: string; description: string; location: string | null; is_remote: boolean; autism_accommodations: string | null; required_skills: string[]; tags: string[]; employer_id: string } | null }

  if (!job) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/jobs/${id}`} className="text-sm text-text-muted hover:text-text">Back to job</Link>
      <div><h1 className="text-2xl font-bold font-nunito text-text">Edit job listing</h1><p className="text-sm text-text-muted mt-1">Only the person who posted this job can edit it.</p></div>
      <form action={updateJob} className="bg-white rounded-2xl border border-border shadow-card p-7 space-y-5">
        <input type="hidden" name="id" value={job.id} />
        <label className="block text-sm font-medium text-text">Job title<input name="title" required defaultValue={job.title} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Company name<input name="company_name" required defaultValue={job.company_name} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Description<textarea name="description" required rows={8} defaultValue={job.description} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Location<input name="location" defaultValue={job.location ?? ''} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="flex items-center gap-2 text-sm text-text"><input name="is_remote" type="checkbox" defaultChecked={job.is_remote} />Remote position</label>
        <label className="block text-sm font-medium text-text">Accommodations<textarea name="accommodations" rows={4} defaultValue={job.autism_accommodations ?? ''} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Required skills<input name="skills" defaultValue={job.required_skills.join(', ')} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-text">Tags<input name="tags" defaultValue={job.tags.join(', ')} className="mt-1 block w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></label>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600">Save changes</button>
      </form>
    </div>
  )
}
