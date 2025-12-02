import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import {
  loginController,
  signupController,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
  sendVerificationOtpController,
  getMeController,
  updateProfileController,
  uploadProfilePhotoController,
} from './auth.controllers';
import {
  validateDto,
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  SendVerificationOtpDto,
  UpdateProfileDto,
} from './auth.validators';
import { UserModel, OTPModel } from './auth.models';
import { authenticateMiddleware } from '../../middleware/auth.middleware';
import config from '../../config/env';

const router = express.Router();

// Configure multer for file uploads with memory storage (for ImageKit)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ============ MAIN AUTH ROUTES ============

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', validateDto(LoginDto), loginController);

/**
 * @route   POST /api/auth/signup
 * @desc    Signup with name, email, password, and optional role
 * @access  Public
 */
router.post('/signup', validateDto(SignupDto), signupController);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset OTP to email
 * @access  Public
 */
router.post('/forgot-password', validateDto(ForgotPasswordDto), forgotPasswordController);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', validateDto(ResetPasswordDto), resetPasswordController);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP
 * @access  Public
 */
router.post('/verify-email', validateDto(VerifyEmailDto), verifyEmailController);

/**
 * @route   POST /api/auth/send-verification-otp
 * @desc    Send verification OTP to email
 * @access  Public
 */
router.post(
  '/send-verification-otp',
  validateDto(SendVerificationOtpDto),
  sendVerificationOtpController
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateMiddleware, getMeController);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateMiddleware,
  validateDto(UpdateProfileDto),
  updateProfileController
);

/**
 * @route   POST /api/auth/profile-photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post(
  '/profile-photo',
  authenticateMiddleware,
  upload.single('photo'),
  uploadProfilePhotoController
);

// ============ LEGACY COMPATIBILITY ROUTES ============

/**
 * @route   POST /api/auth/send-otp
 * @desc    Legacy route for sending OTP (supports email)
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Treat 'phone' as identifier (could be email)
    const identifier = phone;
    const isEmail = identifier && identifier.includes('@');

    if (!identifier) {
      return res.status(400).json({ error: 'Phone/Email is required' });
    }

    if (isEmail) {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await OTPModel.deleteMany({ identifier, type: 'email' });
      await OTPModel.create({
        identifier,
        otp,
        type: 'email',
      });

      // Send email
      const user = await UserModel.findOne({ email: identifier });
      const emailService = (await import('../../services/emailService')).default;

      try {
        if (user) {
          await emailService.sendOtpEmail(identifier, user.name, otp, 'verification');
        } else {
          await emailService.sendSignupOtpEmail(identifier, otp);
        }
      } catch (emailError) {
        console.error('Error sending email OTP:', emailError);
      }

      return res.json({
        message: 'OTP sent to email',
        otpId: 'compat-id',
        devOtp: otp, // Return actual OTP for development
      });
    } else {
      return res.status(400).json({ error: 'Please use email address instead of phone number' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Legacy route for verifying OTP (supports email)
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, accountType } = req.body;
    const identifier = phone;
    const isEmail = identifier && identifier.includes('@');

    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP are required' });
    }

    if (isEmail) {
      // Verify Email OTP
      const otpDoc = await OTPModel.findOne({
        identifier,
        otp,
        type: 'email',
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (!otpDoc) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      otpDoc.verified = true;
      await otpDoc.save();

      // Find or Create User
      let user = await UserModel.findOne({ email: identifier });

      if (!user) {
        // Signup
        if (!name) {
          return res.status(400).json({ error: 'Name is required for signup' });
        }

        // Generate random password for OTP-based signup
        const randomPassword =
          Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        user = await UserModel.create({
          email: identifier,
          name,
          password: randomPassword,
          emailVerified: true,
          accountType: accountType || 'personal',
        });

        // Send welcome email
        const emailService = (await import('../../services/emailService')).default;
        try {
          await emailService.sendWelcomeEmail(identifier, name);
        } catch (e) {
          console.error('Error sending welcome email:', e);
        }
      } else {
        // Login
        user.emailVerified = true;
        await user.save();

        // Send login notification
        const emailService = (await import('../../services/emailService')).default;
        try {
          emailService.sendLoginNotificationEmail(identifier, user.name, {
            timestamp: new Date(),
            device: req.headers['user-agent'] || 'Unknown Device',
          });
        } catch (e) {
          console.error('Error sending login notification:', e);
        }
      }

      // Generate Token
      const token = jwt.sign({ userId: user._id, email: user.email }, config.JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.json({
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          profilePhoto: user.profilePhoto,
          accountType: user.accountType,
        },
      });
    } else {
      return res.status(400).json({ error: 'Please use email address' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
