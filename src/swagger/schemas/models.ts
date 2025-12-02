/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - amount
 *         - category
 *         - subcategory
 *         - categoryId
 *         - paymentMethod
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *           minimum: 0
 *         category:
 *           type: string
 *         subcategory:
 *           type: string
 *         categoryId:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         description:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         trackerId:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Tracker:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - currency
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [personal, business]
 *         description:
 *           type: string
 *         currency:
 *           type: string
 *           enum: [INR, USD, EUR, GBP]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         subcategories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *         trackerId:
 *           type: string
 */

export { };
