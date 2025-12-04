/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         emailVerified:
 *           type: boolean
 *           description: Email verification status
 *         phone:
 *           type: string
 *           description: User's phone number
 *         phoneVerified:
 *           type: boolean
 *           description: Phone verification status
 *         profilePhoto:
 *           type: string
 *           description: Profile photo URL
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *         accountType:
 *           type: string
 *           enum: [free, pro, businesspro]
 *           description: Type of account
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         status:
 *           type: string
 *           example: error
 *         statusCode:
 *           type: integer
 *           example: 400
 */

export { };
