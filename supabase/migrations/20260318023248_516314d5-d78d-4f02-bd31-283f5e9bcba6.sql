-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all chatbots
CREATE POLICY "Admins can view all chatbots"
  ON public.chatbots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all usage
CREATE POLICY "Admins can view all usage"
  ON public.usage FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all knowledge base
CREATE POLICY "Admins can view all knowledge"
  ON public.knowledge_base FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all chatbot settings
CREATE POLICY "Admins can view all chatbot settings"
  ON public.chatbot_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));