const nodemailer = require('nodemailer');

// Load configuration from environment
const EMAIL_USER = process.env.EMAIL_USER || 'abssdtrust@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || `ABSSD Trust <${EMAIL_USER}>`;

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
} else {
  console.warn(
    'Email credentials not configured. Email sending will be disabled.',
  );
}

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }

  const msg = {
    from: EMAIL_FROM,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  const info = await transporter.sendMail(msg);
  return info;
};

module.exports = {
  sendMail,
};
