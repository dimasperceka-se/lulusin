import emailjs from "@emailjs/browser";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const VERIFY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_VERIFY_TEMPLATE_ID;
const RESET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID;
const APP_URL = import.meta.env.VITE_PUBLIC_APP_URL ?? window.location.origin;
const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Lulusin";

export const emailjsConfigured = !!(PUBLIC_KEY && SERVICE_ID && VERIFY_TEMPLATE_ID && RESET_TEMPLATE_ID);

if (PUBLIC_KEY) {
  emailjs.init({ publicKey: PUBLIC_KEY });
}

export async function sendVerificationEmail(args: {
  toEmail: string;
  toName: string;
  token: string;
}) {
  if (!emailjsConfigured) throw new Error("EmailJS not configured. Cek .env (VITE_EMAILJS_*).");
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(args.token)}`;
  return emailjs.send(SERVICE_ID, VERIFY_TEMPLATE_ID, {
    to_email: args.toEmail,
    to_name: args.toName,
    link,
    app_name: APP_NAME,
  });
}

export async function sendPasswordResetEmail(args: {
  toEmail: string;
  toName: string;
  token: string;
}) {
  if (!emailjsConfigured) throw new Error("EmailJS not configured. Cek .env (VITE_EMAILJS_*).");
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(args.token)}`;
  return emailjs.send(SERVICE_ID, RESET_TEMPLATE_ID, {
    to_email: args.toEmail,
    to_name: args.toName,
    link,
    app_name: APP_NAME,
  });
}
