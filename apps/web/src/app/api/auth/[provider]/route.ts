import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const { origin } = new URL(request.url)

  if (provider !== 'google') {
    return NextResponse.redirect(`${origin}/login?error=unsupported_provider`)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/api/auth/callback?next=/onboarding`,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  return NextResponse.redirect(data.url)
}
