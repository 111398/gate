"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/shared/api/trpc/client";
import { INTERACTION_FREQUENCIES, type InteractionFrequency } from "@/shared/config/persona";
import { Select } from "@/shared/ui/Select";

export function InteractionFrequencySelect({ value }: { value: InteractionFrequency }) {
  const t = useTranslations("Settings");
  const utils = trpc.useUtils();

  const options = INTERACTION_FREQUENCIES.map((freq) => ({
    id: freq,
    label: t(`frequencyOptions.${freq}`),
  }));

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
      label={t("frequencyLabel")}
      options={options}
      selectedKey={value}
      onSelectionChange={(key) => mutation.mutate({ interactionFrequency: key as InteractionFrequency })}
    />
  );
}
