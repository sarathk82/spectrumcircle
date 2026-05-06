export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'volunteer'
export type JobStatus = 'open' | 'filled' | 'closed' | 'draft'
export type ApplicationStatus =
  | 'submitted'
  | 'reviewed'
  | 'rejected'
  | 'interview'
  | 'offered'
  | 'accepted'

export type OpportunityType =
  | 'partnership'
  | 'investment'
  | 'mentorship'
  | 'project'
  | 'other'
export type OpportunityStatus = 'open' | 'closed' | 'draft'

export interface JobPosting {
  id: string
  employer_id: string
  title: string
  description: string
  company_name: string
  location: string | null
  is_remote: boolean
  job_type: JobType
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  autism_accommodations: string | null
  required_skills: string[]
  tags: string[]
  deadline: string | null
  status: JobStatus
  view_count: number
  created_at: string
  updated_at: string
  employer?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url'>
  /** Supabase join alias */
  profiles?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url'> | null
}

export type JobPostingInsert = {
  employer_id: string
  title: string
  description: string
  company_name: string
  location?: string | null
  is_remote?: boolean
  job_type: JobType
  salary_min?: number | null
  salary_max?: number | null
  salary_currency?: string
  autism_accommodations?: string | null
  required_skills?: string[]
  tags?: string[]
  deadline?: string | null
  status?: JobStatus
}

export type JobPostingUpdate = Partial<Omit<JobPostingInsert, 'employer_id'>>

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  cover_letter: string | null
  resume_url: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
  job?: Pick<JobPosting, 'id' | 'title' | 'company_name'>
  applicant?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url'>
}

export interface BusinessOpportunity {
  id: string
  owner_id: string
  title: string
  description: string
  company_name: string | null
  opportunity_type: OpportunityType
  location: string | null
  is_remote: boolean
  tags: string[]
  status: OpportunityStatus
  view_count: number
  created_at: string
  updated_at: string
  owner?: Pick<import('./user').Profile, 'id' | 'display_name' | 'avatar_url' | 'role'>
  /** Supabase join alias */
  profiles?: Pick<import('./user').Profile, 'display_name' | 'avatar_url' | 'role' | 'bio' | 'location'> | null
}

export type BusinessOpportunityInsert = {
  owner_id: string
  title: string
  description: string
  company_name?: string | null
  opportunity_type: OpportunityType
  location?: string | null
  is_remote?: boolean
  tags?: string[]
  status?: OpportunityStatus
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  volunteer: 'Volunteer',
}

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  partnership: 'Partnership',
  investment: 'Investment',
  mentorship: 'Mentorship',
  project: 'Project',
  other: 'Other',
}
