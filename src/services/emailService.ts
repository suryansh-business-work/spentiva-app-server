import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';
import config from '../config/env';

// Init Nodemailer Transport with timeout settings
const transporter = nodemailer.createTransport({
  host: config?.SERVICES?.EMAIL?.NODEMAILER?.HOST,
  port: config?.SERVICES?.EMAIL?.NODEMAILER?.PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config?.SERVICES?.EMAIL?.NODEMAILER?.USER,
    pass: config?.SERVICES?.EMAIL?.NODEMAILER?.PASS,
  },
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000, // 5 seconds
  socketTimeout: 10000, // 10 seconds
  pool: true,
  maxConnections: 5,
  maxMessages: 10,
});

// Verify SMTP connection on startup
console.log('📧 [EMAIL CONFIG] Initializing email service...');
console.log('📧 [EMAIL CONFIG] Host:', config?.SERVICES?.EMAIL?.NODEMAILER?.HOST);
console.log('📧 [EMAIL CONFIG] Port:', config?.SERVICES?.EMAIL?.NODEMAILER?.PORT);
console.log('📧 [EMAIL CONFIG] User:', config?.SERVICES?.EMAIL?.NODEMAILER?.USER);

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ [EMAIL CONFIG] SMTP connection failed:', error.message);
  } else {
    console.log('✅ [EMAIL CONFIG] SMTP connection verified successfully!');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Nodemailer
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: options.from || `"Spentiva" <${config?.SERVICES?.EMAIL?.NODEMAILER?.USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL] Email sent successfully:', info.messageId);
  } catch (error: any) {
    console.error('❌ [EMAIL] Failed to send email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Compile MJML template file to HTML
 * Common function for all email templates
 */
const compileMjmlTemplate = (templatePath: string, variables: Record<string, any>): string => {
  try {
    let mjmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      mjmlContent = mjmlContent.replace(regex, variables[key]);
    });

    const result = mjml2html(mjmlContent);
    return result.html;
  } catch (error: any) {
    console.error(`Error compiling MJML template ${templatePath}:`, error.message);
    throw error;
  }
};

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/signup.mjml');
  const html = compileMjmlTemplate(templatePath, { name });

  await sendEmail({
    to,
    subject: 'Welcome to Spentiva! 🎉',
    html,
  });
};

/**
 * Send OTP for email verification or password reset
 */
export const sendOtpEmail = async (
  to: string,
  name: string,
  otp: string,
  type: 'verification' | 'reset'
): Promise<void> => {
  const subject =
    type === 'verification' ? 'Verify Your Email - Spentiva' : 'Reset Your Password - Spentiva';

  const templateFile = type === 'verification' ? 'signup-otp.mjml' : 'forgot-password.mjml';
  const templatePath = path.join(__dirname, `../templates/emails/${templateFile}`);
  const html = compileMjmlTemplate(templatePath, { name, otp });

  await sendEmail({ to, subject, html });
};

/**
 * Send password reset link email
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/forgot-password.mjml');
  const resetUrl = `https://app.spentiva.com/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
  const html = compileMjmlTemplate(templatePath, { name, resetUrl, otp: resetToken });

  await sendEmail({
    to,
    subject: 'Reset Your Password - Spentiva',
    html,
  });
};

/**
 * Send login notification email
 */
export const sendLoginNotificationEmail = async (
  to: string,
  name: string,
  loginInfo: {
    timestamp: Date;
    device?: string;
    location?: string;
  }
): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/login.mjml');
  const html = compileMjmlTemplate(templatePath, {
    name,
    timestamp: loginInfo.timestamp.toLocaleString(),
    device: loginInfo.device || 'Unknown Device',
  });

  await sendEmail({
    to,
    subject: 'New Login to Your Spentiva Account',
    html,
  });
};

/**
 * Send password reset success confirmation
 */
export const sendPasswordResetSuccessEmail = async (to: string, name: string): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/reset-password-success.mjml');
  const html = compileMjmlTemplate(templatePath, {
    name,
    email: to,
    timestamp: new Date().toLocaleString(),
  });

  await sendEmail({
    to,
    subject: 'Password Reset Successful - Spentiva',
    html,
  });
};

/**
 * Send signup OTP email
 */
export const sendSignupOtpEmail = async (to: string, otp: string): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/signup-otp.mjml');
  const html = compileMjmlTemplate(templatePath, { otp });

  await sendEmail({
    to,
    subject: 'Verify Your Email - Spentiva',
    html,
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendSignupOtpEmail,
  sendPasswordResetEmail,
  sendLoginNotificationEmail,
  sendPasswordResetSuccessEmail,
};
