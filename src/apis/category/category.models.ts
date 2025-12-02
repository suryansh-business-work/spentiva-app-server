import mongoose, { Schema, Document } from 'mongoose';

export interface ISubCategory {
  id: string;
  name: string;
}

export interface ICategory extends Document {
  trackerId: string;
  name: string;
  subcategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const CategorySchema: Schema = new Schema(
  {
    trackerId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subcategories: {
      type: [SubCategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by trackerId
CategorySchema.index({ trackerId: 1 });
CategorySchema.index({ createdAt: -1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
