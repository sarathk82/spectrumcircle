import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import type { Profile } from '@spectrumcircle/shared'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    sb.from('profiles').select('id, display_name, avatar_url, role, onboarded_at').eq('id', user.id).single() as Promise<{ data: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role' | 'onboarded_at'> | null }>,
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
  ])

  // First-time users who haven't completed onboarding
  if (profile && !profile.onboarded_at) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar profile={profile} unreadCount={unreadCount ?? 0} />
        <main id="main-content" className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
