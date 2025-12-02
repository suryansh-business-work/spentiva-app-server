/**
 * @swagger
 * /api/usage-logs:
 *   get:
 *     tags:
 *       - Usage Logs
 *     summary: Get all usage logs
 *     description: Retrieve usage logs with optional filtering and pagination
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trackerId
 *         schema:
 *           type: string
 *         description: Filter logs by tracker ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [expense_created, expense_updated, expense_deleted, tracker_created, tracker_updated]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date (YYYY-MM-DD)
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
 *         description: Usage logs retrieved successfully
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
 *                           id:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           userId:
 *                             type: string
 *                             example: 507f191e810c19729de860ea
 *                           trackerId:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439012
 *                           action:
 *                             type: string
 *                             example: expense_created
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-12-02T14:30:00Z
 *                           details:
 *                             type: object
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - Usage Logs
 *     summary: Create a new usage log
 *     description: Manually create a usage log entry
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackerId
 *               - action
 *             properties:
 *               trackerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               action:
 *                 type: string
 *                 enum: [expense_created, expense_updated, expense_deleted, tracker_created, tracker_updated]
 *                 example: expense_created
 *               details:
 *                 type: object
 *                 description: Additional details about the action
 *     responses:
 *       201:
 *         description: Usage log created successfully
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
 *                     log:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /api/usage-logs/cleanup:
 *   delete:
 *     tags:
 *       - Usage Logs
 *     summary: Delete old usage logs
 *     description: Cleanup old usage logs (maintenance operation, typically for logs older than 90 days)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysOld
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Delete logs older than this many days
 *     responses:
 *       200:
 *         description: Old logs deleted successfully
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
 *                   example: Deleted 345 old usage logs
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 345
 *       401:
 *         description: Unauthorized
 */

export { };
