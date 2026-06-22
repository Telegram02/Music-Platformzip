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

export async function sendCommissionNotification(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL ?? GMAIL_USER!;

  const messageHtml = opts.message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  await transporter.sendMail({
    from: `"Caktus Portfolio" <${GMAIL_USER}>`,
    to: adminEmail,
    replyTo: opts.email,
    subject: `${opts.subject}`,
    html: `
      <div style="font-family:monospace;background:#0a0a0f;color:#fff;padding:32px;max-width:600px;border-radius:8px">
        <h2 style="color:#a855f7;margin:0 0 4px;font-size:20px;letter-spacing:2px">CAKTUS PRODUCTIONS</h2>
        <p style="color:#666;margin:0 0 28px;font-size:12px;letter-spacing:1px">NEW COMMISSION REQUEST</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:8px 0;border-bottom:1px solid #1a1a2e;width:110px">From</td>
            <td style="color:#fff;padding:8px 0;border-bottom:1px solid #1a1a2e">${opts.name}</td>
          </tr>
          <tr>
            <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:8px 0;border-bottom:1px solid #1a1a2e">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #1a1a2e"><a href="mailto:${opts.email}" style="color:#a855f7">${opts.email}</a></td>
          </tr>
          <tr>
            <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:8px 0">Subject</td>
            <td style="color:#fff;padding:8px 0">${opts.subject}</td>
          </tr>
        </table>

        <div style="background:#111;border:1px solid #1a1a2e;border-radius:6px;padding:20px;font-size:14px;line-height:1.7;color:#ccc">
          ${messageHtml}
        </div>

        <p style="color:#333;font-size:11px;margin:24px 0 0">
          Reply directly to this email to respond to ${opts.name}.
        </p>
      </div>
    `,
  });

  logger.info({ to: adminEmail, from: opts.email }, "Commission notification sent");
}

export async function sendContactNotification(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL ?? GMAIL_USER!;

  const messageHtml = opts.message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const isCommission = opts.subject.startsWith("[Commission]");
  const label = isCommission ? "NEW COMMISSION REQUEST" : "NEW CONTACT MESSAGE";
  const accentColor = isCommission ? "#a855f7" : "#6366f1";

  await transporter.sendMail({
    from: `"Caktus Portfolio" <${GMAIL_USER}>`,
    to: adminEmail,
    replyTo: opts.email,
    subject: opts.subject || `New message from ${opts.name}`,
    html: `
      <div style="font-family:monospace;background:#0a0a0f;color:#fff;padding:32px;max-width:600px;border-radius:8px">
        <h2 style="color:${accentColor};margin:0 0 4px;font-size:20px;letter-spacing:2px">CAKTUS PRODUCTIONS</h2>
        <p style="color:#666;margin:0 0 28px;font-size:12px;letter-spacing:1px">${label}</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:8px 0;border-bottom:1px solid #1a1a2e;width:110px">From</td>
            <td style="color:#fff;padding:8px 0;border-bottom:1px solid #1a1a2e">${opts.name}</td>
          </tr>
          <tr>
            <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:8px 0;border-bottom:1px solid #1a1a2e">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #1a1a2e"><a href="mailto:${opts.email}" style="color:${accentColor}">${opts.email}</a></td>
          </tr>
          ${opts.subject ? `<tr>
            <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:8px 0">Subject</td>
            <td style="color:#fff;padding:8px 0">${opts.subject}</td>
          </tr>` : ""}
        </table>

        <div style="background:#111;border:1px solid #1a1a2e;border-radius:6px;padding:20px;font-size:14px;line-height:1.7;color:#ccc">
          ${messageHtml}
        </div>

        <p style="color:#333;font-size:11px;margin:24px 0 0">
          Reply directly to this email to respond to ${opts.name}.
        </p>
      </div>
    `,
  });

  logger.info({ to: adminEmail, from: opts.email }, "Contact notification sent");
}

export async function sendAutoReply(opts: {
  name: string;
  email: string;
  subject: string;
}): Promise<void> {
  const transporter = getTransporter();
  const isCommission = opts.subject.startsWith("[Commission]");
  const replySubject = `Re: ${opts.subject || "Your message to Caktus Productions"}`;

  await transporter.sendMail({
    from: `"Caktus Productions" <${GMAIL_USER}>`,
    to: opts.email,
    subject: replySubject,
    html: `
      <div style="font-family:monospace;background:#0a0a0f;color:#fff;padding:32px;max-width:560px;border-radius:8px">
        <h2 style="color:#a855f7;margin:0 0 4px;font-size:20px;letter-spacing:2px">CAKTUS PRODUCTIONS</h2>
        <p style="color:#666;margin:0 0 28px;font-size:11px;letter-spacing:1px;text-transform:uppercase">Message Received</p>

        <p style="color:#ddd;font-size:15px;line-height:1.7;margin:0 0 16px">
          Hey ${opts.name},
        </p>
        <p style="color:#aaa;font-size:14px;line-height:1.8;margin:0 0 16px">
          ${isCommission
            ? "Thanks for reaching out about a commission — I'll review the details and get back to you within <strong style=\"color:#fff\">1–3 business days</strong> to discuss your project."
            : "Thanks for your message — I've received it and will get back to you within <strong style=\"color:#fff\">1–3 business days</strong>."
          }
        </p>
        <p style="color:#aaa;font-size:14px;line-height:1.8;margin:0 0 28px">
          In the meantime, feel free to check out my work or connect with me on social media.
        </p>

        <div style="border-top:1px solid #1a1a2e;padding-top:20px">
          <p style="color:#555;font-size:12px;margin:0;line-height:1.6">
            — Caktus Productions<br>
            <span style="color:#333">Do not reply directly to this email — use the address you contacted me from.</span>
          </p>
        </div>
      </div>
    `,
  });

  logger.info({ to: opts.email }, "Auto-reply sent");
}

export function isEmailConfigured(): boolean {
  return !!(GMAIL_USER && GMAIL_APP_PASSWORD);
}
