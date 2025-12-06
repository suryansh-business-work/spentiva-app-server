/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user identifier
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "+919876543210"
 *         emailVerified:
 *           type: boolean
 *           default: false
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *         accountType:
 *           type: string
 *           enum: [free, pro, businesspro]
 *           default: free
 *         profilePhoto:
 *           type: string
 *           example: "https://ik.imagekit.io/spentiva/users/profile.jpg"
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
 *           example: "Personal Expenses"
 *         type:
 *           type: string
 *           enum: [personal, business]
 *           example: personal
 *         description:
 *           type: string
 *           example: "Daily personal spending tracker"
 *         currency:
 *           type: string
 *           enum: [INR, USD, EUR, GBP]
 *           example: INR
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - trackerId
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Food & Dining"
 *         subcategories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: "Groceries"
 *           example:
 *             - id: "sub1"
 *               name: "Groceries"
 *             - id: "sub2"
 *               name: "Restaurants"
 *         trackerId:
 *           type: string
 *
 *     Expense:
 *       type: object
 *       required:
 *         - amount
 *         - category
 *         - subcategory
 *         - categoryId
 *         - paymentMethod
 *         - trackerId
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *           minimum: 0
 *           example: 1250.50
 *         category:
 *           type: string
 *           example: "Food & Dining"
 *         subcategory:
 *           type: string
 *           example: "Groceries"
 *         categoryId:
 *           type: string
 *         paymentMethod:
 *           type: string
 *           enum: [Cash, Credit Card, Debit Card, UPI, Net Banking, Wallet]
 *           example: "UPI"
 *         description:
 *           type: string
 *           example: "Weekly grocery shopping"
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
 *     UsageLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         trackerSnapshot:
 *           type: object
 *           properties:
 *             trackerId:
 *               type: string
 *             trackerName:
 *               type: string
 *             trackerType:
 *               type: string
 *             isDeleted:
 *               type: boolean
 *         messageRole:
 *           type: string
 *           enum: [user, assistant]
 *         messageContent:
 *           type: string
 *         tokenCount:
 *           type: number
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     Usage:
 *       type: object
 *       properties:
 *         overall:
 *           type: object
 *           properties:
 *             totalMessages:
 *               type: number
 *             totalTokens:
 *               type: number
 *             userMessages:
 *               type: number
 *             aiMessages:
 *               type: number
 *         byTracker:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               trackerId:
 *                 type: string
 *               trackerName:
 *                 type: string
 *               messageCount:
 *                 type: number
 *               tokenCount:
 *                 type: number
 *
 *     SupportTicket:
 *       type: object
 *       required:
 *         - type
 *         - subject
 *         - description
 *       properties:
 *         id:
 *           type: string
 *         ticketId:
 *           type: string
 *           example: "TKT-20231205-ABC123"
 *         type:
 *           type: string
 *           enum: [bug, feature, inquiry, other]
 *           example: "bug"
 *         subject:
 *           type: string
 *           example: "Unable to upload large files"
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, in-progress, resolved, closed]
 *           default: open
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *         userId:
 *           type: string
 *         userEmail:
 *           type: string
 *         userName:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         updates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, degraded]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptime:
 *           type: number
 *           description: Server uptime in seconds
 *         checks:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *               enum: [connected, disconnected]
 *         memory:
 *           type: object
 *           properties:
 *             used:
 *               type: string
 *             total:
 *               type: string
 */

export {};
