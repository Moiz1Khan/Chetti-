
-- Add status column to knowledge_base
ALTER TABLE public.knowledge_base 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS source_content text;

-- Create knowledge_chunks table for RAG
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id uuid REFERENCES public.knowledge_base(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  token_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chunks" ON public.knowledge_chunks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chunks" ON public.knowledge_chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chunks" ON public.knowledge_chunks
  FOR DELETE USING (auth.uid() = user_id);

-- Full-text search index on chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_content_fts 
  ON public.knowledge_chunks USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_knowledge_id 
  ON public.knowledge_chunks(knowledge_id);

-- Create storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('knowledge-files', 'knowledge-files', false, 20971520)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to search knowledge chunks using full-text search
CREATE OR REPLACE FUNCTION public.search_knowledge_chunks(
  p_user_id uuid,
  p_query text,
  p_knowledge_ids uuid[] DEFAULT NULL,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  knowledge_id uuid,
  content text,
  chunk_index integer,
  rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    kc.id,
    kc.knowledge_id,
    kc.content,
    kc.chunk_index,
    ts_rank(to_tsvector('english', kc.content), plainto_tsquery('english', p_query)) AS rank
  FROM public.knowledge_chunks kc
  WHERE kc.user_id = p_user_id
    AND (p_knowledge_ids IS NULL OR kc.knowledge_id = ANY(p_knowledge_ids))
    AND to_tsvector('english', kc.content) @@ plainto_tsquery('english', p_query)
  ORDER BY rank DESC
  LIMIT p_limit;
$$;
