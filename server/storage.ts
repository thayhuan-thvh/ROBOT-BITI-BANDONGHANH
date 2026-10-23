import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { 
  User, 
  DocumentMaterial, 
  DocumentChunk, 
  AuditLog, 
  RAGSearchResult,
  TeacherStats
} from '../src/types/auth';
import { StoredUser, hashPassword } from './auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.resolve(__dirname, '../server_storage');
const FILES_DIR = path.join(STORAGE_DIR, 'files');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');
const DOCS_FILE = path.join(STORAGE_DIR, 'documents.json');
const CHUNKS_FILE = path.join(STORAGE_DIR, 'chunks.json');
const AUDIT_FILE = path.join(STORAGE_DIR, 'audit_logs.json');

// Ensure storage directories exist
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

export class StorageService {
  /**
   * Initialize default seed users: Admin & Teacher
   */
  public static init(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      console.log('🌱 Seeding initial accounts (Admin & Teacher)...');
      
      const adminPass = hashPassword('Admin@BiTi2026');
      const adminUser: StoredUser = {
        id: 'usr_admin_default',
        email: 'admin@biti.edu.vn',
        fullName: 'Quản Trị Viên Hệ Thống',
        role: 'admin',
        status: 'approved',
        passwordHash: adminPass.hash,
        salt: adminPass.salt,
        createdAt: new Date().toISOString(),
      };

      const teacherPass = hashPassword('GiaoVien@123');
      const teacherUser: StoredUser = {
        id: 'usr_teacher_default',
        email: 'giaovien@biti.edu.vn',
        fullName: 'Cô Mai Lan (Giáo Viên Tin Học 3)',
        role: 'teacher',
        status: 'approved',
        school: 'Trường Tiểu học Chu Văn An',
        approvedAt: new Date().toISOString(),
        approvedBy: 'Hệ thống tự động',
        passwordHash: teacherPass.hash,
        salt: teacherPass.salt,
        createdAt: new Date().toISOString(),
      };

      this.saveUsers([adminUser, teacherUser]);
      this.logAudit({
        action: 'ROLE_CHANGE',
        userId: 'system',
        userEmail: 'system@biti.edu.vn',
        userName: 'Hệ Thống',
        details: 'Khởi tạo tài khoản quản trị admin@biti.edu.vn và giáo viên mẫu giaovien@biti.edu.vn',
      });
    }

