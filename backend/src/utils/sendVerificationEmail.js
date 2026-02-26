const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Gmail SMTP works with TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Quiz App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Click the link to verify your account:</p>
        <a href="${verifyUrl}" style="color: blue;">Verify Account</a>
      `,
    });

    console.log("Verification email sent →", email);

  } catch (err) {
    console.error("Email send error:", err);
  }
};
