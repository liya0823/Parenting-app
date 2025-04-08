export interface ChatMessage {
  text: string;
  isUser: boolean;
}

export interface BabyInfo {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  image: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error?: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
} 