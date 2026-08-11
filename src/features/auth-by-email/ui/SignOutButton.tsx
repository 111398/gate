"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/browser-client";
import { Button } from "@/shared/ui/Button";

export function SignOutButton() {
  const t = useTranslations("Layout");
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="secondary" onPress={handleSignOut}>
      {t("signOut")}
    </Button>
  );
}
