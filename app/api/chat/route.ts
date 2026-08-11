import { createAgentUIStreamResponse, ToolLoopAgent, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import type { Persona } from "@/entities/persona";
import { buildOnboardingSystemPrompt } from "@/features/onboarding-dialog/model/system-prompt";
import { buildOnboardingTools } from "@/features/onboarding-dialog/model/tools";
import { getChatModel } from "@/shared/api/llm/provider";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import { CHAT_KICKOFF_MARKER } from "@/shared/config/persona";
import { extractTextFromUIMessage } from "@/shared/lib/extract-text-from-ui-message";

// Единственный streaming-эндпоинт чата — вне tRPC (см. ТЗ п.3). Пока обслуживает
// только онбординг (ветвление на основной чат/RAG добавится в этапах 6-7).
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

  if (typedPersona.status !== "onboarding") {
    return NextResponse.json({ error: "Онбординг для этой персоны уже завершён" }, { status: 400 });
  }

  const body = await req.json();
  const uiMessages = (body.messages ?? []) as UIMessage[];

  const lastUserMessage = [...uiMessages].reverse().find((message) => message.role === "user");
  if (lastUserMessage) {
    const text = extractTextFromUIMessage(lastUserMessage);
    if (text && text !== CHAT_KICKOFF_MARKER) {
      await supabase.from("messages").insert({
        persona_id: typedPersona.id,
        sender: "user",
        content: text,
      });
    }
  }

  const agent = new ToolLoopAgent({
    model: getChatModel(),
    instructions: buildOnboardingSystemPrompt(typedPersona),
    tools: buildOnboardingTools({ supabase, personaId: typedPersona.id }),
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages,
    onEnd: async ({ responseMessage }) => {
      const text = extractTextFromUIMessage(responseMessage);
      if (text) {
        await supabase.from("messages").insert({
          persona_id: typedPersona.id,
          sender: "persona",
          content: text,
        });
      }
    },
  });
}
