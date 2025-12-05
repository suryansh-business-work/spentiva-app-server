/**
 * @swagger
 * /v1/api/upload:
 *   post:
 *     summary: Upload single or multiple files
 *     description: Upload files to local server storage. Files will be stored in uploads/[userId]/ directory.
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10 files, 10MB each)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Files uploaded successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileUpload'
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Bad request - no files provided
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 *
 * /v1/api/uploads/{id}:
 *   get:
 *     summary: Get file metadata by ID
 *     description: Retrieve file metadata for a specific file
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/FileUpload'
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete file by ID
 *     description: Delete a file from storage and database
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /v1/api/uploads:
 *   get:
 *     summary: Get all files for authenticated user
 *     description: Retrieve all files uploaded by the authenticated user with pagination
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of files to return (max 100)
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of files to skip
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Files retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUpload'
 *                     total:
 *                       type: number
 *                       example: 42
 *                     limit:
 *                       type: number
 *                       example: 50
 *                     skip:
 *                       type: number
 *                       example: 0
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export { };
