import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations("Layout");

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.brand}>{t("brand")}</span>
        <nav className={styles.nav}>
          <Link href="/chat" className={styles.navLink}>
            {t("navChat")}
          </Link>
          <Link href="/settings" className={styles.navLink}>
            {t("navSettings")}
          </Link>
          <SignOutButton />
        </nav>
      </header>
      <ConsentModal />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
