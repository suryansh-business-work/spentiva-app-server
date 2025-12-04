/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin panel operations (Admin only)
 */

/**
 * @swagger
 * /v1/api/admin/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [today, yesterday, last7days, month, year, custom]
 *         description: Time filter for statistics
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom filter (required if filter=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom filter (required if filter=custom)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     filtered:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         free:
 *                           type: number
 *                         pro:
 *                           type: number
 *                         businesspro:
 *                           type: number
 *                     allTime:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         free:
 *                           type: number
 *                         pro:
 *                           type: number
 *                         businesspro:
 *                           type: number
 *                     filter:
 *                       type: string
 *                     dateRange:
 *                       type: object
 *                       nullable: true
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /v1/api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by role
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [free, pro, businesspro]
 *         description: Filter by account type
 *       - in: query
 *         name: emailVerified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserAdmin'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /v1/api/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserAdmin'
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 *
 *   put:
 *     summary: Update user role or account type
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               accountType:
 *                 type: string
 *                 enum: [free, pro, businesspro]
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/UserAdmin'
 *       400:
 *         description: Validation failed or email already in use
 *       403:
 *         description: Admin access required
 *
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     deletedUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAdmin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         emailVerified:
 *           type: boolean
 *         phoneVerified:
 *           type: boolean
 *         profilePhoto:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         accountType:
 *           type: string
 *           enum: [free, pro, businesspro]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export { };
