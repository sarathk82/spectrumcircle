'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { SpectrumCircleIcon } from '@spectrumcircle/ui'
import { USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS, USER_ROLE_COLORS } from '@spectrumcircle/shared'
import type { UserRole } from '@spectrumcircle/shared'
import { createClient } from '@/lib/supabase/client'
import { Heart, HandHelping, Briefcase, TrendingUp, MessageCircle, Users } from 'lucide-react'

const ROLE_ICONS: Record<UserRole, React.FC<{ size: number; color?: string }>> = {
  parent:       ({ size, color }) => <Heart       size={size} color={color} />,
  volunteer:    ({ size, color }) => <HandHelping size={size} color={color} />,
  job_seeker:   ({ size, color }) => <Briefcase   size={size} color={color} />,
  employer:     ({ size, color }) => <Briefcase   size={size} color={color} />,
  entrepreneur: ({ size, color }) => <TrendingUp  size={size} color={color} />,
  member:       ({ size, color }) => <Users       size={size} color={color} />,
}

const ROLES: UserRole[] = ['parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur', 'member']

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSave() {
    if (!selectedRole) return
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'User',
          role: selectedRole,
          bio: bio || null,
          location: location || null,
          onboarded_at: new Date().toISOString(),
        })

      if (upsertError) throw upsertError
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding save error:', err)
      const msg = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? JSON.stringify(err)
      setError(`Could not save your profile: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <SpectrumCircleIcon size={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold font-nunito text-text mb-2">
            Welcome to Spectrum Circle
          </h1>
          <p className="text-text-muted">
            {step === 'role'
              ? "Tell us about yourself so we can personalise your experience."
              : "Almost done — add a few details about yourself."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8" aria-label="Step progress">
          {['role', 'details'].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-primary-500'
                  : i < ['role', 'details'].indexOf(step)
                  ? 'w-4 bg-primary-300'
                  : 'w-4 bg-border'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {step === 'role' ? (
          <>
            <div
              role="radiogroup"
              aria-label="Choose your role"
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {ROLES.map((role) => {
                const Icon = ROLE_ICONS[role]
                const color = USER_ROLE_COLORS[role]
                const isSelected = selectedRole === role
                return (
                  <button
                    key={role}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedRole(role)}
                    className={`relative flex flex-col items-center p-5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-card-hover'
                        : 'border-border bg-white hover:border-primary-200 hover:shadow-card'
                    }`}
                  >
                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={22} color={color} />
                    </div>
                    <span className="font-semibold text-sm font-nunito text-text">
                      {USER_ROLE_LABELS[role]}
                    </span>
                    <span className="text-xs text-text-muted mt-1 leading-tight">
                      {USER_ROLE_DESCRIPTIONS[role]}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => selectedRole && setStep('details')}
              disabled={!selectedRole}
              className="mt-8 w-full py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-border shadow-card p-8 space-y-5">
            {error && (
              <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text mb-1.5">
                About you <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={400}
                rows={3}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
                placeholder="A brief description about yourself and your connection to the autism community…"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text mb-1.5">
                Location <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-text-light"
                placeholder="City, Country"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('role')}
                className="flex-1 py-3 rounded-xl border border-border text-text-muted text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-2 flex-grow py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 disabled:opacity-60 transition-colors"
                aria-busy={saving}
              >
                {saving ? 'Saving…' : 'Enter community →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
