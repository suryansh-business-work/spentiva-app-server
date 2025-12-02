import { Request, Response } from 'express';
import AuthService from './auth.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import imagekitService from '../file-upload/imagekit-file-upload/imagekit.service';

/**
 * Auth Controllers - Request handlers using response-object.ts
 */

/**
 * Login Controller
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.login(email, password, userAgent);
    return successResponse(res, result, 'Login successful');
  } catch (error: any) {
    console.error('Error in login:', error);
    if (error.message === 'Invalid credentials') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Signup Controller
 */
export const signupController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const result = await AuthService.signup(name, email, password, role);
    return successResponse(res, result, 'Account created successfully. Please verify your email.');
  } catch (error: any) {
    console.error('Error in signup:', error);
    if (error.message === 'Email already registered') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Forgot Password Controller
 */
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await AuthService.forgotPassword(email);
    return successResponse(res, null, result.message);
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Reset Password Controller
 */
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await AuthService.resetPassword(email, otp, newPassword);
    return successResponse(res, null, result.message);
  } catch (error: any) {
    console.error('Error in reset password:', error);
    if (error.message === 'Invalid or expired OTP' || error.message === 'User not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Verify Email Controller
 */
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const result = await AuthService.verifyEmail(email, otp);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    console.error('Error in verify email:', error);
    if (error.message === 'Invalid or expired OTP' || error.message === 'User not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Send Verification OTP Controller
 */
export const sendVerificationOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await AuthService.sendVerificationOtp(email);
    return successResponse(res, null, result.message);
  } catch (error: any) {
    console.error('Error in send verification OTP:', error);
    if (error.message === 'User not found' || error.message === 'Email already verified') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get Current User Profile Controller
 */
export const getMeController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const result = await AuthService.getUserProfile(userId);
    return successResponse(res, result, 'User profile retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching user:', error);
    if (error.message === 'User not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Update Profile Controller
 */
export const updateProfileController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;

    const result = await AuthService.updateProfile(userId, { name, email, phone });
    return successResponse(res, result, result.message);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.message === 'User not found' || error.message === 'Email already in use') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Upload Profile Photo Controller
 */
export const uploadProfilePhotoController = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return badRequestResponse(res, null, 'No file uploaded');
    }

    const userId = req.user.userId;

    // Upload to ImageKit
    const uploadResult = await imagekitService.uploadFile(req.file, 'profile-photos');
    const photoUrl = uploadResult.url;

    // Update user profile with ImageKit URL
    const result = await AuthService.updateProfilePhoto(userId, photoUrl, uploadResult.fileId);
    return successResponse(res, result, result.message);
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    if (error.message === 'User not found') {
      return badRequestResponse(res, null, error.message);
    }
    if (error.message.includes('ImageKit')) {
      return errorResponse(res, error, 'File upload failed. Please try again.');
    }
    return errorResponse(res, error, 'Internal server error');
  }
};
