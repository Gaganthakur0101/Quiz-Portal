const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

exports.sendMail = (opts) => {
  const mail = {
    from: process.env.SMTP_USER,
    ...opts
  };
  return transporter.sendMail(mail);
};
