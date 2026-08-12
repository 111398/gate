"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/shared/api/trpc/client";
import { TrainingChatShell } from "@/widgets/training-chat";
import styles from "./SettingsTrainPage.module.scss";

// Дополнение данных о персоне из настроек — та же механика, что первичный
// онбординг, но короче и доступна в любой момент, пока персона активна.
export function SettingsTrainPage() {
  const t = useTranslations("Chat");
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: persona, isLoading } = trpc.persona.getCurrent.useQuery();

  useEffect(() => {
    if (persona && persona.status === "onboarding") {
      router.replace("/onboarding");
    }
  }, [persona, router]);

  if (isLoading || !persona || persona.status === "onboarding") {
    return (
      <div className={styles.wrapper}>
        <p className={styles.status}>{t("loading")}</p>
      </div>
    );
  }

  function handleCompleted() {
    utils.persona.getCurrent.invalidate();
    router.replace("/chat");
  }

  return (
    <div className={styles.wrapper}>
      <TrainingChatShell mode="supplement" onCompleted={handleCompleted} />
    </div>
  );
}
