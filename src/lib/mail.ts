import "server-only";
import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { APP_NAME } from "@/lib/app-config";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
};

export function isMailerConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

/** Reset UI and sendResetPassword may run in dev without a provider. */
export function isPasswordResetEnabled(): boolean {
  return isMailerConfigured() || env.NODE_ENV !== "production";
}

export async function send(message: MailMessage): Promise<void> {
  if (env.RESEND_API_KEY) {
    const from = env.EMAIL_FROM ?? `${APP_NAME} <noreply@localhost>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      log.error("mail.send_failed", { email: message.to });
      throw new Error(`mailer_failed:${res.status}:${body.slice(0, 120)}`);
    }
    log.info("mail.sent", { email: message.to });
    return;
  }

  if (env.NODE_ENV === "production") {
    throw new Error("mailer_not_configured");
  }

  log.info("mail.dev_skip", { email: message.to, action: message.subject });
}
