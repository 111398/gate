"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/browser-client";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { TextField } from "@/shared/ui/TextField";
import { createSignUpSchema } from "../model/schema";
import styles from "./AuthForm.module.scss";

export function SignUpForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Auth.validation");
  const tConsents = useTranslations("Consents");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTrainingData, setAgreedTrainingData] = useState(false);
  const [agreedNotReplacement, setAgreedNotReplacement] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Кнопка создания аккаунта неактивна, пока не заполнены оба поля и не отмечены
  // оба согласия. Это только UX-подсказка — реальная защита от сырого запроса в
  // обход формы стоит на сервере (см. validate_signup_consents в 0005_consents_at_registration.sql).
  const isFormReady = email.trim() !== "" && password.trim() !== "" && agreedTrainingData && agreedNotReplacement;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = createSignUpSchema(tValidation).safeParse({ email, password });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ email: errors.email?.[0], password: errors.password?.[0] });
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          consent_training_data: agreedTrainingData,
          consent_not_a_replacement: agreedNotReplacement,
        },
      },
    });

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
        {t("confirmationSent", { email: pendingConfirmationEmail })}
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label={t("emailLabel")}
        inputType="email"
        value={email}
        onChange={setEmail}
        errorMessage={fieldErrors.email}
        description={t("emailDescription")}
        isRequired
        autoComplete="email"
      />
      <TextField
        label={t("passwordLabel")}
        inputType="password"
        value={password}
        onChange={setPassword}
        errorMessage={fieldErrors.password}
        isRequired
        autoComplete="new-password"
      />

      <div className={styles.consents}>
        <Checkbox isSelected={agreedTrainingData} onChange={setAgreedTrainingData}>
          <strong>{tConsents("types.training_data.title")}.</strong> {tConsents("types.training_data.body")}
        </Checkbox>
        <Checkbox isSelected={agreedNotReplacement} onChange={setAgreedNotReplacement}>
          <strong>{tConsents("types.not_a_replacement.title")}.</strong>{" "}
          {tConsents("types.not_a_replacement.body")}
        </Checkbox>
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" isDisabled={!isFormReady || isSubmitting} className={styles.submit}>
        {isSubmitting ? t("signUpSubmitting") : t("signUpSubmit")}
      </Button>
    </form>
  );
}
