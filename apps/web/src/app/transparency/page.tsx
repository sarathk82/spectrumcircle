import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = { title: 'Financial Transparency' }

export default async function TransparencyPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entries } = await (supabase as any)
    .from('financial_entries')
    .select('kind, category, amount, currency, occurred_on, note')
    .eq('is_public', true)
    .order('occurred_on', { ascending: false }) as { data: Array<{ kind: 'income' | 'expense'; category: string; amount: number; currency: string; occurred_on: string; note: string | null }> | null }

  const totals = (entries ?? []).reduce((result, entry) => {
    result[entry.kind] += Number(entry.amount)
    return result
  }, { income: 0, expense: 0 })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar profile={null} />
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div><h1 className="text-3xl font-bold font-nunito text-text">Financial transparency</h1><p className="text-text-muted mt-2">A public view of the costs and voluntary revenue that help keep Spectrum Circle running.</p></div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-border p-5"><p className="text-sm text-text-muted">Public revenue</p><p className="text-2xl font-bold text-green-600 mt-1">${totals.income.toFixed(2)}</p></div>
          <div className="bg-white rounded-2xl border border-border p-5"><p className="text-sm text-text-muted">Public costs</p><p className="text-2xl font-bold text-red-600 mt-1">${totals.expense.toFixed(2)}</p></div>
          <div className="bg-white rounded-2xl border border-border p-5"><p className="text-sm text-text-muted">Balance</p><p className="text-2xl font-bold text-text mt-1">${(totals.income - totals.expense).toFixed(2)}</p></div>
        </div>
        <section className="bg-white rounded-2xl border border-border shadow-card overflow-hidden"><div className="p-6 border-b border-border"><h2 className="text-xl font-bold font-nunito text-text">Published entries</h2></div><div className="divide-y divide-border">{(entries ?? []).map((entry, index) => <div key={`${entry.occurred_on}-${entry.category}-${index}`} className="p-5 flex items-start justify-between gap-4"><div><p className="font-semibold text-text">{entry.category}</p><p className="text-sm text-text-muted">{entry.occurred_on}{entry.note ? ` · ${entry.note}` : ''}</p></div><p className={entry.kind === 'income' ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>{entry.kind === 'income' ? '+' : '-'}{entry.currency} {Number(entry.amount).toFixed(2)}</p></div>)}{(!entries || entries.length === 0) && <p className="p-6 text-text-muted">No public financial entries have been added yet.</p>}</div></section>
      </main>
      <SiteFooter />
    </div>
  )
}
