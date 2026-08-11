import "server-only";

// Единая точка абстракции над embeddings-провайдером — смена провайдера
// ограничивается этим файлом. Размерность должна совпадать с memory_chunks.embedding
// (vector(1024) в supabase/migrations/0001_init.sql).
export const EMBEDDING_VECTOR_DIMENSIONS = 1024;

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-4-lite";
const VOYAGE_BATCH_SIZE = 100;

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

async function embedBatch(texts: string[], inputType: "query" | "document"): Promise<number[][]> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EMBEDDINGS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: inputType,
      output_dimension: EMBEDDING_VECTOR_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embeddings request failed: ${response.status} ${await response.text()}`);
  }

  const json = (await response.json()) as VoyageResponse;
  return json.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += VOYAGE_BATCH_SIZE) {
    const batch = texts.slice(i, i + VOYAGE_BATCH_SIZE);
    results.push(...(await embedBatch(batch, "document")));
  }
  return results;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedBatch([text], "query");
  return vector;
}

// pgvector через PostgREST ожидает текстовый литерал вида "[1,2,3]", а не JS-массив
// (иначе Supabase JS сериализует его как Postgres-массив "{1,2,3}", который не
// приводится к vector).
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
