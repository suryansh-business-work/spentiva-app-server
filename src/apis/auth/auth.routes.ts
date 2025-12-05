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
import { successResponse, badRequestResponse, errorResponse } from '../../utils/response-object';

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
 * @route   POST /v1/api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', validateDto(LoginDto), loginController);

/**
 * @route   POST /v1/api/auth/signup
 * @desc    Signup with name, email, password, and optional role
 * @access  Public
 */
router.post('/signup', validateDto(SignupDto), signupController);

/**
 * @route   POST /v1/api/auth/forgot-password
 * @desc    Send password reset OTP to email
 * @access  Public
 */
router.post('/forgot-password', validateDto(ForgotPasswordDto), forgotPasswordController);

/**
 * @route   POST  /v1/api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', validateDto(ResetPasswordDto), resetPasswordController);

/**
 * @route   POST  /v1/api/auth/verify-email
 * @desc    Verify email with OTP
 * @access  Public
 */
router.post('/verify-email', validateDto(VerifyEmailDto), verifyEmailController);

/**
 * @route   POST /v1/api/auth/send-verification-otp
 * @desc    Send verification OTP to email
 * @access  Public
 */
router.post(
  '/send-verification-otp',
  validateDto(SendVerificationOtpDto),
  sendVerificationOtpController
);

/**
 * @route   GET /v1/api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateMiddleware, getMeController);

/**
 * @route   PUT /v1/api/auth/profile
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
 * @route   POST /v1/api/auth/profile-photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post(
  '/profile-photo',
  authenticateMiddleware,
  upload.single('photo'),
  uploadProfilePhotoController
);

export default router;
