-- RPC для векторного поиска по памяти персоны (косинусная близость).
-- SECURITY INVOKER (по умолчанию) — выполняется с правами вызывающего,
-- поэтому дополнительно защищено той же RLS-политикой, что и прямой select
-- из memory_chunks ("users read own memory_chunks").

create or replace function match_memory_chunks(
  p_persona_id uuid,
  p_query_embedding vector(1024),
  p_match_count int default 5
)
returns table (id uuid, content text, similarity float)
language sql
stable
as $$
  select
    memory_chunks.id,
    memory_chunks.content,
    1 - (memory_chunks.embedding <=> p_query_embedding) as similarity
  from memory_chunks
  where memory_chunks.persona_id = p_persona_id
  order by memory_chunks.embedding <=> p_query_embedding
  limit p_match_count;
$$;
