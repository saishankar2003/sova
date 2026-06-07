import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKnowledgeArticleDocument extends Document {
  category: 'faq' | 'ehcp_intro' | 'journey_stages' | 'reminder_templates';
  slug: string;
  title: string;
  content: string;
  order: number;
  published: boolean;
  tags: string[];
  lastEditedBy: Types.ObjectId;
}

const knowledgeArticleSchema = new Schema<IKnowledgeArticleDocument>(
  {
    category: {
      type: String,
      enum: ['faq', 'ehcp_intro', 'journey_stages', 'reminder_templates'],
      required: true,
    },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

knowledgeArticleSchema.index({ category: 1, order: 1 });
knowledgeArticleSchema.index({ slug: 1 }, { unique: true });
knowledgeArticleSchema.index({ published: 1 });

export const KnowledgeArticle = mongoose.model<IKnowledgeArticleDocument>('KnowledgeArticle', knowledgeArticleSchema);
