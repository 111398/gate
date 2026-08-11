import { z } from "zod";
import { isAllowedEmailDomain } from "@/shared/config/email";

type ValidationMessages = (key: string) => string;

export function createSignUpSchema(t: ValidationMessages) {
  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .email(t("emailInvalid"))
      .refine(isAllowedEmailDomain, {
        message: t("emailDomainNotAllowed"),
      }),
    password: z.string().min(8, t("passwordTooShort")),
  });
}

export function createSignInSchema(t: ValidationMessages) {
  return z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export type SignUpInput = z.infer<ReturnType<typeof createSignUpSchema>>;
export type SignInInput = z.infer<ReturnType<typeof createSignInSchema>>;
