/**
 * @swagger
 * /v1/api/usage-logs:
 *   get:
 *     tags:
 *       - Usage & Analytics
 *     summary: Get all usage logs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: trackerId
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Logs retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage-logs/cleanup:
 *   delete:
 *     tags:
 *       - Usage & Analytics
 *     summary: Delete old logs
 *     description: Cleanup logs older than specified days
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: daysOld
 *         in: query
 *         schema:
 *           type: integer
 *           default: 90
 *     responses:
 *       200:
 *         description: Logs deleted
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage-logs/tracker/{trackerId}:
 *   delete:
 *     tags:
 *       - Usage & Analytics
 *     summary: Delete logs by tracker
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: trackerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracker logs deleted
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage-logs/user:
 *   delete:
 *     tags:
 *       - Usage & Analytics
 *     summary: Delete all user logs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All user logs deleted
 *       401:
 *         description: Unauthorized
 */

export {};
