export type KnowledgeCategory = 'faq' | 'ehcp_intro' | 'journey_stages' | 'reminder_templates';

export interface IKnowledgeArticle {
  _id: string;
  category: KnowledgeCategory;
  slug: string;
  title: string;
  content: string; // Markdown
  order: number;
  published: boolean;
  tags: string[];
  lastEditedBy: string;
  createdAt: string;
  updatedAt: string;
}
