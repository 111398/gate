"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/browser-client";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { signInSchema } from "../model/schema";
import styles from "./AuthForm.module.scss";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ email: errors.email?.[0], password: errors.password?.[0] });
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Email"
        inputType="email"
        value={email}
        onChange={setEmail}
        errorMessage={fieldErrors.email}
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
        autoComplete="current-password"
      />
      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" isDisabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}
