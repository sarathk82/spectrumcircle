import Link from 'next/link'
import { SpectrumCircleLogo, SpectrumCircleIcon } from '@spectrumcircle/ui'
import { createClient } from '@/lib/supabase/server'
import {
  Heart,
  HandHelping,
  Briefcase,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Users,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Heart,
    title: 'Parent Support Network',
    description:
      'Connect with other autism parents. Share experiences, find local groups, and build a support system that truly understands.',
    color: '#FF5A5A',
    bg: '#FF5A5A18',
    href: '/connect?role=parent',
    label: 'Find parents',
  },
  {
    icon: HandHelping,
    title: 'Volunteer Connect',
    description:
      'Match passionate volunteers with families and organisations who need support. Make a meaningful difference together.',
    color: '#FF9A3C',
    bg: '#FF9A3C18',
    href: '/connect?role=volunteer',
    label: 'Volunteer now',
  },
  {
    icon: Briefcase,
    title: 'Autism-Friendly Jobs',
    description:
      'Browse jobs from inclusive employers with accommodation details front and centre — never buried in fine print.',
    color: '#E0A800',
    bg: '#FFD23F18',
    href: '/jobs',
    label: 'Browse jobs',
  },
  {
    icon: TrendingUp,
    title: 'Business Opportunities',
    description:
      'Entrepreneurs connect with autistic talent and collaborators. Find partnerships, projects, and investment opportunities.',
    color: '#4CAF7D',
    bg: '#4CAF7D18',
    href: '/business',
    label: 'Explore opportunities',
  },
  {
    icon: MessageCircle,
    title: 'Discussion Forums',
    description:
      'Topic-specific spaces for real conversations — from daily life to education, therapies, employment, and beyond.',
    color: '#9B59B6',
    bg: '#9B59B618',
    href: '/forums',
    label: 'Join discussions',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'Connect with members worldwide. Every role, every background, every part of the spectrum — welcome here.',
    color: '#4BADE8',
    bg: '#4BADE818',
    href: '/connect',
    label: 'Meet the community',
  },
]

const ROLES = [
  { label: 'Autism Parents',  color: '#FF5A5A', icon: Heart,        role: 'parent' },
  { label: 'Volunteers',      color: '#FF9A3C', icon: HandHelping,  role: 'volunteer' },
  { label: 'Job Seekers',     color: '#FFD23F', icon: Briefcase,    role: 'job_seeker' },
  { label: 'Employers',       color: '#4CAF7D', icon: Users,        role: 'employer' },
  { label: 'Entrepreneurs',   color: '#4BADE8', icon: TrendingUp,   role: 'entrepreneur' },
  { label: 'Community',       color: '#9B59B6', icon: MessageSquare, role: 'member' },
]

const WHY_ITEMS = [
  { icon: ShieldCheck, title: 'Privacy-first', desc: 'Full control over what you share. Your data is never sold.' },
  { icon: CheckCircle2, title: 'Autism-led design', desc: 'Built with and for the autism community at every step.' },
  { icon: Zap, title: 'Free forever', desc: 'Core features always free. No hidden fees, no paywalls.' },
]

