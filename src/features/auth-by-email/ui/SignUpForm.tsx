"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/browser-client";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { signUpSchema } from "../model/schema";
import styles from "./AuthForm.module.scss";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = signUpSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ email: errors.email?.[0], password: errors.password?.[0] });
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp(parsed.data);

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setPendingConfirmationEmail(parsed.data.email);
  }

  if (pendingConfirmationEmail) {
    return (
      <p className={styles.notice} role="status">
        Мы отправили письмо для подтверждения на {pendingConfirmationEmail}. Перейдите по ссылке из
        письма, затем войдите в аккаунт.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Email"
        inputType="email"
        value={email}
        onChange={setEmail}
        errorMessage={fieldErrors.email}
        description="Только на домене .ru"
        isRequired
        autoComplete="email"
      />
      <TextField
        label="Пароль"
        inputType="password"
        value={password}
        onChange={setPassword}
        errorMessage={fieldErrors.password}
        isRequired
        autoComplete="new-password"
      />
      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" isDisabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </Button>
    </form>
  );
}
