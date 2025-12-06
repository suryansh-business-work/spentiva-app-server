/**
 * @swagger
 * /v1/api/expense/parse:
 *   post:
 *     tags:
 *       - Expenses
 *     summary: Parse expense from natural language
 *     description: AI-powered expense parsing from text
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input
 *               - trackerId
 *             properties:
 *               input:
 *                 type: string
 *                 example: Spent 500 on groceries via UPI
 *               trackerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense parsed successfully
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/expense/chat:
 *   post:
 *     tags:
 *       - Expenses
 *     summary: Chat with AI assistant
 *     description: Conversational expense tracking
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
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *               trackerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat response generated
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/expense/all:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get all expenses
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: trackerId
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expenses retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/expense/{id}:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get expense by ID
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
 *         description: Expense found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags:
 *       - Expenses
 *     summary: Update expense
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
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Expenses
 *     summary: Delete expense
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
 *         description: Expense deleted
 *       401:
 *         description: Unauthorized
 */

export {};
