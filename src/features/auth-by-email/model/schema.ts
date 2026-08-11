import { z } from "zod";
import { isAllowedEmailDomain } from "@/shared/config/email";

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "Введите email")
    .email("Некорректный email")
    .refine(isAllowedEmailDomain, {
      message: "Регистрация доступна только с email на домене .ru",
    }),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
});

export const signInSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
