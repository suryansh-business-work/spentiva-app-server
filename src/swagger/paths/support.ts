/**
 * @swagger
 * /v1/api/support/tickets:
 *   post:
 *     tags:
 *       - Support
 *     summary: Create support ticket
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicket'
 *     responses:
 *       201:
 *         description: Ticket created
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags:
 *       - Support
 *     summary: Get all tickets
 *     description: Get user's tickets or all tickets for admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/support/tickets/stats:
 *   get:
 *     tags:
 *       - Support
 *     summary: Get ticket statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/support/tickets/{ticketId}:
 *   get:
 *     tags:
 *       - Support
 *     summary: Get ticket by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: ticketId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Support
 *     summary: Delete ticket (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: ticketId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *
 * /v1/api/support/tickets/{ticketId}/status:
 *   put:
 *     tags:
 *       - Support
 *     summary: Update ticket status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: ticketId
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
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Status updated
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/support/tickets/{ticketId}/attachments:
 *   post:
 *     tags:
 *       - Support
 *     summary: Add attachment to ticket
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: ticketId
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
 *               attachmentUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attachment added
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/support/tickets/{ticketId}/updates:
 *   post:
 *     tags:
 *       - Support
 *     summary: Add update to ticket
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: ticketId
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
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update added
 *       401:
 *         description: Unauthorized
 */

export {};
