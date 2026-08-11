import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignInForm, SignUpForm } from "@/features/auth-by-email";
import styles from "./AuthPage.module.scss";

export async function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const t = await getTranslations("Auth");
  const tLayout = await getTranslations("Layout");

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>{tLayout("brand")}</h1>
          <p className={styles.subtitle}>{isLogin ? t("loginSubtitle") : t("registerSubtitle")}</p>
        </div>

        {isLogin ? <SignInForm /> : <SignUpForm />}

        <p className={styles.switchLink}>
          {isLogin ? (
            <>
              {t("noAccount")} <Link href="/register">{t("signUpLink")}</Link>
            </>
          ) : (
            <>
              {t("haveAccount")} <Link href="/login">{t("signInLink")}</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
