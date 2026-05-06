-- ============================================================
-- Spectrum Circle — Initial Schema Migration
-- ============================================================
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM (
  'parent', 'volunteer', 'job_seeker', 'employer', 'entrepreneur', 'member'
);
CREATE TYPE privacy_level AS ENUM ('public', 'members_only', 'private');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'volunteer');
CREATE TYPE job_status AS ENUM ('open', 'filled', 'closed', 'draft');
CREATE TYPE application_status AS ENUM (
  'submitted', 'reviewed', 'rejected', 'interview', 'offered', 'accepted'
);
CREATE TYPE opportunity_type AS ENUM (
  'partnership', 'investment', 'mentorship', 'project', 'other'
);
CREATE TYPE opportunity_status AS ENUM ('open', 'closed', 'draft');
CREATE TYPE notification_type AS ENUM (
  'connection_request', 'connection_accepted', 'message',
  'job_application', 'forum_reply', 'forum_reaction', 'system'
);
CREATE TYPE reaction_type AS ENUM ('helpful', 'like', 'heart', 'support');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id             UUID           NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role           user_role      NOT NULL DEFAULT 'member',
  display_name   TEXT           NOT NULL,
  bio            TEXT,
  location       TEXT,
  avatar_url     TEXT,
  website_url    TEXT,
  accessibility_prefs JSONB     NOT NULL DEFAULT
    '{"font_size":"medium","dark_mode":false,"reduce_motion":false,"dyslexia_font":false}'::jsonb,
  privacy_level  privacy_level  NOT NULL DEFAULT 'members_only',
  tags           TEXT[]         NOT NULL DEFAULT '{}',
  verified_at    TIMESTAMPTZ,
  onboarded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONNECTIONS
