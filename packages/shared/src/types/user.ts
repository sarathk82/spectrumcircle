export type UserRole =
  | 'parent'
  | 'volunteer'
  | 'job_seeker'
  | 'employer'
  | 'entrepreneur'
  | 'member'

export type PrivacyLevel = 'public' | 'members_only' | 'private'

export interface AccessibilityPrefs {
  font_size: 'small' | 'medium' | 'large'
  dark_mode: boolean
  reduce_motion: boolean
  dyslexia_font: boolean
}

export interface Profile {
  id: string
  role: UserRole
  display_name: string
  bio: string | null
  location: string | null
  avatar_url: string | null
  website_url: string | null
  accessibility_prefs: AccessibilityPrefs
  privacy_level: PrivacyLevel
  tags: string[]
  verified_at: string | null
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at' | 'verified_at'> & {
  created_at?: string
  updated_at?: string
  verified_at?: string | null
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  parent: 'Autism Parent',
  volunteer: 'Volunteer',
  job_seeker: 'Job Seeker',
  employer: 'Employer',
  entrepreneur: 'Entrepreneur',
  member: 'Community Member',
}

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  parent: 'I am a parent or caregiver of an autistic individual',
  volunteer: 'I want to volunteer and support the autism community',
  job_seeker: 'I am looking for employment opportunities',
  employer: 'I am an employer looking to hire autistic talent',
  entrepreneur: 'I am looking to collaborate with autistic entrepreneurs',
  member: 'I want to join the community and participate',
}

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  parent: '#FF5A5A',
  volunteer: '#FF9A3C',
  job_seeker: '#FFD23F',
  employer: '#4CAF7D',
  entrepreneur: '#4BADE8',
  member: '#9B59B6',
}
