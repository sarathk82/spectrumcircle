'use client'

import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import type { FormState } from '@/app/actions/auth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

const initialState: FormState = {}

const OAUTH_ERRORS: Record<string, string> = {
  auth_callback_failed: 'Sign-in failed. Please try again.',
  oauth_failed: 'Social sign-in is not available right now. Please use email instead.',
  unsupported_provider: 'That sign-in method is not supported.',
}

function OAuthErrorBanner() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const oauthDetail = searchParams.get('detail')
  if (!oauthError) return null
  return (
    <div
      role="alert"
      className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
    >
      <p>{OAUTH_ERRORS[oauthError] ?? 'Something went wrong. Please try again.'}</p>
      {oauthDetail && (
        <p className="mt-1 text-xs text-red-500 font-mono">{oauthDetail}</p>
      )}
    </div>
  )
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="bg-white rounded-3xl shadow-card p-8 border border-border">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text font-nunito mb-2">Welcome back</h1>
        <p className="text-text-muted">Sign in to your Spectrum Circle account</p>
      </div>

      <Suspense>
        <OAuthErrorBanner />
      </Suspense>

      {state.error && (
        <div
          role="alert"
          className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <p>{state.error}</p>
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
        >
          {state.success}
        </div>
      )}

      <SocialLoginButtons label="Sign in with" />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted font-medium px-2">or sign in with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-light transition-shadow"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-text">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary-500 hover:text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-light transition-shadow"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          aria-busy={isPending}
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-500 font-medium hover:underline">
          Create one free
        </Link>
      </div>
    </div>
  )
}

