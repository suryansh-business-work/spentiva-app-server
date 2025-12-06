/**
 * @swagger
 * /v1/api/health:
 *   get:
 *     tags:
 *       - Health & Monitoring
 *     summary: Health check
 *     description: Check server status, database connectivity, and system health
 *     responses:
 *       200:
 *         description: Service healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service degraded
 *
 * /v1/api/ping:
 *   get:
 *     tags:
 *       - Health & Monitoring
 *     summary: Simple ping
 *     description: Quick endpoint to check if server is responding
 *     responses:
 *       200:
 *         description: Server is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: pong
 */

export {};
