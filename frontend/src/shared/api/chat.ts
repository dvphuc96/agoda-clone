import apiClient from './client';

export interface ChatSession {
  id: number;
  context?: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const chatApi = {
  createSession: () => apiClient.post<ChatSession>('/chat/sessions'),
  getSessions: () => apiClient.get<ChatSession[]>('/chat/sessions'),
  sendMessage: (sessionId: number, content: string) =>
    apiClient.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, { content }),
  getMessages: (sessionId: number) =>
    apiClient.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
};
