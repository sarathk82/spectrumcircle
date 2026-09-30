import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { USER_ROLE_LABELS, type UserRole } from '@spectrumcircle/shared'
import { addFinancialEntry, createUser, updateUserProfile } from '@/app/actions/admin'

const ROLES: UserRole[] = ['admin', 'parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur', 'member']

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: currentProfile } = await sb.from('profiles').select('role, display_name, avatar_url, onboarded_at').eq('id', user.id).single() as { data: { role: UserRole; display_name: string; avatar_url: string | null; onboarded_at: string | null } | null }
  if (currentProfile?.role !== 'admin') redirect('/dashboard')

  const [{ data: users }, { data: entries }] = await Promise.all([
    sb.from('profiles').select('id, display_name, role, created_at').order('created_at', { ascending: false }),
    sb.from('financial_entries').select('id, kind, category, amount, currency, occurred_on, note, is_public').order('occurred_on', { ascending: false }),
  ]) as [{ data: Array<{ id: string; display_name: string; role: UserRole; created_at: string }> | null }, { data: Array<{ id: string; kind: 'income' | 'expense'; category: string; amount: number; currency: string; occurred_on: string; note: string | null; is_public: boolean }> | null }]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main id="main-content" className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold font-nunito text-text">Admin dashboard</h1>
            <p className="text-text-muted mt-1">Manage members and keep the platform finances transparent.</p>
          </div>

          <section className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold font-nunito text-text">Users</h2>
              <p className="text-sm text-text-muted mt-1">Update member roles. Administrator access should be granted sparingly.</p>
            </div>
            <div className="divide-y divide-border">
              {(users ?? []).map((member) => (
                <form key={member.id} action={updateUserProfile} className="p-4 flex flex-col md:flex-row md:items-end gap-3">
                  <input type="hidden" name="user_id" value={member.id} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text truncate">{member.display_name}</p>
                    <p className="text-xs text-text-muted">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                  <label className="text-xs text-text-muted">Role
                    <select name="role" defaultValue={member.role} className="block mt-1 rounded-lg border border-border px-2 py-1.5 text-sm text-text">
                      {ROLES.map((role) => <option key={role} value={role}>{USER_ROLE_LABELS[role]}</option>)}
                    </select>
                  </label>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">Save</button>
                </form>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h2 className="text-xl font-bold font-nunito text-text">Add user</h2>
            <p className="text-sm text-text-muted mt-1 mb-5">Create a confirmed account without exposing the service role key to the browser.</p>
            <form action={createUser} className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-text">Display name<input name="display_name" required minLength={2} className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label>
              <label className="text-sm font-medium text-text">Email<input name="email" required type="email" className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label>
              <label className="text-sm font-medium text-text">Temporary password<input name="password" required minLength={8} type="password" className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label>
              <label className="text-sm font-medium text-text">Role<select name="role" defaultValue="member" className="mt-1 block w-full rounded-lg border border-border px-3 py-2">{ROLES.map((role) => <option key={role} value={role}>{USER_ROLE_LABELS[role]}</option>)}</select></label>
              <div className="md:col-span-2"><button type="submit" className="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">Create user</button></div>
            </form>
          </section>

          <section className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
            <form action={addFinancialEntry} className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div><h2 className="text-xl font-bold font-nunito text-text">Add financial entry</h2><p className="text-sm text-text-muted mt-1">Record a cost or revenue item for the community.</p></div>
              <label className="block text-sm font-medium text-text">Type<select name="kind" className="mt-1 block w-full rounded-lg border border-border px-3 py-2"><option value="expense">Expense</option><option value="income">Revenue</option></select></label>
              <label className="block text-sm font-medium text-text">Category<input name="category" required placeholder="Hosting, donations, domain..." className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium text-text">Amount<input name="amount" required type="number" min="0.01" step="0.01" className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label><label className="block text-sm font-medium text-text">Currency<input name="currency" defaultValue="USD" maxLength={3} className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label></div>
              <label className="block text-sm font-medium text-text">Date<input name="occurred_on" required type="date" className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label>
              <label className="block text-sm font-medium text-text">Note<textarea name="note" rows={3} className="mt-1 block w-full rounded-lg border border-border px-3 py-2" /></label>
              <label className="flex items-center gap-2 text-sm text-text"><input type="checkbox" name="is_public" defaultChecked /> Show on public transparency page</label>
              <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">Add entry</button>
            </form>

            <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="p-6 border-b border-border"><h2 className="text-xl font-bold font-nunito text-text">Ledger</h2><p className="text-sm text-text-muted mt-1">Entries marked public appear on the transparency page.</p></div>
              <div className="divide-y divide-border">
                {(entries ?? []).map((entry) => <div key={entry.id} className="p-4 flex items-start justify-between gap-4"><div><p className="font-semibold text-text">{entry.category}</p><p className="text-xs text-text-muted">{entry.occurred_on}{entry.note ? ` · ${entry.note}` : ''}</p></div><div className="text-right"><p className={entry.kind === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{entry.kind === 'income' ? '+' : '-'}{entry.currency} {Number(entry.amount).toFixed(2)}</p><p className="text-xs text-text-muted">{entry.is_public ? 'Public' : 'Private'}</p></div></div>)}
                {(!entries || entries.length === 0) && <p className="p-6 text-sm text-text-muted">No financial entries yet.</p>}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
