import { Router } from 'express';
import { healthCheck, ping } from './health.controllers';

const router = Router();

/**
 * @route   GET /v1/api/health
 * @desc    Health check endpoint with database verification
 * @access  Public
 */
router.get('/health', healthCheck);

/**
 * @route   GET /v1/api/ping
 * @desc    Quick ping endpoint
 * @access  Public
 */
router.get('/ping', ping);

export default router;
