ALTER TABLE public.tutors
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "tutors_insert_authenticated" ON public.tutors;
CREATE POLICY "tutors_insert_authenticated"
  ON public.tutors FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "tutors_update_creator" ON public.tutors;
CREATE POLICY "tutors_update_creator"
  ON public.tutors FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "tutors_delete_creator" ON public.tutors;
CREATE POLICY "tutors_delete_creator"
  ON public.tutors FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "jobs_insert_employer" ON public.job_postings;
CREATE POLICY "jobs_insert_authenticated"
  ON public.job_postings FOR INSERT TO authenticated
  WITH CHECK (employer_id = auth.uid());

DROP POLICY IF EXISTS "jobs_update_own" ON public.job_postings;
CREATE POLICY "jobs_update_creator"
  ON public.job_postings FOR UPDATE TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "jobs_delete_own" ON public.job_postings;
CREATE POLICY "jobs_delete_creator"
  ON public.job_postings FOR DELETE TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin());

GRANT INSERT, UPDATE, DELETE ON public.tutors TO authenticated;
