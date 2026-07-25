import nodemailer from "nodemailer";

/**
 * Sends an email using SMTP credentials configured in .env.
 * Used primarily for password reset and account notifications.
 * @param {{to: string, subject: string, html: string}} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
};

export default sendEmail;
