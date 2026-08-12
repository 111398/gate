import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SignOutButton } from "@/features/auth-by-email";
import { LocaleSwitch } from "@/features/switch-locale";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";
import type { Locale } from "@/shared/config/i18n";
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
  const locale = await getLocale();

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
          <LocaleSwitch locale={locale as Locale} />
          <SignOutButton />
        </nav>
      </header>
      <ConsentModal />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
