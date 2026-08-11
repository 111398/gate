import "server-only";
import { Resend } from "resend";
import { FEEDBACK_TYPE_LABELS, type FeedbackType } from "@/shared/config/feedback";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSupportEmail({
  type,
  message,
  userEmail,
}: {
  type: FeedbackType;
  message: string;
  userEmail: string;
}): Promise<void> {
  const supportEmail = process.env.SUPPORT_EMAIL;
  if (!supportEmail) return;

  await resend.emails.send({
    from: "Gate <onboarding@resend.dev>",
    to: supportEmail,
    replyTo: userEmail,
    subject: `[Gate] ${FEEDBACK_TYPE_LABELS[type]} от ${userEmail}`,
    text: message,
  });
}