    // Seed default verified textbooks if documents are empty
    const docs = this.getDocuments();
    if (docs.length === 0) {
      this.seedStandardCurriculumDocs();
    }
  }

  // --- USERS MANAGEMENT ---

  public static getUsers(): StoredUser[] {
    const users = readJSON<StoredUser[]>(USERS_FILE, []);
    return users.map((u) => ({
      ...u,
      status: u.status || 'approved',
      school: u.school || (u.role === 'teacher' ? 'Trường Tiểu học Chu Văn An' : undefined),
    }));
  }

  public static saveUsers(users: StoredUser[]): void {
    writeJSON(USERS_FILE, users);
  }

  public static findUserByEmail(email: string): StoredUser | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public static findUserById(id: string): StoredUser | undefined {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  }

  public static createUser(user: StoredUser): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  public static updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return users[idx];
  }

  public static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length !== users.length) {
      this.saveUsers(filtered);
      return true;
    }
    return false;
  }

  public static getTeacherStats(): TeacherStats {
    const teachers = this.getUsers().filter((u) => u.role === 'teacher');
    return {
      total: teachers.length,
      pending: teachers.filter((t) => t.status === 'pending').length,
      approved: teachers.filter((t) => t.status === 'approved').length,
      suspended: teachers.filter((t) => t.status === 'suspended').length,
      rejected: teachers.filter((t) => t.status === 'rejected').length,
    };
  }

  // --- DOCUMENTS MANAGEMENT ---

  public static getDocuments(): DocumentMaterial[] {
    return readJSON<DocumentMaterial[]>(DOCS_FILE, []);
  }

  public static saveDocuments(docs: DocumentMaterial[]): void {
    writeJSON(DOCS_FILE, docs);
  }

  public static findDocumentById(id: string): DocumentMaterial | undefined {
    return this.getDocuments().find((d) => d.id === id);
  }

  public static createDocument(doc: DocumentMaterial): void {
    const docs = this.getDocuments();
    docs.unshift(doc);
    this.saveDocuments(docs);
  }

  public static updateDocument(id: string, updates: Partial<DocumentMaterial>): DocumentMaterial | null {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDocuments(docs);
    return docs[idx];
  }

  public static deleteDocument(id: string): boolean {
    const docs = this.getDocuments();
    const doc = docs.find((d) => d.id === id);
    if (!doc) return false;

    // Remove document metadata
    this.saveDocuments(docs.filter((d) => d.id !== id));

    // Remove chunks
    const chunks = this.getChunks().filter((c) => c.documentId !== id);
    this.saveChunks(chunks);

    // Remove file if exists
    const filePath = path.join(FILES_DIR, `${id}.${doc.fileType}`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
    }

    return true;
  }

  // --- CHUNKS MANAGEMENT ---

  public static getChunks(): DocumentChunk[] {
    return readJSON<DocumentChunk[]>(CHUNKS_FILE, []);
  }

  public static saveChunks(chunks: DocumentChunk[]): void {
    writeJSON(CHUNKS_FILE, chunks);
  }

  public static addChunks(newChunks: DocumentChunk[]): void {
    const chunks = this.getChunks();
    chunks.push(...newChunks);
    this.saveChunks(chunks);
  }

  // --- AUDIT LOGS ---

  public static getAuditLogs(): AuditLog[] {
    return readJSON<AuditLog[]>(AUDIT_FILE, []);
  }

  public static logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 500 logs
    writeJSON(AUDIT_FILE, logs.slice(0, 500));
  }

  // --- DOCUMENT PARSING & CHUNKING ---

  public static async processAndIndexDocument(
    doc: DocumentMaterial,
    fileBuffer: Buffer
  ): Promise<{ chunksCount: number; snippet: string }> {
    let extractedText = '';

    // Save physical file
    const filePath = path.join(FILES_DIR, `${doc.id}.${doc.fileType}`);
    fs.writeFileSync(filePath, fileBuffer);

    // 1. Text extraction by format
    if (doc.fileType === 'txt') {
      extractedText = fileBuffer.toString('utf-8');
    } else if (doc.fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value || '';
    } else if (doc.fileType === 'pdf') {
      const parser = new PDFParse({ data: fileBuffer });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
    }

    if (!extractedText.trim()) {
      throw new Error('Không thể trích xuất văn bản từ tệp này. Tệp có thể là ảnh quét thuần túy hoặc bị hỏng.');
    }

    // 2. Text Chunking (approx 350 - 550 words per chunk with sentence boundaries)
    const paragraphs = extractedText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    const chunks: DocumentChunk[] = [];
    let currentContent = '';
    let chunkIndex = 1;

    for (const para of paragraphs) {
      if ((currentContent + '\n\n' + para).length <= 900) {
        currentContent = currentContent ? `${currentContent}\n\n${para}` : para;
      } else {
        if (currentContent) {
          chunks.push({
            id: `chk_${doc.id}_${chunkIndex}`,
            documentId: doc.id,
            documentTitle: doc.title,
            bookSeries: doc.bookSeries,
            grade: doc.grade,
            topic: doc.topic,
            lesson: doc.lesson,
            chunkIndex,
            content: currentContent,
          });
          chunkIndex++;
        }
        currentContent = para;
      }
    }

    if (currentContent) {
      chunks.push({
        id: `chk_${doc.id}_${chunkIndex}`,
        documentId: doc.id,
        documentTitle: doc.title,
        bookSeries: doc.bookSeries,
        grade: doc.grade,
        topic: doc.topic,
        lesson: doc.lesson,
        chunkIndex,
        content: currentContent,
      });
    }

    // Save chunks to database
    this.addChunks(chunks);

    const snippet = extractedText.slice(0, 300).trim() + (extractedText.length > 300 ? '...' : '');
    return { chunksCount: chunks.length, snippet };
  }

  // --- RAG RETRIEVAL ENGINE ---

  /**
   * Search active document chunks relevant to student question
   */
  public static searchActiveChunks(query: string, maxResults: number = 4): RAGSearchResult[] {
    const activeDocs = this.getDocuments().filter((d) => d.usageStatus === 'active');
    const activeDocIds = new Set(activeDocs.map((d) => d.id));
    if (activeDocIds.size === 0) return [];

    const allChunks = this.getChunks().filter((c) => activeDocIds.has(c.documentId));
    if (allChunks.length === 0) return [];

    // Normalize query tokens (lowercase, strip diacritics for flexible fuzzy matching alongside full text)
    const rawTokens = query
      .toLowerCase()
      .replace(/[?!,.:;()]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    const results: RAGSearchResult[] = [];

    for (const chunk of allChunks) {
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.documentTitle.toLowerCase();
      const topicLower = chunk.topic.toLowerCase();
      let score = 0;

      // Exact phrase match
      if (contentLower.includes(query.toLowerCase().trim())) {
        score += 20;
      }

      // Keyword token matches
      for (const token of rawTokens) {
        if (contentLower.includes(token)) score += 3;
        if (titleLower.includes(token)) score += 5;
        if (topicLower.includes(token)) score += 4;
      }

      if (score > 3) {
        results.push({ chunk, score });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults);
  }

  /**
   * Seed standard curriculum materials as active verified documents
   */
  private static seedStandardCurriculumDocs(): void {
    const seedDocId = 'doc_sgk_kntt_lop3';
    const seedDoc: DocumentMaterial = {
      id: seedDocId,
      fileName: 'Tin_Hoc_3_Ket_Noi_Tri_Thuc_Chuan_GDPT2018.txt',
      fileSize: 48200,
      fileType: 'txt',
      title: 'Sách giáo khoa Tin học 3 – Kết nối tri thức với cuộc sống (Bộ chuẩn GDPT 2018)',
      grade: 3,
      subject: 'Tin học',
      bookSeries: 'ket_noi_tri_thuc',
      topic: 'Chương trình GDPT 2018',
      lesson: 'Toàn bộ 13 bài học cơ bản',
      uploadedBy: {
        id: 'usr_admin_default',
        email: 'admin@biti.edu.vn',
        fullName: 'Quản Trị Viên Hệ Thống',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processingStatus: 'ready',
      usageStatus: 'active',
      totalChunks: 6,
      extractedSnippet: 'Sách giáo khoa Tin học 3 gồm 6 chủ đề chính: Chủ đề A (Máy tính và em: Bàn phím, Chuột, Thân máy, Màn hình, Tư thế ngồi đúng); Chủ đề B (Mạng Internet và an toàn số)...',
    };

    const initialChunks: DocumentChunk[] = [
      {
        id: `chk_${seedDocId}_1`,
        documentId: seedDocId,
        documentTitle: seedDoc.title,
        bookSeries: 'ket_noi_tri_thuc',
        grade: 3,
        topic: 'Chủ đề A: Máy tính và em',
        lesson: 'Bài 3: Máy tính - người bạn mới',
        pageNumber: 12,
        chunkIndex: 1,
        content: `Máy tính để bàn gồm 4 bộ phận cơ bản không thể thiếu:
1. Thân máy: Chứa bộ vi xử lí CPU, được coi là "bộ não" điều khiển mọi hoạt động của máy tính.
2. Màn hình: Hiển thị chữ, số, hình ảnh và kết quả làm việc của máy tính cho người dùng quan sát.
3. Bàn phím: Dùng để nhập chữ, số và các kí hiệu vào máy tính.
4. Chuột máy tính: Giúp di chuyển con trỏ, chọn đối tượng và ra lệnh nhanh chóng.
Ngoài ra, còn có máy tính xách tay (laptop) tích hợp cả màn hình, bàn phím và chuột trên một khối nhỏ gọn.`,
      },
      {
        id: `chk_${seedDocId}_2`,
        documentId: seedDocId,
        documentTitle: seedDoc.title,
        bookSeries: 'ket_noi_tri_thuc',
        grade: 3,
        topic: 'Chủ đề A: Máy tính và em',
        lesson: 'Bài 4: Làm việc với máy tính & Tư thế ngồi an toàn',
        pageNumber: 18,
        chunkIndex: 2,
        content: `Quy tắc làm việc an toàn với máy tính:
1. Tư thế ngồi đúng: Lưng thẳng, hai chân đặt vuông góc thoải mái trên sàn nhà, mắt nhìn ngang hoặc hơi thấp hơn mép trên màn hình.
2. Khoảng cách an toàn từ mắt đến màn hình là từ 50 cm đến 80 cm (khoảng một sải tay của học sinh).
3. Không ngồi liên tục quá 30 - 45 phút, cần đứng dậy thư giãn mắt và vận động nhẹ.
4. An toàn điện: Tuyệt đối không tự ý chạm tay vào dây điện, ổ cắm hoặc mở thân máy tính. Khi có sự cố, báo ngay cho thầy cô giáo.`,
      },
      {
        id: `chk_${seedDocId}_3`,
        documentId: seedDocId,
        documentTitle: seedDoc.title,
        bookSeries: 'ket_noi_tri_thuc',
        grade: 3,
        topic: 'Chủ đề A: Máy tính và em',
        lesson: 'Bài 5: Sử dụng bàn phím máy tính',
        pageNumber: 22,
        chunkIndex: 3,
        content: `Bàn phím máy tính gồm 5 hàng phím chính:
- Hàng phím số, hàng phím trên, hàng phím cơ sở, hàng phím dưới, hàng phím dưới cùng.
- Hai phím có gờ nổi trên hàng phím cơ sở là phím F và phím J. Đây là vị trí đặt ngón trỏ tay trái (phím F) và ngón trỏ tay phải (phím J) khi bắt đầu gõ phím.
- Các phím đặc biệt quan trọng:
  + Phím Space (phím Cách dài nhất): Dùng để tạo dấu cách giữa các từ.
  + Phím Enter: Dùng để xuống dòng hoặc gửi lệnh đồng ý.
  + Phím Shift: Nhấn giữ để gõ chữ in hoa hoặc ký hiệu phía trên.
  + Phím Backspace: Dùng để xóa ký tự nằm ở bên trái con trỏ soạn thảo.
  + Phím Caps Lock: Bật hoặc tắt chế độ gõ toàn bộ chữ in hoa.`,
      },
      {
        id: `chk_${seedDocId}_4`,
        documentId: seedDocId,
        documentTitle: seedDoc.title,
        bookSeries: 'ket_noi_tri_thuc',
        grade: 3,
        topic: 'Chủ đề B: Mạng máy tính và Internet',
        lesson: 'Bài 8: Bảo vệ thông tin cá nhân trên mạng',
        pageNumber: 38,
        chunkIndex: 4,
        content: `An toàn thông tin trên mạng Internet dành cho học sinh lớp 3:
1. Thông tin cá nhân cần bảo mật: Họ và tên đầy đủ, ngày sinh, địa chỉ nhà ở, số điện thoại, tên trường lớp, mật khẩu tài khoản và hình ảnh riêng tư.
2. Quy tắc vàng: Tuyệt đối không chia sẻ thông tin cá nhân hay mật khẩu cho bất kỳ ai trên mạng, kể cả người lạ hứa tặng quà hay xu trò chơi.
3. Khi gặp điều gì đáng sợ, tin nhắn quấy rối hoặc người lạ đòi hỏi thông tin, hãy tắt màn hình và thông báo ngay cho cha mẹ hoặc thầy cô giáo.`,
      },
    ];

    this.createDocument(seedDoc);
    this.addChunks(initialChunks);
  }
}
