import { createAgentUIStreamResponse, ToolLoopAgent, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import type { Persona } from "@/entities/persona";
import { buildOnboardingSystemPrompt } from "@/features/onboarding-dialog/model/system-prompt";
import { buildOnboardingTools } from "@/features/onboarding-dialog/model/tools";
import { buildPersonaSystemPrompt } from "@/features/send-message/model/system-prompt";
import { retrieveRelevantMemories } from "@/features/send-message/model/retrieve-relevant-memories";
import { createFixedTextStreamResponse } from "@/shared/api/chat/fixed-response-stream";
import { getChatModel } from "@/shared/api/llm/provider";
import { classifyMessage } from "@/shared/api/safety/classify-message";
import { getCrisisResponseText } from "@/shared/api/safety/crisis-response";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import { CHAT_KICKOFF_MARKER } from "@/shared/config/persona";
import { MILD_DISTRESS_REMINDER_PROBABILITY } from "@/shared/config/safety";
import { extractTextFromUIMessage } from "@/shared/lib/extract-text-from-ui-message";

// Единственный streaming-эндпоинт чата — вне tRPC (см. ТЗ п.3).
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
  const isRealUserMessage = Boolean(lastUserText) && lastUserText !== CHAT_KICKOFF_MARKER;

  // Слой безопасности (ТЗ п.6.5): каждое сообщение пользователя — и в онбординге,
  // и в основном чате — сначала проходит через отдельный классификатор, до того как
  // вызывается генерация персоны. При остром кризисе персона вообще не вызывается —
  // отдаётся заранее написанный фиксированный текст (см. ТЗ п.11: не зависеть от
  // того, что LLM "правильно себя поведёт").
  const safetyLevel = isRealUserMessage ? await classifyMessage(lastUserText) : "none";
  const isAcuteCrisis = safetyLevel === "acute_crisis";

  if (isRealUserMessage) {
    await supabase.from("messages").insert({
      persona_id: typedPersona.id,
      sender: "user",
      content: lastUserText,
      is_safety_flagged: isAcuteCrisis,
    });
  }

  if (isAcuteCrisis) {
    const crisisResponseText = await getCrisisResponseText();
    await supabase.from("messages").insert({
      persona_id: typedPersona.id,
      sender: "system",
      content: crisisResponseText,
      is_safety_flagged: true,
    });
    return createFixedTextStreamResponse(crisisResponseText);
  }

  const includeSupportReminder =
    safetyLevel === "mild_distress" && Math.random() < MILD_DISTRESS_REMINDER_PROBABILITY;

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
      instructions: buildOnboardingSystemPrompt(typedPersona, includeSupportReminder),
      tools: buildOnboardingTools({ supabase, personaId: typedPersona.id }),
    });
    return createAgentUIStreamResponse({ agent, uiMessages, onEnd });
  }

  const relevantMemories = lastUserText
    ? await retrieveRelevantMemories(supabase, typedPersona.id, lastUserText)
    : [];
  const agent = new ToolLoopAgent({
    model: getChatModel(),
    instructions: buildPersonaSystemPrompt(typedPersona, relevantMemories, includeSupportReminder),
  });
  return createAgentUIStreamResponse({ agent, uiMessages, onEnd });
}
