const nodemailer = require("nodemailer");

/**
 * utils/sendEmail.js
 *
 * Thin wrapper around Nodemailer so the rest of the app just calls
 * sendEmail({ to, subject, html }).
 *
 * If EMAIL_HOST / EMAIL_USER / EMAIL_PASS aren't configured (e.g. while
 * developing locally without SMTP credentials), we don't want the whole
 * forgot-password flow to break — so we fall back to logging the email
 * to the console instead of throwing. This makes it easy to grab the
 * reset link during local development/testing.
 */
const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.log("\n📧  EMAIL NOT CONFIGURED — printing message instead of sending it:");
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body:\n${html}\n`);
    return { delivered: false, reason: "SMTP not configured" };
  }

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `"JanSewa" <no-reply@jansewa.gov.np>`,
    to,
    subject,
    html,
  });

  return { delivered: true };
};

module.exports = sendEmail;
