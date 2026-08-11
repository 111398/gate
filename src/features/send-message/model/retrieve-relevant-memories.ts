import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embedQuery, toVectorLiteral } from "@/shared/api/embeddings/provider";

const MATCH_COUNT = 5;

export async function retrieveRelevantMemories(
  supabase: SupabaseClient,
  personaId: string,
  queryText: string
): Promise<string[]> {
  const queryEmbedding = await embedQuery(queryText);

  const { data, error } = await supabase.rpc("match_memory_chunks", {
    p_persona_id: personaId,
    p_query_embedding: toVectorLiteral(queryEmbedding),
    p_match_count: MATCH_COUNT,
  });

  if (error) throw new Error(error.message);
  return ((data ?? []) as { content: string }[]).map((row) => row.content);
}
