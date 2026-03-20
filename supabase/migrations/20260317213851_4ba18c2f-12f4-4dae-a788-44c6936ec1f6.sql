
ALTER TABLE public.chatbot_settings
  ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS background_theme text DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS background_image_url text,
  ADD COLUMN IF NOT EXISTS show_bot_name boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS avatar_type text DEFAULT 'icon',
  ADD COLUMN IF NOT EXISTS avatar_emoji text DEFAULT '🤖',
  ADD COLUMN IF NOT EXISTS avatar_icon text DEFAULT 'sparkles';
