/**
 * @swagger
 * /v1/api/support/tickets:
 *   post:
 *     summary: Create a new support ticket
 *     description: Create a support ticket with optional file attachments
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - subject
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PaymentRelated, BugInApp, DataLoss, FeatureRequest, Other]
 *                 description: Type of support ticket
 *               subject:
 *                 type: string
 *                 description: Ticket subject
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileUrl:
 *                       type: string
 *     responses:
 *       200:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get all tickets
 *     description: Get all support tickets (user's tickets or all for admin)
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, InProgress, Closed, Escalated]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PaymentRelated, BugInApp, DataLoss, FeatureRequest, Other]
 *         description: Filter by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of tickets to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of tickets to skip
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SupportTicket'
 *                     total:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     skip:
 *                       type: number
 *
 * /v1/api/support/tickets/stats:
 *   get:
 *     summary: Get ticket statistics
 *     description: Get statistics for support tickets
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *
 * /v1/api/support/tickets/{ticketId}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieve a specific support ticket by ticket ID
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID (e.g., TICKET-001)
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketResponse'
 *       400:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete ticket
 *     description: Delete a support ticket (admin only)
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       400:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized or not admin
 *
 * /v1/api/support/tickets/{ticketId}/status:
 *   put:
 *     summary: Update ticket status
 *     description: Update the status of a support ticket
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Open, InProgress, Closed, Escalated]
 *                 description: New ticket status
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status or ticket not found
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/support/tickets/{ticketId}/attachments:
 *   post:
 *     summary: Add attachment to ticket
 *     description: Add a file attachment to an existing ticket
 *     tags:
 *       - Support
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileId
 *               - filePath
 *               - fileName
 *               - fileUrl
 *             properties:
 *               fileId:
 *                 type: string
 *               filePath:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attachment added successfully
 *       400:
 *         description: Invalid data or ticket not found
 *       401:
 *         description: Unauthorized
 */

export { };
