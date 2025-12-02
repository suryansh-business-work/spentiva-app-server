/**
 * @swagger
 * /api/trackers/trackers:
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
 *
 * /api/trackers/create/tracker:
 *   post:
 *     tags:
 *       - Trackers
 *     summary: Create a new tracker
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
 *                 example: Track my personal monthly expenses
 *               currency:
 *                 type: string
 *                 enum: [INR, USD, EUR, GBP]
 *                 example: INR
 *     responses:
 *       201:
 *         description: Tracker created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tracker:
 *                   $ref: '#/components/schemas/Tracker'
 *
 * /api/trackers/get/tracker/{id}:
 *   get:
 *     tags:
 *       - Trackers
 *     summary: Get tracker by ID
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
 *         description: Tracker retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tracker:
 *                   $ref: '#/components/schemas/Tracker'
 *
 * /api/trackers/update/tracker/{id}:
 *   put:
 *     tags:
 *       - Trackers
 *     summary: Update a tracker
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tracker updated
 *
 * /api/trackers/delete/tracker/{id}:
 *   delete:
 *     tags:
 *       - Trackers
 *     summary: Delete a tracker
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
 *         description: Tracker deleted
 */

export { };
