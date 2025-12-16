import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

// Verify transporter connectivity/auth at startup — useful diagnostic.
transporter
  .verify()
  .catch((err) => console.error("Mailer verify failed:", err));

// keep default export for existing default imports
export default transporter;
