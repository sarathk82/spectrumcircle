ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE POLICY "profiles_select_accepted_connections"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.connections
      WHERE status = 'accepted'
        AND ((requester_id = auth.uid() AND recipient_id = id)
          OR (recipient_id = auth.uid() AND requester_id = id))
    )
  );

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles(last_seen_at);

CREATE OR REPLACE FUNCTION public.create_message_notification(
  p_recipient_id UUID,
  p_sender_id UUID,
  p_body TEXT
)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_sender_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, payload)
  VALUES (
    p_recipient_id,
    'message',
    'New message',
    left(p_body, 240),
    jsonb_build_object('sender_id', p_sender_id)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_message_notification(UUID, UUID, TEXT) TO authenticated;
