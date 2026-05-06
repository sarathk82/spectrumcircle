'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { USER_ROLE_LABELS, USER_ROLE_COLORS, getInitials } from '@spectrumcircle/shared'
import type { UserRole, PrivacyLevel, Profile } from '@spectrumcircle/shared'
import { User, MapPin, Globe, Save, LogOut, ChevronDown } from 'lucide-react'

const ROLES: UserRole[] = ['parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur', 'member']
const PRIVACY_OPTIONS: Array<{ value: PrivacyLevel; label: string; description: string }> = [
  { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
  { value: 'members_only', label: 'Members only', description: 'Only signed-in members can view' },
  { value: 'private', label: 'Private', description: 'Only you can view your profile' },
]

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form fields
  const [userId, setUserId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('members_only')
  const [tags, setTags] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select(
          'display_name, bio, location, website_url, role, privacy_level, tags, avatar_url'
        )
        .eq('id', user.id)
        .single() as { data: Pick<Profile, 'display_name' | 'bio' | 'location' | 'website_url' | 'role' | 'privacy_level' | 'tags' | 'avatar_url'> | null }

      if (profile) {
        setDisplayName(profile.display_name ?? '')
        setBio(profile.bio ?? '')
        setLocation(profile.location ?? '')
        setWebsiteUrl(profile.website_url ?? '')
        setRole((profile.role as UserRole) ?? 'member')
        setPrivacyLevel((profile.privacy_level as PrivacyLevel) ?? 'members_only')
        setTags(Array.isArray(profile.tags) ? profile.tags.join(', ') : '')
        setAvatarUrl(profile.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const trimName = displayName.trim()
    if (trimName.length < 2 || trimName.length > 50) {
      setError('Display name must be between 2 and 50 characters.')
      return
    }
    if (!/^[a-zA-Z0-9 _-]+$/.test(trimName)) {
      setError('Display name contains invalid characters.')
      return
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10)

    setSaving(true)
    try {
    const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          display_name: trimName,
          bio: bio.trim() || null,
          location: location.trim() || null,
          website_url: websiteUrl.trim() || null,
          role,
          privacy_level: privacyLevel,
          tags: parsedTags,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccessMsg('Profile updated successfully.')
      router.refresh()
    } catch {
      setError('Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    )
  }

  const roleColor = USER_ROLE_COLORS[role]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-nunito text-text">My Profile</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage how the community sees you.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-muted text-sm hover:bg-gray-50 hover:text-text transition-colors disabled:opacity-50"
          aria-busy={signingOut}
        >
          <LogOut size={15} aria-hidden="true" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </div>
        )}
        {successMsg && (
          <div
            role="status"
            className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
          >
            {successMsg}
          </div>
        )}

        {/* Avatar preview */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: roleColor }}
            aria-hidden="true"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              getInitials(displayName || '?')
            )}
          </div>
          <div>
            <p className="font-semibold text-text">{displayName || 'Your name'}</p>
            <span
              className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: roleColor }}
            >
              {USER_ROLE_LABELS[role]}
            </span>
          </div>
        </div>

        {/* Identity */}
        <section className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-5">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <User size={16} className="text-primary-500" aria-hidden="true" />
            Identity
          </h2>

          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-text mb-1.5">
              Display name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="display_name"
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text mb-1.5">
              My role in the community
            </label>
            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full appearance-none rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white pr-10"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {USER_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-text mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself…"
              className="w-full rounded-xl border border-border px-4 py-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-text-light"
            />
            <p className="text-xs text-text-muted mt-1 text-right">{bio.length}/500</p>
          </div>
        </section>

        {/* Location & web */}
        <section className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-5">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <MapPin size={16} className="text-primary-500" aria-hidden="true" />
            Location &amp; links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                maxLength={100}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="website_url" className="block text-sm font-medium text-text mb-1.5">
                Website
              </label>
              <input
                id="website_url"
                type="url"
                maxLength={200}
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* Tags */}
        <section className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-text">Tags &amp; interests</h2>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-text mb-1.5">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="autism, parent, advocacy, tech"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-text-muted mt-1">Comma-separated, up to 10 tags</p>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-text">Privacy</h2>
          <div className="space-y-2" role="radiogroup" aria-label="Profile visibility">
            {PRIVACY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  privacyLevel === opt.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-border hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="privacy_level"
                  value={opt.value}
                  checked={privacyLevel === opt.value}
                  onChange={() => setPrivacyLevel(opt.value)}
                  className="mt-0.5 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-text">{opt.label}</p>
                  <p className="text-xs text-text-muted">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-busy={saving}
          >
            <Save size={15} aria-hidden="true" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
