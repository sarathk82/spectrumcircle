CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  age_group TEXT,
  schedule TEXT,
  cost NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "profiles_select_public_anon" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_select_open"
  ON public.classes FOR SELECT TO anon, authenticated
  USING (status = 'open');

GRANT SELECT ON public.classes TO anon, authenticated;