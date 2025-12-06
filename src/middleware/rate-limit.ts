import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { badRequestResponse } from '../utils/response-object';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    statusCode: 429,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method,
    });
    return badRequestResponse(
      res,
      null,
      'Too many requests from this IP, please try again after 15 minutes'
    );
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    statusCode: 429,
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method,
    });
    return badRequestResponse(
      res,
      null,
      'Too many authentication attempts, please try again after 15 minutes'
    );
  },
});

// Strict rate limiter for OTP endpoints
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 OTP requests per 10 minutes
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after 10 minutes',
    statusCode: 429,
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('OTP rate limit exceeded', {
      ip: req.ip,
      endpoint: req.originalUrl,
      phone: req.body?.phone,
    });
    return badRequestResponse(
      res,
      null,
      'Too many OTP requests, please try again after 10 minutes'
    );
  },
});

// Moderate rate limiter for expense parsing (AI calls)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please slow down',
    statusCode: 429,
  },
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', {
      ip: req.ip,
      endpoint: req.originalUrl,
      userId: req.body?.userId,
    });
    return badRequestResponse(res, null, 'Too many AI requests, please slow down');
  },
});
