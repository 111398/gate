import { NextResponse } from "next/server";
import type { Persona } from "@/entities/persona";
import { embedDocuments, toVectorLiteral } from "@/shared/api/embeddings/provider";
import { createSupabaseAdminClient } from "@/shared/api/supabase/admin-client";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import { chunkText } from "@/shared/lib/chunk-text";
import { extractPlainText } from "@/shared/lib/extract-plain-text";

const ALLOWED_FILE_TYPES = ["chat_export", "text_note"] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Приём файла -> Storage -> чанки -> эмбеддинги (multipart, вне tRPC, см. ТЗ п.3).
// Обработка идёт синхронно в рамках запроса — для файлов, превышающих лимит времени
// serverless-функции, следующий шаг — вынести в Upstash QStash (см. ТЗ п.6.3).
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: persona, error: personaError } = await supabase
    .from("personas")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (personaError || !persona) {
    return NextResponse.json({ error: "Персона не найдена" }, { status: 400 });
  }
  const typedPersona = persona as Persona;

  const formData = await req.formData();
  const file = formData.get("file");
  const fileType = formData.get("fileType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (typeof fileType !== "string" || !ALLOWED_FILE_TYPES.includes(fileType as (typeof ALLOWED_FILE_TYPES)[number])) {
    return NextResponse.json({ error: "Некорректный тип файла" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 });
  }

  const typedFileType = fileType as (typeof ALLOWED_FILE_TYPES)[number];
  const storagePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("training-files")
    .upload(storagePath, file, { contentType: file.type || "text/plain" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: trainingFile, error: insertError } = await supabase
    .from("training_files")
    .insert({
      persona_id: typedPersona.id,
      file_type: typedFileType,
      storage_path: storagePath,
      processed: false,
    })
    .select("*")
    .single();

  if (insertError || !trainingFile) {
    return NextResponse.json({ error: insertError?.message ?? "Не удалось сохранить файл" }, { status: 500 });
  }

  try {
    const rawContent = await file.text();
    const plainText = extractPlainText(rawContent, typedFileType);
    const chunks = chunkText(plainText);

    if (chunks.length > 0) {
      const vectors = await embedDocuments(chunks);
      const rows = chunks.map((content, index) => ({
        persona_id: typedPersona.id,
        source_file_id: trainingFile.id,
        content,
        embedding: toVectorLiteral(vectors[index]),
      }));

      // У клиента нет insert-политики на memory_chunks (см. RLS в 0001_init.sql) —
      // запись туда всегда идёт через сервисную роль, в обход RLS.
      const { error: chunksError } = await createSupabaseAdminClient().from("memory_chunks").insert(rows);
      if (chunksError) throw new Error(chunksError.message);
    }

    await supabase.from("training_files").update({ processed: true }).eq("id", trainingFile.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось обработать файл" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, trainingFileId: trainingFile.id });
}
