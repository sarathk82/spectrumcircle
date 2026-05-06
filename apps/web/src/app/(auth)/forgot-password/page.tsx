'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'
import type { FormState } from '@/app/actions/auth'

const initialState: FormState = {}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  return (
    <div className="bg-white rounded-3xl shadow-card p-8 border border-border">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text font-nunito mb-2">Reset your password</h1>
        <p className="text-text-muted text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {state.error && (
        <div role="alert" className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {state.success ? (
        <div role="status" className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center">
          <p className="font-medium mb-1">Check your email</p>
          <p>{state.success}</p>
        </div>
      ) : (
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
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            aria-busy={isPending}
          >
            {isPending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-text-muted">
        <Link href="/login" className="text-primary-500 font-medium hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
