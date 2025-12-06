/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred"
 *         error:
 *           type: object
 *       example:
 *         success: false
 *         message: "Internal server error"
 *         error: {}
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *       example:
 *         success: false
 *         message: "Validation failed"
 *         errors:
 *           - field: "email"
 *             message: "Invalid email format"
 *
 *     PaginationQuery:
 *       type: object
 *       properties:
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 100
 *           example: 50
 *         offset:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         limit:
 *           type: integer
 *         offset:
 *           type: integer
 *         hasMore:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             type: object
 *
 *     DateRangeFilter:
 *       type: object
 *       properties:
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2023-12-31T23:59:59.999Z"
 */

export {};
