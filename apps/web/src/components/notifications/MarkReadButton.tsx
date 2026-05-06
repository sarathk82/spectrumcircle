'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

export default function MarkReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter()

  async function handleClick() {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text transition-colors"
      aria-label="Mark as read"
      title="Mark as read"
    >
      <Check size={14} aria-hidden="true" />
    </button>
  )
}