-- ============================================================
CREATE TABLE public.connections (
  id           UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       connection_status NOT NULL DEFAULT 'pending',
  message      TEXT,
  created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_connection   CHECK (requester_id != recipient_id),
  CONSTRAINT unique_connection    UNIQUE (requester_id, recipient_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE public.messages (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content              TEXT        NOT NULL,
  read_at              TIMESTAMPTZ,
  deleted_by_sender    BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_by_recipient BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_message      CHECK (sender_id != recipient_id),
  CONSTRAINT message_content_len  CHECK (char_length(content) BETWEEN 1 AND 5000)
);

-- ============================================================
-- JOB POSTINGS
-- ============================================================
CREATE TABLE public.job_postings (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                TEXT        NOT NULL,
  description          TEXT        NOT NULL,
  company_name         TEXT        NOT NULL,
  location             TEXT,
  is_remote            BOOLEAN     NOT NULL DEFAULT FALSE,
  job_type             job_type    NOT NULL DEFAULT 'full_time',
  salary_min           INTEGER,
  salary_max           INTEGER,
  salary_currency      TEXT        NOT NULL DEFAULT 'USD',
  autism_accommodations TEXT,
  required_skills      TEXT[]      NOT NULL DEFAULT '{}',
  tags                 TEXT[]      NOT NULL DEFAULT '{}',
  deadline             TIMESTAMPTZ,
  status               job_status  NOT NULL DEFAULT 'open',
  view_count           INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT salary_range_valid CHECK (
    salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max
  )
);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
CREATE TABLE public.job_applications (
  id           UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID               NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_id UUID               NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url   TEXT,
  status       application_status NOT NULL DEFAULT 'submitted',
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_application UNIQUE (job_id, applicant_id)
);

-- ============================================================
-- BUSINESS OPPORTUNITIES
-- ============================================================
CREATE TABLE public.business_opportunities (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID               NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT               NOT NULL,
  description      TEXT               NOT NULL,
  company_name     TEXT,
  opportunity_type opportunity_type   NOT NULL DEFAULT 'other',
  location         TEXT,
  is_remote        BOOLEAN            NOT NULL DEFAULT TRUE,
  tags             TEXT[]             NOT NULL DEFAULT '{}',
  status           opportunity_status NOT NULL DEFAULT 'open',
  view_count       INTEGER            NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FORUM CATEGORIES
-- ============================================================
CREATE TABLE public.forum_categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT 'message-circle',
  color       TEXT        NOT NULL DEFAULT '#5B4FCF',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  post_count  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FORUM POSTS
-- ============================================================
CREATE TABLE public.forum_posts (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   UUID        NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  is_pinned     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_locked     BOOLEAN     NOT NULL DEFAULT FALSE,
  view_count    INTEGER     NOT NULL DEFAULT 0,
  reply_count   INTEGER     NOT NULL DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  CONSTRAINT post_title_len   CHECK (char_length(title) BETWEEN 3 AND 200),
  CONSTRAINT post_content_len CHECK (char_length(content) BETWEEN 10 AND 50000)
);

-- ============================================================
-- FORUM REPLIES
-- ============================================================
CREATE TABLE public.forum_replies (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         UUID        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  parent_reply_id UUID        REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  author_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT reply_content_len CHECK (char_length(content) BETWEEN 1 AND 10000)
);

-- ============================================================
-- FORUM REACTIONS
-- ============================================================
CREATE TABLE public.forum_reactions (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id       UUID          REFERENCES public.forum_posts(id)   ON DELETE CASCADE,
  reply_id      UUID          REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id       UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL DEFAULT 'helpful',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT one_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR
    (post_id IS NULL    AND reply_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_reaction  UNIQUE (post_id,  user_id, reaction_type),
  CONSTRAINT unique_reply_reaction UNIQUE (reply_id, user_id, reaction_type)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id         UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      TEXT              NOT NULL,
  body       TEXT,
  payload    JSONB             NOT NULL DEFAULT '{}'::jsonb,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REPORTS (content moderation)
-- ============================================================
CREATE TABLE public.reports (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT        NOT NULL,
  target_id   UUID        NOT NULL,
  reason      TEXT        NOT NULL,
  details     TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending',
  resolved_by UUID        REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_target_type CHECK (
    target_type IN ('post', 'reply', 'profile', 'job', 'opportunity')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'reviewed', 'dismissed', 'actioned')
  )
);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_business_opps_updated_at
  BEFORE UPDATE ON public.business_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TRIGGER — auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER — forum reply count + last_reply_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_post_reply_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET reply_count = reply_count + 1, last_reply_at = NOW()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE public.forum_posts
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_post_reply_stats
  AFTER INSERT OR UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_post_reply_stats();

-- ============================================================
-- TRIGGER — forum category post count
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_category_post_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE public.forum_categories
    SET post_count = GREATEST(0, post_count - 1)
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_category_post_count
  AFTER INSERT OR UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_post_count();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_role          ON public.profiles(role);
CREATE INDEX idx_profiles_location      ON public.profiles(location);
CREATE INDEX idx_connections_requester  ON public.connections(requester_id);
CREATE INDEX idx_connections_recipient  ON public.connections(recipient_id);
CREATE INDEX idx_connections_status     ON public.connections(status);
CREATE INDEX idx_messages_sender        ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient     ON public.messages(recipient_id);
CREATE INDEX idx_messages_created       ON public.messages(created_at DESC);
CREATE INDEX idx_job_postings_employer  ON public.job_postings(employer_id);
CREATE INDEX idx_job_postings_status    ON public.job_postings(status);
CREATE INDEX idx_job_apps_job           ON public.job_applications(job_id);
CREATE INDEX idx_job_apps_applicant     ON public.job_applications(applicant_id);
CREATE INDEX idx_biz_opps_owner         ON public.business_opportunities(owner_id);
CREATE INDEX idx_forum_posts_category   ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_author     ON public.forum_posts(author_id);
CREATE INDEX idx_forum_posts_created    ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_deleted    ON public.forum_posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_forum_replies_post     ON public.forum_replies(post_id);
CREATE INDEX idx_notifications_user     ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread   ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- ============================================================
-- SEED — Forum categories
-- ============================================================
INSERT INTO public.forum_categories (name, slug, description, icon, color, sort_order)
VALUES
  ('Parent Support',           'parent-support',
   'A safe space for autism parents to share experiences, ask questions, and support each other.',
   'heart',          '#FF5A5A', 1),
  ('Volunteer Connect',        'volunteer-connect',
   'Connect volunteers with families and organisations supporting the autism community.',
   'helping-hand',   '#FF9A3C', 2),
  ('Employment & Careers',     'employment-careers',
   'Job opportunities, workplace accommodations, and career development for autistic individuals.',
   'briefcase',      '#FFD23F', 3),
  ('Business & Entrepreneurship', 'business-entrepreneurship',
   'Entrepreneurship opportunities and business ideas tailored for autistic individuals.',
   'trending-up',    '#4CAF7D', 4),
  ('Education & Therapies',    'education-therapies',
   'Share resources and insights on educational approaches and therapeutic interventions.',
   'book-open',      '#4BADE8', 5),
  ('General Discussion',       'general-discussion',
   'Open conversations about life on the spectrum, news, events, and community topics.',
   'message-circle', '#9B59B6', 6);
