/**
 * @swagger
 * /v1/api/imagekit/upload:
 *   post:
 *     tags:
 *       - File Upload
 *     summary: Upload file to ImageKit
 *     description: Upload an image file to ImageKit CDN storage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               folder:
 *                 type: string
 *                 description: Optional folder path in ImageKit
 *                 example: profile-photos
 *               fileName:
 *                 type: string
 *                 description: Optional custom file name
 *                 example: user-profile-123
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags for the image
 *                 example: profile,user,avatar
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     url:
 *                       type: string
 *                       example: https://ik.imagekit.io/spentiva/profile-photos/user-123.jpg
 *                     thumbnailUrl:
 *                       type: string
 *                       example: https://ik.imagekit.io/spentiva/profile-photos/tr:w-200,h-200/user-123.jpg
 *                     name:
 *                       type: string
 *                       example: user-123.jpg
 *                     size:
 *                       type: integer
 *                       example: 245678
 *       400:
 *         description: No file provided or invalid file
 *       500:
 *         description: Upload failed
 */

export { };
