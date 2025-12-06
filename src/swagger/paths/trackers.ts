/**
 * @swagger
 * /v1/api/tracker/all:
 *   get:
 *     tags:
 *       - Trackers
 *     summary: Get all trackers
 *     description: Retrieve all trackers for authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Trackers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trackers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tracker'
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/tracker/create:
 *   post:
 *     tags:
 *       - Trackers
 *     summary: Create new tracker
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
 *               - type
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *                 example: Personal Expenses
 *               type:
 *                 type: string
 *                 enum: [personal, business]
 *                 example: personal
 *               description:
 *                 type: string
 *                 example: Daily personal spending
 *               currency:
 *                 type: string
 *                 enum: [INR, USD, EUR, GBP]
 *                 example: INR
 *     responses:
 *       201:
 *         description: Tracker created successfully
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/tracker/get/{id}:
 *   get:
 *     tags:
 *       - Trackers
 *     summary: Get tracker by ID
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
 *         description: Tracker found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tracker not found
 *
 * /v1/api/tracker/update/{id}:
 *   put:
 *     tags:
 *       - Trackers
 *     summary: Update tracker
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
 *               description:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [INR, USD, EUR, GBP]
 *     responses:
 *       200:
 *         description: Tracker updated
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/tracker/delete/{id}:
 *   delete:
 *     tags:
 *       - Trackers
 *     summary: Delete tracker
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
 *         description: Tracker deleted
 *       401:
 *         description: Unauthorized
 */

export {};
