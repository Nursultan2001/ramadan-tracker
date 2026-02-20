import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: "Ramadan Challenge <onboarding@resend.dev>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }

    console.log(`[Email] Successfully sent email to ${payload.to}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send email:", err);
    return false;
  }
}