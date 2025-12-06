import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';
import config from '../config/env';
import { logger } from '../utils/logger';

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
logger.info('Email service initializing', {
  host: config?.SERVICES?.EMAIL?.NODEMAILER?.HOST,
  port: config?.SERVICES?.EMAIL?.NODEMAILER?.PORT,
  user: config?.SERVICES?.EMAIL?.NODEMAILER?.USER,
});

transporter.verify(error => {
  if (error) {
    logger.error('SMTP connection failed', { error: error.message });
  } else {
    logger.info('SMTP connection verified successfully');
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

    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, _success: any) => {
        if (error) {
          logger.error('Failed to send email', { error: error.message, to: options.to });
          return reject(new Error(`Failed to send email: ${error.message}`));
        }
        logger.info('Email sent successfully', { messageId: _success.messageId, to: options.to });
        resolve();
      });
    });
  } catch (error: any) {
    logger.error('Email send failed', { error: error.message });
    throw error; // Re-throw the error caught from the promise
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
      // Match both {{ key }} (with spaces) and {{key}} (without spaces)
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      mjmlContent = mjmlContent.replace(regex, variables[key]);
    });

    const result = mjml2html(mjmlContent);
    return result.html;
  } catch (error: any) {
    logger.error('MJML template compilation failed', { templatePath, error: error.message });
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

/**
 * Send support ticket confirmation email to user
 */
export const sendSupportTicketUserEmail = async (
  to: string,
  ticketDetails: {
    ticketId: string;
    userName: string;
    type: string;
    subject: string;
  }
): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/support-ticket-user.mjml');
  const html = compileMjmlTemplate(templatePath, {
    userName: ticketDetails.userName,
    ticketId: ticketDetails.ticketId,
    ticketType: ticketDetails.type,
    subject: ticketDetails.subject,
  });

  await sendEmail({
    to,
    subject: `Support Ticket Created - ${ticketDetails.ticketId}`,
    html,
  });
};

/**
 * Send support ticket notification email to agent/support team
 */
export const sendSupportTicketAgentEmail = async (ticketDetails: {
  ticketId: string;
  userName: string;
  userEmail: string;
  type: string;
  subject: string;
  description: string;
  createdAt: string;
}): Promise<void> => {
  const templatePath = path.join(__dirname, '../templates/emails/support-ticket-agent.mjml');
  const html = compileMjmlTemplate(templatePath, {
    ticketId: ticketDetails.ticketId,
    userName: ticketDetails.userName,
    userEmail: ticketDetails.userEmail,
    ticketType: ticketDetails.type,
    subject: ticketDetails.subject,
    description: ticketDetails.description,
    createdAt: ticketDetails.createdAt,
  });

  await sendEmail({
    to: 'suryansh.personal1@gmail.com', // Support email
    subject: `New Support Ticket - ${ticketDetails.ticketId}`,
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
  sendSupportTicketUserEmail,
  sendSupportTicketAgentEmail,
};
