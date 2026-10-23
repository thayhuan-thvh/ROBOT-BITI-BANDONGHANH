export type BiTiState = 
  | 'greeting' 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'celebrating' 
  | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  imageUrl?: string;
  topicRef?: string;
  sources?: Array<{
    documentTitle: string;
    grade: number;
    bookSeries: string;
    topic: string;
    lesson?: string;
    similarityScore: number;
  }>;
}

export type BookSeries = 'ket_noi_tri_thuc' | 'canh_dieu' | 'chan_troi_sang_tao';

export interface TextbookTopic {
  id: string;
  code: string;
  title: string;
  description: string;
  lessons: {
    number: number;
    title: string;
    keyPoints: string[];
    sampleQuestions: string[];
  }[];
}

export type QuizType = 'mcq' | 'matching' | 'true_false' | 'scenario';

export interface QuizQuestion {
  id: string;
  topicId: string;
  type: QuizType;
  title: string;
  question: string;
  options?: string[];
  correctAnswer: number | boolean | Record<string, string>;
  explanation: string;
  hint: string;
  pairs?: { item: string; match: string }[];
}

export interface TeacherMaterial {
  id: string;
  title: string;
  bookSeries: BookSeries;
  topic: string;
  content: string;
  dateAdded: string;
}

export type TTSProvider = 'gemini_tts' | 'google_cloud' | 'browser';

export interface AudioSettings {
  autoSpeak: boolean;
  provider: TTSProvider;
  rate: number;
  pitch: number;
  googleCloudVoice: string;
  geminiVoice: string;
  selectedVoiceURI: string;
  isMuted: boolean;
}
