import jwt from 'jsonwebtoken';
import { UserModel, OTPModel } from './auth.models';
import emailService from '../../services/emailService';

import config from '../../config/env';

/**
 * Auth Service - Business logic for authentication
 */
export class AuthService {
  /**
   * Generate a random 6-digit OTP
   */
  private static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate JWT token for user
   */
  private static generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, config.JWT_SECRET, { expiresIn: '30d' });
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string, userAgent?: string) {
    // Find user and select password
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Send login notification (async, don't wait)
    emailService
      .sendLoginNotificationEmail(email, user.name, {
        timestamp: new Date(),
        device: userAgent || 'Unknown Device',
      })
      .catch(err => console.error('Error sending login notification:', err));

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
      },
    };
  }

  /**
   * Signup with name, email, password, and optional accountType
   */
  static async signup(
    name: string,
    email: string,
    password: string,
    accountType?: 'free' | 'pro' | 'businesspro'
  ) {
    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const user = await UserModel.create({
      email,
      password, // Will be hashed by pre-save hook
      name,
      accountType: accountType || 'free',
      emailVerified: false,
    });

    // Send welcome email (async)
    emailService
      .sendWelcomeEmail(email, name)
      .catch(err => console.error('Error sending welcome email:', err));

    // Generate OTP for verification
    const otp = this.generateOtp();

    await OTPModel.deleteMany({ identifier: email, type: 'email' });
    await OTPModel.create({
      identifier: email,
      otp,
      type: 'email',
    });

    // Send verification email (async)
    emailService
      .sendOtpEmail(email, name, otp, 'verification')
      .catch(err => console.error('Error sending verification email:', err));

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
      },
    };
  }

  /**
   * Forgot password - send OTP to email
   */
  static async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });

    // Don't reveal user existence for security
    if (!user) {
      return {
        message: 'If an account exists with this email, you will receive a reset code.',
      };
    }

    // Generate OTP
    const otp = this.generateOtp();

    // Generate Token for link (optional, for future use)
    const resetToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '15m' });

    // Save to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Save OTP
    await OTPModel.deleteMany({ identifier: email, type: 'email' });
    await OTPModel.create({
      identifier: email,
      otp,
      type: 'email',
    });

    // Send email with OTP
    await emailService.sendOtpEmail(email, user.name, otp, 'reset');

    return {
      message: 'Password reset code sent to email',
    };
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(email: string, otp: string, newPassword: string) {
    // Verify OTP
    const otpDoc = await OTPModel.findOne({
      identifier: email,
      otp,
      type: 'email',
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new Error('Invalid or expired OTP');
    }

    // Find user
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Send confirmation email (async)
    emailService
      .sendPasswordResetSuccessEmail(email, user.name)
      .catch(err => console.error('Error sending reset success email:', err));

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(email: string, otp: string) {
    const otpDoc = await OTPModel.findOne({
      identifier: email,
      otp,
      type: 'email',
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Update user
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    user.emailVerified = true;
    await user.save();

    return {
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
      },
    };
  }

  /**
   * Send verification OTP to email
   */
  static async sendVerificationOtp(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    // Generate OTP
    const otp = this.generateOtp();

    await OTPModel.deleteMany({ identifier: email, type: 'email' });
    await OTPModel.create({
      identifier: email,
      otp,
      type: 'email',
    });

    // Send email
    await emailService.sendOtpEmail(email, user.name, otp, 'verification');

    return {
      message: 'Verification code sent to email',
    };
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
      },
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: { name?: string; email?: string; phone?: string }
  ) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.name) user.name = updates.name;

    if (updates.email && updates.email !== user.email) {
      // Check if email taken
      const existing = await UserModel.findOne({ email: updates.email });
      if (existing) {
        throw new Error('Email already in use');
      }
      user.email = updates.email;
      user.emailVerified = false;
    }

    if (updates.phone) user.phone = updates.phone;

    await user.save();

    return {
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
      },
    };
  }

  /**
   * Update profile photo
   */
  static async updateProfilePhoto(userId: string, photoUrl: string, fileId?: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profilePhoto = photoUrl;
    if (fileId) {
      user.profilePhotoFileId = fileId;
    }
    await user.save();

    return {
      message: 'Profile photo uploaded successfully',
      photoUrl,
    };
  }
}

export default AuthService;
