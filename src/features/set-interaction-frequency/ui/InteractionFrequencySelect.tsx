"use client";

import { trpc } from "@/shared/api/trpc/client";
import {
  INTERACTION_FREQUENCIES,
  INTERACTION_FREQUENCY_LABELS,
  type InteractionFrequency,
} from "@/shared/config/persona";
import { Select } from "@/shared/ui/Select";

const OPTIONS = INTERACTION_FREQUENCIES.map((value) => ({
  id: value,
  label: INTERACTION_FREQUENCY_LABELS[value],
}));

export function InteractionFrequencySelect({ value }: { value: InteractionFrequency }) {
  const utils = trpc.useUtils();

  const mutation = trpc.persona.setInteractionFrequency.useMutation({
    onMutate: async (input) => {
      await utils.persona.getCurrent.cancel();
      const previous = utils.persona.getCurrent.getData();
      utils.persona.getCurrent.setData(undefined, (old) =>
        old ? { ...old, interaction_frequency: input.interactionFrequency } : old
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        utils.persona.getCurrent.setData(undefined, context.previous);
      }
    },
    onSettled: () => {
      utils.persona.getCurrent.invalidate();
    },
  });

  return (
    <Select
      label="Частота сообщений от персоны"
      options={OPTIONS}
      selectedKey={value}
      onSelectionChange={(key) => mutation.mutate({ interactionFrequency: key as InteractionFrequency })}
    />
  );
}
