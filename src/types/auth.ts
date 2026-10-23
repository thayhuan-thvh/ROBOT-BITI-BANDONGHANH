export type UserRole = 'admin' | 'teacher' | 'student';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  school?: string;
  rejectionReason?: string;
  createdAt: string;
  lastLogin?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface TeacherStats {
  total: number;
  pending: number;
  approved: number;
  suspended: number;
  rejected: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export type ProcessingStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type UsageStatus = 'active' | 'inactive';

export interface DocumentMaterial {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: 'pdf' | 'docx' | 'txt';
  title: string;
  grade: 3 | 4 | 5;
  subject: string;
  bookSeries: 'ket_noi_tri_thuc' | 'canh_dieu' | 'chan_troi_sang_tao' | 'other';
  topic: string;
  lesson?: string;
  uploadedBy: {
    id: string;
    email: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
  processingStatus: ProcessingStatus;
  usageStatus: UsageStatus;
  errorMessage?: string;
  totalChunks: number;
  extractedSnippet?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  bookSeries: string;
  grade: number;
  topic: string;
  lesson?: string;
  pageNumber?: number;
  chunkIndex: number;
  content: string;
}

export interface AuditLog {
  id: string;
  action: 'UPLOAD' | 'ACTIVATE' | 'DEACTIVATE' | 'DELETE' | 'ROLE_CHANGE' | 'STATUS_CHANGE' | 'REGISTER' | 'LOGIN';
  userId: string;
  userEmail: string;
  userName: string;
  target?: string;
  details: string;
  timestamp: string;
}

export interface RAGSearchResult {
  chunk: DocumentChunk;
  score: number;
}
