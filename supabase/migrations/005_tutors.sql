CREATE TABLE IF NOT EXISTS public.tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  age_group TEXT,
  schedule TEXT,
  cost NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF to_regclass('public.classes') IS NOT NULL AND to_regclass('public.tutors') IS NULL THEN
    ALTER TABLE public.classes RENAME TO tutors;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tutors' AND column_name = 'provider_name') THEN
    ALTER TABLE public.tutors RENAME COLUMN provider_name TO tutor_name;
  END IF;
END $$;

ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Other';
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS specialties TEXT[] NOT NULL DEFAULT '{}';

DROP POLICY IF EXISTS "classes_select_open" ON public.tutors;
CREATE POLICY "tutors_select_open"
  ON public.tutors FOR SELECT TO anon, authenticated
  USING (status = 'open');

GRANT SELECT ON public.tutors TO anon, authenticated;