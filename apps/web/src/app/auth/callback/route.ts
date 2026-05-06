import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Google returned an error (e.g. user cancelled)
  if (error) {
    const url = new URL(`${origin}/login`)
    url.searchParams.set('error', 'oauth_failed')
    url.searchParams.set('detail', errorDescription ?? error)
    return NextResponse.redirect(url)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchange error:', exchangeError.message)
    const url = new URL(`${origin}/login`)
    url.searchParams.set('error', 'auth_callback_failed')
    url.searchParams.set('detail', exchangeError.message)
    return NextResponse.redirect(url)
  }

  // Redirect existing users to dashboard, new users to onboarding
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

  return NextResponse.redirect(`${origin}/onboarding`)
}
