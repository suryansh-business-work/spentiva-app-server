import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for File Upload Document
 */
export interface IFileUpload extends Document {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  savedName: string;
  filePath: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

/**
 * File Upload Schema
 * Stores metadata for all uploaded files
 */
const FileUploadSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    savedName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
FileUploadSchema.index({ userId: 1, uploadedAt: -1 });

export const FileUploadModel = mongoose.model<IFileUpload>('FileUpload', FileUploadSchema);
