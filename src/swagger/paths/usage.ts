/**
 * @swagger
 * /v1/api/usage/overview:
 *   get:
 *     tags:
 *       - Usage & Analytics
 *     summary: Get usage overview
 *     description: Overall usage statistics for user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usage overview
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage/graphs:
 *   get:
 *     tags:
 *       - Usage & Analytics
 *     summary: Get usage graphs
 *     description: Graph data for overall usage
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Graph data retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage/tracker/{trackerId}/stats:
 *   get:
 *     tags:
 *       - Usage & Analytics
 *     summary: Get tracker statistics
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
 *         description: Tracker stats retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage/tracker/{trackerId}/graphs:
 *   get:
 *     tags:
 *       - Usage & Analytics
 *     summary: Get tracker graphs
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
 *         description: Tracker graphs retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/usage/tracker/{trackerId}/logs:
 *   get:
 *     tags:
 *       - Usage & Analytics
 *     summary: Get tracker logs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: trackerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Logs retrieved
 *       401:
 *         description: Unauthorized
 */

export {};
