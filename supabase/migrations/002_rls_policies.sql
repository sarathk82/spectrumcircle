-- ============================================================
-- Spectrum Circle — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports               ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated
  USING (privacy_level IN ('public', 'members_only') OR id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- CONNECTIONS
-- ============================================================
CREATE POLICY "connections_select_own"
  ON public.connections FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "connections_insert_requester"
  ON public.connections FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "connections_update_parties"
  ON public.connections FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "connections_delete_parties"
  ON public.connections FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE POLICY "messages_select_parties"
  ON public.messages FOR SELECT TO authenticated
  USING (
    (sender_id    = auth.uid() AND NOT deleted_by_sender)
    OR
    (recipient_id = auth.uid() AND NOT deleted_by_recipient)
  );

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_parties"
  ON public.messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- ============================================================
-- JOB POSTINGS
-- ============================================================
CREATE POLICY "jobs_select_open_or_own"
  ON public.job_postings FOR SELECT TO authenticated
  USING (status = 'open' OR employer_id = auth.uid());

CREATE POLICY "jobs_insert_employer"
  ON public.job_postings FOR INSERT TO authenticated
  WITH CHECK (
    employer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('employer', 'entrepreneur')
    )
  );

CREATE POLICY "jobs_update_own"
  ON public.job_postings FOR UPDATE TO authenticated
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "jobs_delete_own"
  ON public.job_postings FOR DELETE TO authenticated
  USING (employer_id = auth.uid());

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
CREATE POLICY "applications_select_parties"
  ON public.job_applications FOR SELECT TO authenticated
  USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE id = job_id AND employer_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_applicant"
  ON public.job_applications FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "applications_update_parties"
  ON public.job_applications FOR UPDATE TO authenticated
  USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE id = job_id AND employer_id = auth.uid()
    )
  );

-- ============================================================
-- BUSINESS OPPORTUNITIES
-- ============================================================
CREATE POLICY "biz_opps_select_open_or_own"
  ON public.business_opportunities FOR SELECT TO authenticated
  USING (status = 'open' OR owner_id = auth.uid());

CREATE POLICY "biz_opps_insert_own"
  ON public.business_opportunities FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "biz_opps_update_own"
  ON public.business_opportunities FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "biz_opps_delete_own"
  ON public.business_opportunities FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- FORUM CATEGORIES (read-only for authenticated users)
-- ============================================================
CREATE POLICY "forum_categories_select"
  ON public.forum_categories FOR SELECT TO authenticated
  USING (true);

-- Allow anonymous read for SEO / discovery
CREATE POLICY "forum_categories_select_anon"
  ON public.forum_categories FOR SELECT TO anon
  USING (true);

-- ============================================================
-- FORUM POSTS
-- ============================================================
CREATE POLICY "forum_posts_select"
  ON public.forum_posts FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "forum_posts_insert_own"
  ON public.forum_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "forum_posts_update_own"
  ON public.forum_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

-- ============================================================
-- FORUM REPLIES
-- ============================================================
CREATE POLICY "forum_replies_select"
  ON public.forum_replies FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "forum_replies_insert_own"
  ON public.forum_replies FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "forum_replies_update_own"
  ON public.forum_replies FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

-- ============================================================
-- FORUM REACTIONS
-- ============================================================
CREATE POLICY "reactions_select"
  ON public.forum_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "reactions_insert_own"
  ON public.forum_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_own"
  ON public.forum_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- REPORTS
-- ============================================================
CREATE POLICY "reports_insert_own"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- ============================================================
-- SCHEMA GRANTS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.forum_categories TO anon;
GRANT ALL ON ALL TABLES     IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES  IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
