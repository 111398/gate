import type { InteractionFrequency, PersonaStatus } from "@/shared/config/persona";

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  relationship: string | null;
  age: number | null;
  character_notes: string | null;
  interaction_frequency: InteractionFrequency;
  status: PersonaStatus;
  created_at: string;
}
