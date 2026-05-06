import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message, error)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&detail=${encodeURIComponent(error.message)}`)
    }

    // Check if user already completed onboarding; if so, go to dashboard
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('onboarded_at')
        .eq('id', user.id)
        .single() as { data: { onboarded_at: string | null } | null }
      if (profile?.onboarded_at) {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error('[auth/callback] No code in request:', request.url)
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
