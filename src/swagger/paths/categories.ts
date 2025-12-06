/**
 * @swagger
 * /v1/api/category/all:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Get all categories for a specific tracker
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: trackerId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/category/create:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create new category
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - trackerId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Food & Dining
 *               trackerId:
 *                 type: string
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Groceries
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/category/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 */

export {};
