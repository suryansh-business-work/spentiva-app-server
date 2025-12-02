/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get predefined categories
 *     description: Get all predefined expense categories and payment methods
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: object
 *                 paymentMethods:
 *                   type: array
 *                   items:
 *                     type: string
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create custom category
 *     security:
 *       - BearerAuth: []
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
 *                   type: string
 *               trackerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *
 * /api/categories/custom:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get custom categories
 *     description: Get all custom categories from database
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Custom categories retrieved
 *
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */

export { };
