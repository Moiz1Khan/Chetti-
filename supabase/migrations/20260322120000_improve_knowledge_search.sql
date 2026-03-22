-- Broader keyword matching for RAG: combine plain + websearch style tsquery.
-- Still returns no rows if query is too short or words don't appear in chunks (app may fallback).

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
    GREATEST(
      COALESCE(ts_rank(to_tsvector('english', kc.content), plainto_tsquery('english', p_query)), 0),
      COALESCE(ts_rank(to_tsvector('english', kc.content), websearch_to_tsquery('english', p_query)), 0)
    ) AS rank
  FROM public.knowledge_chunks kc
  WHERE kc.user_id = p_user_id
    AND (p_knowledge_ids IS NULL OR kc.knowledge_id = ANY(p_knowledge_ids))
    AND length(trim(coalesce(p_query, ''))) >= 2
    AND (
      to_tsvector('english', kc.content) @@ plainto_tsquery('english', p_query)
      OR to_tsvector('english', kc.content) @@ websearch_to_tsquery('english', p_query)
    )
  ORDER BY rank DESC
  LIMIT p_limit;
$$;
