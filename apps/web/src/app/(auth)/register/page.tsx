'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import type { FormState } from '@/app/actions/auth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

const initialState: FormState = {}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)

  return (
    <div className="bg-white rounded-3xl shadow-card p-8 border border-border">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text font-nunito mb-2">Join Spectrum Circle</h1>
        <p className="text-text-muted text-sm">
          Create your free account and connect with the autism community
        </p>
      </div>

      <SocialLoginButtons label="Sign up with" />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted font-medium px-2">or register with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {state.error && (
        <div
          role="alert"
          className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {state.error}
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

      {!state.success && (
        <form action={formAction} noValidate className="space-y-4">
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-text mb-1.5">
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              maxLength={50}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-light transition-shadow"
              placeholder="How should we address you?"
            />
          </div>

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
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-light transition-shadow"
              placeholder="At least 8 characters"
              aria-describedby="password-hint"
            />
            <p id="password-hint" className="mt-1 text-xs text-text-muted">
              Must contain uppercase letter and a number
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            aria-busy={isPending}
          >
            {isPending ? 'Creating account…' : 'Create free account'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-500 font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
