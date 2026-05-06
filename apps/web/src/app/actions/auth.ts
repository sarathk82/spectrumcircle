'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  display_name: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be 50 characters or fewer')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Display name contains invalid characters'),
})

export type FormState = {
  error?: string
  success?: string
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    // Return generic error to avoid user enumeration
    return { error: 'Invalid email or password. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    display_name: formData.get('display_name'),
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    if (
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('user already exists') ||
      error.message.toLowerCase().includes('email address is already')
    ) {
      return { error: 'An account with this email already exists. Try signing in instead.' }
    }
    if (error.message.toLowerCase().includes('password')) {
      return { error: `Password issue: ${error.message}` }
    }
    if (error.message.toLowerCase().includes('email')) {
      return { error: `Email issue: ${error.message}` }
    }
    if (error.message.toLowerCase().includes('signup is disabled')) {
      return { error: 'New registrations are temporarily disabled. Please try again later.' }
    }
    return { error: `Registration failed: ${error.message}` }
  }

  // If email confirmation is disabled the user gets a session immediately → redirect
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/onboarding')
  }

  // Email confirmation required
  return {
    success:
      'Account created! Check your email to confirm your address, then sign in.',
  }
}

export async function forgotPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email')
  const parsed = z.string().email().safeParse(email)
  if (!parsed.success) {
    return { error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`,
  })

  if (error) {
    return { error: 'Unable to send reset email. Please try again.' }
  }

  // Always return success to prevent email enumeration
  return {
    success: 'If an account exists for that email, a password reset link has been sent.',
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
