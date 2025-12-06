/**
 * @swagger
 * /v1/api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *
 * /v1/api/admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get system statistics (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

export {};
