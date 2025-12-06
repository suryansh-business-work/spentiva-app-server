/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique file identifier
 *           example: 507f1f77bcf86cd799439011
 *         originalName:
 *           type: string
 *           description: Original filename when uploaded
 *           example: document.pdf
 *         savedName:
 *           type: string
 *           description: Saved filename on the server
 *           example: 1733385674000-document.pdf
 *         filePath:
 *           type: string
 *           description: Local file path on server
 *           example: uploads/userId123/1733385674000-document.pdf
 *         fileUrl:
 *           type: string
 *           description: Public URL to access the file
 *           example: http://localhost:8002/uploads/userId123/1733385674000-document.pdf
 *         size:
 *           type: number
 *           description: File size in bytes
 *           example: 245678
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *           example: application/pdf
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when file was uploaded
 *           example: 2025-12-05T06:41:14.000Z
 */

export {};
