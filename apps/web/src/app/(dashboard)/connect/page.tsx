import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, MapPin } from 'lucide-react'
import { USER_ROLE_LABELS, USER_ROLE_COLORS, getInitials } from '@spectrumcircle/shared'
import type { UserRole, Profile } from '@spectrumcircle/shared'

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('profiles')
    .select('id, display_name, bio, location, avatar_url, role')
    .neq('id', user?.id ?? '')
    .in('privacy_level', ['public', 'members_only'])
    .order('created_at', { ascending: false })
    .limit(24)

  if (params.role) {
    query = query.eq('role', params.role)
  }

  const { data: profiles } = await query as { data: Pick<Profile, 'id' | 'display_name' | 'bio' | 'location' | 'avatar_url' | 'role'>[] | null }

  const ROLE_FILTERS: Array<{ value: string; label: string }> = [
    { value: '', label: 'Everyone' },
    ...(['parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur'] as UserRole[]).map(
      (r) => ({ value: r, label: USER_ROLE_LABELS[r] })
    ),
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-nunito text-text mb-1">Connect</h1>
        <p className="text-text-muted text-sm">
          Find parents, volunteers, employers, and entrepreneurs in the community.
        </p>
      </div>

      {/* Role filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by role">
        {ROLE_FILTERS.map(({ value, label }) => {
          const isActive = (params.role ?? '') === value
          const color = value ? USER_ROLE_COLORS[value as UserRole] : '#5B4FCF'
          return (
            <Link
              key={value}
              href={value ? `/connect?role=${value}` : '/connect'}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-text-muted border-border hover:border-primary-300 hover:text-text'
              }`}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
              aria-current={isActive ? 'true' : undefined}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Profiles grid */}
      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const role = profile.role as UserRole
            const roleColor = USER_ROLE_COLORS[role]
            const roleLabel = USER_ROLE_LABELS[role]
            return (
              <Link
                key={profile.id}
                href={`/connect/${profile.id}`}
                className="bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: roleColor }}
                    aria-hidden="true"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(profile.display_name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text font-nunito truncate">
                      {profile.display_name}
                    </p>
                    <span
                      className="role-badge text-white text-xs mt-0.5"
                      style={{ backgroundColor: roleColor }}
                    >
                      {roleLabel}
                    </span>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {profile.location && (
                  <p className="flex items-center gap-1.5 text-xs text-text-muted">
                    <MapPin size={12} aria-hidden="true" />
                    {profile.location}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <Users size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="font-medium">No community members found</p>
          <p className="text-sm mt-1">Try a different filter or check back soon.</p>
        </div>
      )}
    </div>
  )
}
