'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCheck } from 'lucide-react'

export default function MarkAllReadButton() {
  const router = useRouter()

  async function handleClick() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)

    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-muted text-sm hover:bg-gray-50 hover:text-text transition-colors"
    >
      <CheckCheck size={15} aria-hidden="true" />
      Mark all read
    </button>
  )
}
