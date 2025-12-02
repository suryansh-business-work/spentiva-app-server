/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get summary statistics
 *     description: Get overall expense summary and statistics
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *
 * /api/analytics/by-category:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get expenses by category
 *     description: Group expenses by category with totals
 *     responses:
 *       200:
 *         description: Category breakdown retrieved
 *
 * /api/analytics/by-month:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get expenses by month
 *     description: Group expenses by month for trend analysis
 *     responses:
 *       200:
 *         description: Monthly breakdown retrieved
 *
 * /api/analytics/total:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get total expenses
 *     description: Calculate total expenses across all categories
 *     responses:
 *       200:
 *         description: Total calculated
 */

export { };
