const nodemailer = require("nodemailer");

// Reusable transporter — works with Gmail (with an App Password), Brevo, or any SMTP provider.
// Set SMTP_HOST/SMTP_PORT for a custom provider; defaults to Gmail's SMTP if left blank.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"BookWise AI" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };