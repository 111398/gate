"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/browser-client";
import { Button } from "@/shared/ui/Button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="secondary" onPress={handleSignOut}>
      Выйти
    </Button>
  );
}
