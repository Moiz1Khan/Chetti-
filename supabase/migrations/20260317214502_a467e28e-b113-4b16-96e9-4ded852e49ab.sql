
ALTER TABLE public.chatbot_settings
  ADD COLUMN IF NOT EXISTS quick_replies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS idle_message text,
  ADD COLUMN IF NOT EXISTS idle_timeout_seconds integer DEFAULT 30;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reactions text[] DEFAULT '{}';
