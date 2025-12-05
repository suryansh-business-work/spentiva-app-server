import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Configure ffmpeg to use the static binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  console.log('FFmpeg configured with static binary:', ffmpegStatic);
} else {
  console.warn('ffmpeg-static not found, using system FFmpeg');
}

/**
 * Convert WebM buffer to MP4 buffer
 * @param webmBuffer - Input WebM file as buffer
 * @param originalFileName - Original file name
 * @returns Promise<{ buffer: Buffer, fileName: string }>
 */
export const convertWebMToMP4 = (
  webmBuffer: Buffer,
  originalFileName: string
): Promise<{ buffer: Buffer; fileName: string }> => {
  return new Promise((resolve, reject) => {
    // Create temporary file paths
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.webm`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.mp4`);

    // Change file extension from .webm to .mp4
    const mp4FileName = originalFileName.replace(/\.webm$/i, '.mp4');

    try {
      // Write input buffer to temp file
      fs.writeFileSync(inputPath, webmBuffer);

      console.log(`Converting WebM to MP4: ${originalFileName} -> ${mp4FileName}`);

      // Convert using ffmpeg
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264', // Video codec
          '-preset fast', // Encoding preset
          '-c:a aac', // Audio codec
          '-b:a 128k', // Audio bitrate
          '-movflags +faststart', // Enable streaming
        ])
        .output(outputPath)
        .on('end', () => {
          try {
            // Read the converted file
            const mp4Buffer = fs.readFileSync(outputPath);

            // Clean up temp files
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);

            console.log(`WebM to MP4 conversion completed: ${mp4FileName}`);
            resolve({ buffer: mp4Buffer, fileName: mp4FileName });
          } catch (error) {
            reject(new Error(`Failed to read converted file: ${error}`));
          }
        })
        .on('error', (error: Error) => {
          // Clean up temp files on error
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

          reject(new Error(`FFmpeg conversion failed: ${error.message}`));
        })
        .run();
    } catch (error: any) {
      // Clean up on error
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      reject(new Error(`WebM to MP4 conversion error: ${error.message}`));
    }
  });
};

/**
 * Check if file is WebM format
 */
export const isWebMFile = (fileName: string, mimeType?: string): boolean => {
  const hasWebMExtension = /\.webm$/i.test(fileName);
  const hasWebMMimeType = mimeType?.includes('webm');

  return hasWebMExtension || hasWebMMimeType || false;
};
