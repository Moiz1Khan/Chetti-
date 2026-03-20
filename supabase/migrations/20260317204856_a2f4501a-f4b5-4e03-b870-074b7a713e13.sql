
ALTER TABLE public.chatbot_settings
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS embed_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS domain_whitelist text[] DEFAULT '{}';

-- Allow anonymous users to read public chatbot settings
CREATE POLICY "Anyone can view public chatbot settings"
ON public.chatbot_settings
FOR SELECT
TO anon
USING (
  is_public = true AND EXISTS (
    SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_settings.chatbot_id AND chatbots.status = true
  )
);

-- Allow anonymous users to read public chatbots
CREATE POLICY "Anyone can view public chatbots"
ON public.chatbots
FOR SELECT
TO anon
USING (status = true);

-- Allow anonymous to insert messages for public chatbots
CREATE POLICY "Anyone can insert messages for public chatbots"
ON public.messages
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chatbots c
    JOIN public.chatbot_settings cs ON cs.chatbot_id = c.id
    WHERE c.id = messages.chatbot_id AND c.status = true AND cs.is_public = true
  )
);
