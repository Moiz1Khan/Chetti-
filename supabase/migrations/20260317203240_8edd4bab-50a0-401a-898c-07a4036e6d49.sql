
-- Add new columns to chatbots table
ALTER TABLE public.chatbots 
  ADD COLUMN IF NOT EXISTS system_prompt text DEFAULT '',
  ADD COLUMN IF NOT EXISTS model text DEFAULT 'google/gemini-3-flash-preview',
  ADD COLUMN IF NOT EXISTS temperature real DEFAULT 0.7,
  ADD COLUMN IF NOT EXISTS max_tokens integer DEFAULT 1024;

-- Create chatbot_settings table
CREATE TABLE IF NOT EXISTS public.chatbot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL UNIQUE,
  welcome_message text DEFAULT 'Hello! How can I help you today?',
  primary_color text DEFAULT '#000000',
  avatar_url text,
  bubble_style text DEFAULT 'rounded',
  lead_capture_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot settings" ON public.chatbot_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_settings.chatbot_id AND chatbots.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own chatbot settings" ON public.chatbot_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_settings.chatbot_id AND chatbots.user_id = auth.uid())
  );

CREATE POLICY "Users can update own chatbot settings" ON public.chatbot_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_settings.chatbot_id AND chatbots.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own chatbot settings" ON public.chatbot_settings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_settings.chatbot_id AND chatbots.user_id = auth.uid())
  );

-- Create chatbot_knowledge linking table
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
  knowledge_id uuid REFERENCES public.knowledge_base(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(chatbot_id, knowledge_id)
);

ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot knowledge" ON public.chatbot_knowledge
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_knowledge.chatbot_id AND chatbots.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own chatbot knowledge" ON public.chatbot_knowledge
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_knowledge.chatbot_id AND chatbots.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own chatbot knowledge" ON public.chatbot_knowledge
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = chatbot_knowledge.chatbot_id AND chatbots.user_id = auth.uid())
  );

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
  name text,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot leads" ON public.leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chatbots WHERE chatbots.id = leads.chatbot_id AND chatbots.user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Add updated_at trigger for chatbot_settings
CREATE TRIGGER update_chatbot_settings_updated_at
  BEFORE UPDATE ON public.chatbot_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
