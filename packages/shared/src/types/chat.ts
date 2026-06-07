export interface IChatSession {
  _id: string;
  userId: string;
  childId: string | null;
  title: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  _id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: {
    n8nExecutionId: string | null;
    processingTimeMs: number | null;
    error: boolean;
  };
  createdAt: string;
}
