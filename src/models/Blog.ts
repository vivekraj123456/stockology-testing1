import { model, models, Schema, type Model } from "mongoose";

export interface BlogDocument {
  title: string;
  slug: string;
  keywords: string[];
  content: string;
  excerpt: string;
  image: string;
  author: string;
  createdAt: Date;
}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ keywords: 1, createdAt: -1 });

const Blog: Model<BlogDocument> =
  (models.Blog as Model<BlogDocument> | undefined) ??
  model<BlogDocument>("Blog", BlogSchema);

export default Blog;
