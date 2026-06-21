import nodemailer from "nodemailer";
import { logger } from "./logger";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD env vars are required");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
}

export async function sendOtpEmail(toEmail: string, code: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Caktus Admin" <${GMAIL_USER}>`,
    to: toEmail,
    subject: "Caktus Admin — Your verification code",
    html: `
      <div style="font-family:monospace;background:#0a0a0f;color:#fff;padding:32px;border-radius:8px;max-width:480px">
        <h2 style="color:#a855f7;margin:0 0 16px">CAKTUS ADMIN</h2>
        <p style="color:#aaa;margin:0 0 24px">Your verification code for credential change:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#fff;background:#1a1a2e;padding:20px 24px;border-radius:6px;border:1px solid #a855f733;text-align:center">
          ${code}
        </div>
        <p style="color:#666;font-size:12px;margin:24px 0 0">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
  logger.info({ to: toEmail }, "OTP email sent");
}

export function isEmailConfigured(): boolean {
  return !!(GMAIL_USER && GMAIL_APP_PASSWORD);
}
