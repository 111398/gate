import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth-by-email";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import { ConsentModal } from "@/widgets/consent-modal";
import styles from "./layout.module.scss";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.brand}>Gate</span>
        <SignOutButton />
      </header>
      <ConsentModal />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
