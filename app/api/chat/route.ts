import { createAgentUIStreamResponse, ToolLoopAgent, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import type { Persona } from "@/entities/persona";
import { buildOnboardingSystemPrompt } from "@/features/onboarding-dialog/model/system-prompt";
import { buildOnboardingTools } from "@/features/onboarding-dialog/model/tools";
import { buildPersonaSystemPrompt } from "@/features/send-message/model/system-prompt";
import { retrieveRelevantMemories } from "@/features/send-message/model/retrieve-relevant-memories";
import { getChatModel } from "@/shared/api/llm/provider";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import { CHAT_KICKOFF_MARKER } from "@/shared/config/persona";
import { extractTextFromUIMessage } from "@/shared/lib/extract-text-from-ui-message";

// Единственный streaming-эндпоинт чата — вне tRPC (см. ТЗ п.3).
// Слой безопасности (crisis-детекция, ТЗ п.6.5) сюда ещё не встроен — следующий этап.
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
  const isOnboarding = typedPersona.status === "onboarding";

  const body = await req.json();
  const uiMessages = (body.messages ?? []) as UIMessage[];

  const lastUserMessage = [...uiMessages].reverse().find((message) => message.role === "user");
  const lastUserText = lastUserMessage ? extractTextFromUIMessage(lastUserMessage) : "";

  if (lastUserText && lastUserText !== CHAT_KICKOFF_MARKER) {
    await supabase.from("messages").insert({
      persona_id: typedPersona.id,
      sender: "user",
      content: lastUserText,
    });
  }

  const onEnd = async ({ responseMessage }: { responseMessage: UIMessage }) => {
    const text = extractTextFromUIMessage(responseMessage);
    if (text) {
      await supabase.from("messages").insert({
        persona_id: typedPersona.id,
        sender: "persona",
        content: text,
      });
    }
  };

  if (isOnboarding) {
    const agent = new ToolLoopAgent({
      model: getChatModel(),
      instructions: buildOnboardingSystemPrompt(typedPersona),
      tools: buildOnboardingTools({ supabase, personaId: typedPersona.id }),
    });
    return createAgentUIStreamResponse({ agent, uiMessages, onEnd });
  }

  const relevantMemories = lastUserText
    ? await retrieveRelevantMemories(supabase, typedPersona.id, lastUserText)
    : [];
  const agent = new ToolLoopAgent({
    model: getChatModel(),
    instructions: buildPersonaSystemPrompt(typedPersona, relevantMemories),
  });
  return createAgentUIStreamResponse({ agent, uiMessages, onEnd });
}