const STEPS = [
  { step: '01', title: 'Create your profile', desc: 'Sign up free and choose your role. Takes under a minute.' },
  { step: '02', title: 'Connect & explore', desc: 'Find people, jobs, opportunities, and discussions relevant to you.' },
  { step: '03', title: 'Grow together', desc: 'Build relationships, find support, and make a real impact.' },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch live counts for social proof
  const [{ count: memberCount }, { count: jobCount }, { count: postCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('forum_posts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const fmt = (n: number | null) =>
    n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : `${n}+`

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <SpectrumCircleLogo size={36} showWordmark />
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            <Link href="/forums"  className="text-sm text-text-muted hover:text-text transition-colors font-medium">Forums</Link>
            <Link href="/jobs"    className="text-sm text-text-muted hover:text-text transition-colors font-medium">Jobs</Link>
            <Link href="/business" className="text-sm text-text-muted hover:text-text transition-colors font-medium">Business</Link>
            <Link href="/connect" className="text-sm text-text-muted hover:text-text transition-colors font-medium">Connect</Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-text hover:text-primary-500 transition-colors">Sign in</Link>
                <Link href="/register" className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm">
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-32 px-6">
          {/* Background decoration */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-100/50 blur-3xl" />
            <div className="absolute top-20 -left-32 w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-green-100/30 blur-3xl" />
            <div className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full bg-yellow-100/30 blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-10">
              <SpectrumCircleIcon size={100} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold mb-8">
              <span className="pulse-dot" aria-hidden="true" />
              The autism community is growing every day
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-nunito text-text leading-[1.1] mb-6 tracking-tight">
              Where Autism{' '}
              <span className="gradient-text">Connects,</span>
              <br />
              Grows &amp; Thrives
            </h1>

            <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
              A safe, inclusive platform for autism parents, volunteers, employers,
              job seekers, and entrepreneurs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl bg-primary-500 text-white text-base font-bold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Join the community — it&apos;s free
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl bg-white border border-border text-text text-base font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                See what&apos;s inside
              </Link>
            </div>

            {/* Live stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-nunito text-text">{fmt(memberCount)}</span>
                <span className="text-text-muted">Members</span>
              </div>
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-nunito text-text">{fmt(jobCount)}</span>
                <span className="text-text-muted">Open jobs</span>
              </div>
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-nunito text-text">{fmt(postCount)}</span>
                <span className="text-text-muted">Discussions</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Spectrum Circle ───────────────────────────────── */}
        <section className="py-16 px-6 bg-white border-y border-border">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {WHY_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-text font-nunito">{title}</p>
                  <p className="text-sm text-text-muted mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-nunito text-text mb-5">
                Everything the community needs
              </h2>
              <p className="text-xl text-text-muted max-w-xl mx-auto">
                Six pillars designed for every role in the autism community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="group bg-white rounded-3xl p-7 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: feature.bg }}
                    >
                      <Icon size={24} style={{ color: feature.color }} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold font-nunito text-text mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed flex-1">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.href}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:gap-2.5"
                      style={{ color: feature.color }}
                    >
                      {feature.label}
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Who We Serve ─────────────────────────────────────── */}
        <section className="py-28 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold font-nunito text-text mb-5">
                A community for everyone
              </h2>
              <p className="text-xl text-text-muted">
                No matter your role in the autism community, you belong here.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ROLES.map((r) => {
                const Icon = r.icon
                return (
                  <Link
                    key={r.label}
                    href={`/connect?role=${r.role}`}
                    className="rounded-2xl p-6 border border-border text-center hover:shadow-card hover:-translate-y-0.5 transition-all bg-white group"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: `${r.color}18` }}
                      aria-hidden="true"
                    >
                      <Icon size={22} style={{ color: r.color }} />
                    </div>
                    <p className="font-bold text-text font-nunito">{r.label}</p>
                    <p className="text-xs text-primary-500 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore →
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-nunito text-text mb-5">
                Get started in minutes
              </h2>
              <p className="text-xl text-text-muted">No credit card. No complexity. Just community.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-border" aria-hidden="true" />
              {STEPS.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold font-nunito mb-5 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="font-bold font-nunito text-text text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-28 px-6 gradient-bg relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center text-white">
            <SpectrumCircleIcon size={80} variant="white" className="mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold font-nunito mb-6">
              Your community is waiting.
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Join thousands of parents, volunteers, employers, and entrepreneurs
              already making a difference together.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-primary-600 text-base font-bold hover:bg-white/90 transition-all shadow-xl hover:-translate-y-0.5"
            >
              Join Spectrum Circle — it&apos;s free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="mt-6 text-white/60 text-sm">No credit card required · Privacy-first · Free forever</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-text py-16 px-6 text-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <SpectrumCircleLogo size={32} showWordmark variant="white" />
              <p className="mt-3 text-sm text-white/50 max-w-xs">
                An inclusive platform built with and for the autism community.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Footer navigation">
              <Link href="/forums"   className="hover:text-white transition-colors">Forums</Link>
              <Link href="/jobs"     className="hover:text-white transition-colors">Jobs</Link>
              <Link href="/business" className="hover:text-white transition-colors">Business</Link>
              <Link href="/connect"  className="hover:text-white transition-colors">Connect</Link>
              <Link href="/login"    className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-white transition-colors">Join free</Link>
            </nav>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <span>© {new Date().getFullYear()} Spectrum Circle. Built with care for the autism community.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


