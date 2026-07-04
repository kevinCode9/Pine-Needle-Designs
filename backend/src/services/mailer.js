import { config, isLocalApp } from '../config/index.js';

const DEFAULT_PROD_EMAIL = 'onpinesandneedles@gmail.com';
const DEFAULT_SANDBOX_EMAIL = 'alnabidrm@gmail.com';

const emailSender = config.email.sender || (isLocalApp ? DEFAULT_SANDBOX_EMAIL : DEFAULT_PROD_EMAIL);
const emailRecipients = config.email.recipients || (isLocalApp ? DEFAULT_SANDBOX_EMAIL : DEFAULT_PROD_EMAIL);
const emailProvider = config.email.resendApiKey ? 'resend' : 'smtp';

export const mailerConfigured = emailProvider === 'resend'
  ? Boolean(config.email.resendFrom)
  : Boolean(emailSender && config.email.appPassword);

const normalizeRecipients = (recipients) => (Array.isArray(recipients)
  ? recipients
  : String(recipients).split(',').map((email) => email.trim()).filter(Boolean));

export const sendEmail = async ({ from: _from, to, ...message }) => {
  if (!mailerConfigured) {
    throw new Error('Mailer is not configured. Set RESEND_API_KEY in production or EMAIL_APP_PASSWORD locally.');
  }

  if (emailProvider === 'resend') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Pine Needle Designs <${config.email.resendFrom}>`,
        to: normalizeRecipients(to),
        ...message,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error (${response.status}): ${result.message || 'Unknown error'}`);
    }

    return { messageId: result.id };
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: emailSender,
      pass: config.email.appPassword,
    },
  });

  return transporter.sendMail({
    from: `"Pine Needle Designs" <${emailSender}>`,
    to,
    ...message,
  });
};

export const getEmailSender = () => emailSender;
export const getEmailRecipients = () => emailRecipients;

export const logMailerStatus = async () => {
  if (emailProvider === 'resend') {
    console.log('✅ Resend mailer configured (ready to send emails over HTTPS)');
    return;
  }

  if (mailerConfigured) {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: emailSender,
        pass: config.email.appPassword,
      },
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP mailer verified (ready to send emails)');
    } catch (err) {
      console.error('❌ SMTP mailer verification failed:', err);
    }
    return;
  }

  console.log('ℹ️ Mailer not configured; set RESEND_API_KEY in production or EMAIL_APP_PASSWORD locally.');
};
