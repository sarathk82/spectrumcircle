DROP POLICY IF EXISTS "tutors_update_creator" ON public.tutors;
CREATE POLICY "tutors_update_creator"
  ON public.tutors FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "tutors_delete_creator" ON public.tutors;
CREATE POLICY "tutors_delete_creator"
  ON public.tutors FOR DELETE TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "jobs_update_creator" ON public.job_postings;
CREATE POLICY "jobs_update_creator"
  ON public.job_postings FOR UPDATE TO authenticated
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

DROP POLICY IF EXISTS "jobs_delete_creator" ON public.job_postings;
CREATE POLICY "jobs_delete_creator"
  ON public.job_postings FOR DELETE TO authenticated
  USING (employer_id = auth.uid());
