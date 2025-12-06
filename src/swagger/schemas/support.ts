/**
 * @swagger
 * components:
 *   schemas:
 *     SupportTicket:
 *       type: object
 *       properties:
 *         ticketId:
 *           type: string
 *           description: Unique ticket identifier
 *           example: TICKET-001
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         type:
 *           type: string
 *           enum: [PaymentRelated, BugInApp, DataLoss, FeatureRequest, Other]
 *           description: Type of support ticket
 *         subject:
 *           type: string
 *           description: Ticket subject
 *           example: Payment not processed
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *           example: I tried to upgrade to Pro plan but my payment failed
 *         status:
 *           type: string
 *           enum: [Open, InProgress, Closed, Escalated]
 *           description: Current ticket status
 *           example: Open
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               filePath:
 *                 type: string
 *                 example: uploads/userId/screenshot.png
 *               fileName:
 *                 type: string
 *                 example: screenshot.png
 *               fileUrl:
 *                 type: string
 *                 example: http://localhost:8002/uploads/userId/screenshot.png
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ticket creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     SupportTicketResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Ticket created successfully
 *         data:
 *           $ref: '#/components/schemas/SupportTicket'
 *         status:
 *           type: string
 *           example: success
 *         statusCode:
 *           type: number
 *           example: 200
 */

export {};
