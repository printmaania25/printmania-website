// utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// console.log("env:",process.env.MAIL_FROM);
// console.log("env:",process.env.MAIL_HOST);
// console.log("env:",process.env.MAIL_PORT);
// console.log("env:",process.env.MAIL_PASS);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false, // true for 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // optional: increase timeouts if needed
  // tls: { rejectUnauthorized: false }
   family: 4 
});

export async function sendMail({ to, subject, html, text, attachments = [] }) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return info;
}
