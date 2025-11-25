// utils/mailer.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({ to, subject, html, text, attachments = [] }) {
  try {
    return resend.emails.send({
      from: process.env.MAIL_FROM,   // "Printmaania <orders@printmaania.com>"
      to,
      subject,
      html,
      text,
      attachments,
    });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
  }
}
