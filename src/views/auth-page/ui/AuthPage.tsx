import Link from "next/link";
import { SignInForm, SignUpForm } from "@/features/auth-by-email";
import styles from "./AuthPage.module.scss";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>Gate</h1>
          <p className={styles.subtitle}>
            {isLogin ? "Войдите в аккаунт" : "Регистрация доступна только с email на домене .ru"}
          </p>
        </div>

        {isLogin ? <SignInForm /> : <SignUpForm />}

        <p className={styles.switchLink}>
          {isLogin ? (
            <>
              Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
            </>
          ) : (
            <>
              Уже есть аккаунт? <Link href="/login">Войти</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
