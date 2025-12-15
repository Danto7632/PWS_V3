export interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: string;
  projectId: string;
  role?: 'customer' | 'employee';
  messages?: Message[];
}

export interface Project {
  id: string;
  name: string;
  conversations: Conversation[];
  isExpanded?: boolean;
  category?: string;
  files?: ProjectFile[];
  guidelines?: string;
  uploadPercentage?: number;
  userId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isTyping?: boolean;
  fullContent?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
}