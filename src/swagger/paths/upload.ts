/**
 * @swagger
 * /v1/api/imagekit/upload:
 *   post:
 *     tags:
 *       - File Upload
 *     summary: Upload to ImageKit
 *     description: Upload files to ImageKit CDN (base64 or multipart)
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       description: Base64 encoded file data
 *                     fileName:
 *                       type: string
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       413:
 *         description: File too large
 *
 * /v1/api/upload:
 *   post:
 *     tags:
 *       - File Upload
 *     summary: Upload files locally
 *     security:
 *       - BearerAuth: []
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
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Files uploaded
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/uploads:
 *   get:
 *     tags:
 *       - File Upload
 *     summary: Get user's uploaded files
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Files retrieved
 *       401:
 *         description: Unauthorized
 *
 * /v1/api/uploads/{id}:
 *   get:
 *     tags:
 *       - File Upload
 *     summary: Get file by ID
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
 *         description: File found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - File Upload
 *     summary: Delete file
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
 *         description: File deleted
 *       401:
 *         description: Unauthorized
 */

export {};
