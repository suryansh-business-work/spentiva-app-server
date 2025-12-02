/**
 * @swagger
 * /api/usage/overall:
 *   get:
 *     tags:
 *       - Usage
 *     summary: Get overall usage statistics
 *     description: Retrieve comprehensive usage statistics for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTrackers:
 *                       type: integer
 *                       example: 5
 *                     totalExpenses:
 *                       type: integer
 *                       example: 127
 *                     totalAmount:
 *                       type: number
 *                       example: 15420.50
 *                     activeTrackers:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 *
 * /api/usage/tracker/{trackerId}:
 *   get:
 *     tags:
 *       - Usage
 *     summary: Get usage for specific tracker
 *     description: Retrieve usage statistics for a specific tracker
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracker ID
 *     responses:
 *       200:
 *         description: Tracker usage retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trackerId:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     trackerName:
 *                       type: string
 *                       example: Personal Expenses
 *                     totalExpenses:
 *                       type: integer
 *                       example: 45
 *                     totalAmount:
 *                       type: number
 *                       example: 5420.50
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-02T14:30:00Z
 *       404:
 *         description: Tracker not found
 *       401:
 *         description: Unauthorized
 *
 * /api/usage/tracker/{trackerId}/logs:
 *   get:
 *     tags:
 *       - Usage
 *     summary: Get logs for specific tracker
 *     description: Retrieve activity logs for a specific tracker
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracker ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip for pagination
 *     responses:
 *       200:
 *         description: Tracker logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                             example: expense_created
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-12-02T14:30:00Z
 *                           details:
 *                             type: object
 *       404:
 *         description: Tracker not found
 *       401:
 *         description: Unauthorized
 */

export { };
