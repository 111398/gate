"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/shared/api/trpc/client";
import { TrainingChatShell } from "@/widgets/training-chat";
import styles from "./OnboardingPage.module.scss";

export function OnboardingPage() {
  const t = useTranslations("Chat");
  const tOnboarding = useTranslations("Onboarding");
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: persona, isLoading } = trpc.persona.getCurrent.useQuery();

  useEffect(() => {
    if (persona && persona.status !== "onboarding") {
      router.replace("/chat");
    }
  }, [persona, router]);

  if (isLoading || !persona) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.status}>{t("loading")}</p>
      </div>
    );
  }

  if (persona.status !== "onboarding") {
    return (
      <div className={styles.wrapper}>
        <p className={styles.status}>{tOnboarding("redirecting")}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <TrainingChatShell mode="onboarding" onCompleted={() => utils.persona.getCurrent.invalidate()} />
    </div>
  );
}
