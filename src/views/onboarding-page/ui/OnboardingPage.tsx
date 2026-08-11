"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingChat } from "@/features/onboarding-dialog";
import { trpc } from "@/shared/api/trpc/client";
import styles from "./OnboardingPage.module.scss";

export function OnboardingPage() {
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
        <p className={styles.status}>Загрузка…</p>
      </div>
    );
  }

  if (persona.status !== "onboarding") {
    return (
      <div className={styles.wrapper}>
        <p className={styles.status}>Переходим в чат…</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <OnboardingChat onCompleted={() => utils.persona.getCurrent.invalidate()} />
    </div>
  );
}
