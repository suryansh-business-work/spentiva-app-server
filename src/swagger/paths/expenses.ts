/**
 * @swagger
 * /api/expenses:
 *   post:
 *     tags:
 *       - Expenses
 *     summary: Create a new expense
 *     description: Log a new expense entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - subcategory
 *               - categoryId
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               category:
 *                 type: string
 *                 example: Food & Dining
 *               subcategory:
 *                 type: string
 *                 example: Groceries
 *               categoryId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 example: Credit Card
 *               description:
 *                 type: string
 *                 example: Weekly grocery shopping
 *               trackerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get all expenses
 *     description: Retrieve all expenses with optional filtering
 *     parameters:
 *       - in: query
 *         name: trackerId
 *         schema:
 *           type: string
 *         description: Filter by tracker ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *
 * /api/expenses/parse:
 *   post:
 *     tags:
 *       - Expenses
 *     summary: Parse expense from natural language
 *     description: Use AI to parse expense details from natural language message
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - trackerId
 *             properties:
 *               message:
 *                 type: string
 *                 example: Spent 500 on groceries using credit card
 *               trackerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *
 * /api/expenses/{id}:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get expense by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *   put:
 *     tags:
 *       - Expenses
 *     summary: Update an expense
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
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated
 *   delete:
 *     tags:
 *       - Expenses
 *     summary: Delete an expense
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense deleted
 */

export { };
