import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { badRequestResponse } from '../../utils/response-object';

/**
 * Login DTO
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

/**
 * Signup DTO
 */
export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsOptional()
  @IsString()
  role?: string; // Will be mapped to accountType

  @IsOptional()
  @IsString()
  accountType?: string;
}

/**
 * Forgot Password DTO
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

/**
 * Reset Password DTO
 */
export class ResetPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp!: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword!: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @ValidateIf(o => o.newPassword !== o.confirmPassword)
  confirmPassword!: string;
}

/**
 * Verify Email DTO
 */
export class VerifyEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp!: string;
}

/**
 * Send Verification OTP DTO
 */
export class SendVerificationOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

/**
 * Update Profile DTO
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

/**
 * Validation Middleware Factory
 */
export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToClass(dtoClass, req.body);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        const errorMessages = errors
          .map(error => {
            return Object.values(error.constraints || {}).join(', ');
          })
          .join('; ');

        return badRequestResponse(res, errors, errorMessages);
      }

      // Custom validation for password confirmation
      if (dtoInstance instanceof ResetPasswordDto) {
        if (dtoInstance.newPassword !== dtoInstance.confirmPassword) {
          return badRequestResponse(res, null, 'Passwords do not match');
        }
      }

      // Attach validated DTO to request
      req.body = dtoInstance;
      next();
    } catch (error) {
      return badRequestResponse(res, error, 'Validation error');
    }
  };
}
