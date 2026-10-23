import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken, 
  sanitizeUser, 
  StoredUser 
} from './server/auth';
import { StorageService } from './server/storage';
import { UserRole, DocumentMaterial, AccountStatus, TeacherStats } from './src/types/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Storage & Seed Accounts
StorageService.init();

// Body parser
app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'];

const BITI_SYSTEM_INSTRUCTION = `Bạn là Robot BiTi, người bạn đồng hành học tập môn Tin học lớp 3 của học sinh tiểu học Việt Nam.

Bạn luôn giao tiếp bằng tiếng Việt tự nhiên, thân thiện, chính xác, dễ hiểu và phù hợp với trẻ từ 8 đến 9 tuổi.

NHIỆM VỤ:
- Giúp học sinh hiểu bản chất kiến thức môn Tin học lớp 3 theo Chương trình GDPT 2018 (ưu tiên bộ sách Kết nối tri thức với cuộc sống), không chỉ ghi nhớ đáp án máy móc.
- Giải thích bằng ví dụ gần gũi với cuộc sống và lớp học (ví dụ: máy tính như người bạn, màn hình như tivi nhỏ, chuột như chú chuột nhanh nhẹn, thư mục như chiếc cặp đựng vở bài tập).
- Hướng dẫn từng bước khi học sinh cần thực hiện thao tác trên máy tính (đánh số Bước 1, Bước 2, Bước 3...).
- Khuyến khích học sinh tự suy nghĩ, quan sát và thử nghiệm.
- Điều chỉnh độ dài câu trả lời ngắn gọn, ngắt đoạn rõ ràng (2-4 câu một đoạn).

NGUYÊN TẮC KIẾN THỨC VÀ NGUỒN TÀI LIỆU RAG:
1. Khi có tài liệu học liệu được giáo viên cung cấp trong phần [HỌC LIỆU SÁCH GIÁO KHOA CHUẨN ĐƯỢC GIÁO VIÊN KÍCH HOẠT], BẮT BUỘC ưu tiên sử dụng các thông tin đó và trích dẫn tên sách hoặc bài học ở cuối câu trả lời (ví dụ: "📖 Theo Bài 3: Máy tính - người bạn mới, sách giáo khoa Kết nối tri thức").
2. Nếu câu hỏi KHÔNG có trong tài liệu đã cung cấp hoặc chưa tìm thấy căn cứ, hãy nói rõ: "BiTi chưa tìm thấy thông tin này trong tài liệu sách giáo khoa đã được thầy cô kích hoạt. Bạn có thể hỏi thêm thầy cô hoặc xem thêm trong sách nhé!". Tuyệt đối không bịa đặt kiến thức, tên bài hoặc số trang khi chưa có nguồn.
3. Không khẳng định một đáp án là đúng nếu chưa đủ căn cứ.
4. Không cung cấp hướng dẫn nguy hiểm, không khuyến khích học sinh chia sẻ thông tin cá nhân (họ tên, nhà ở, điện thoại, mật khẩu) trên mạng.

PHƯƠNG PHÁP SƯ PHẠM:
- Giải thích một ý chính trong mỗi đoạn.
- Sử dụng câu ngắn, từ ngữ phổ thông, dễ hiểu với trẻ 8-9 tuổi.
- Tuyệt đối không làm học sinh xấu hổ hoặc tự ti khi trả lời sai; luôn khen ngợi nỗ lực của bạn nhỏ.
- Xưng hô là 'BiTi' và 'bạn' (hoặc xưng 'BiTi' và gọi 'con' nếu học sinh gọi con).
- MỌI CÂU TRẢ LỜI DÀNH CHO HỌC SINH ĐỀU BẰNG TIẾNG VIỆT CHUẨN MỰC.`;

// Extend Request interface to hold authenticated user
interface AuthRequest extends Request {
  user?: StoredUser;
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (decoded) {
    const user = StorageService.findUserById(decoded.userId);
    if (user) {
      req.user = user;
    }
  }
  next();
}

app.use(authenticateToken);

// Role guards
function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thực hiện chức năng này.' });
  }
  next();
}

function requireTeacherOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản giáo viên hoặc quản trị viên.' });
  }
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user.role === 'teacher') {
    if (req.user.status === 'pending') {
      return res.status(403).json({
        error: 'Tài khoản của thầy/cô đang chờ quản trị viên phê duyệt. Thầy/cô chưa thể truy cập hoặc quản lý học liệu.',
      });
    }
    if (req.user.status === 'suspended') {
      return res.status(403).json({
        error: 'Tài khoản của thầy/cô đã bị tạm khóa. Vui lòng liên hệ Quản trị viên hệ thống.',
      });
    }
    if (req.user.status === 'rejected') {
      return res.status(403).json({
        error: 'Hồ sơ đăng ký giáo viên đã bị từ chối phê duyệt.',
      });
    }
    if (req.user.status === 'approved') {
      return next();
    }
  }
  return res.status(403).json({
    error: 'Quyền bị từ chối: Tài khoản của bạn là Học sinh. Chỉ Giáo viên đã được duyệt hoặc Quản trị viên mới có quyền quản lý học liệu.',
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản Quản trị viên.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Quyền bị từ chối: Chức năng này yêu cầu quyền Quản trị viên hệ thống (Admin).',
    });
  }
  next();
}

// Helper function to call Gemini with graceful candidate fallback
async function generateWithFallback(
  requestParams: (modelName: string) => Parameters<typeof ai.models.generateContent>[0]
) {
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const params = requestParams(model);
      const response = await ai.models.generateContent(params);
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: unknown) {
      lastError = err;
      console.warn(`Model ${model} encountered an issue, trying next candidate...`, err);
    }
  }

  throw lastError || new Error('Không thể kết nối mô hình AI.');
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/register - Register new account (Teacher with pending approval or Student)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, fullName, school, isTeacher, role: requestedRole } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Địa chỉ email không đúng định dạng.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Mật khẩu xác nhận không khớp.' });
    }

    if (StorageService.findUserByEmail(cleanEmail)) {
      return res.status(409).json({
        error: 'Email này đã được đăng ký trong hệ thống. Thầy/cô vui lòng đăng nhập hoặc dùng email khác.',
      });
    }

    const isTeacherReg = Boolean(isTeacher || requestedRole === 'teacher' || school);

    if (isTeacherReg && (!school || !school.trim())) {
      return res.status(400).json({ error: 'Vui lòng nhập trường / đơn vị công tác của thầy/cô.' });
    }

    // Role and Status assignment:
    // Teachers MUST start as 'pending'. Students start as 'approved'.
    const role: UserRole = isTeacherReg ? 'teacher' : 'student';
    const status: AccountStatus = isTeacherReg ? 'pending' : 'approved';
    const { hash, salt } = hashPassword(password);

    const newUser: StoredUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      email: cleanEmail,
      fullName: fullName.trim(),
      role,
      status,
      school: isTeacherReg ? school.trim() : undefined,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    StorageService.createUser(newUser);

    StorageService.logAudit({
      action: 'REGISTER',
      userId: newUser.id,
      userEmail: newUser.email,
      userName: newUser.fullName,
      target: newUser.email,
      details: isTeacherReg
        ? `Giáo viên mới [${newUser.fullName}] (${newUser.email}, ${newUser.school}) đăng ký tài khoản (Trạng thái: Chờ duyệt)`
        : `Học sinh mới [${newUser.fullName}] (${newUser.email}) đăng ký tài khoản`,
    });

    const token = generateToken(newUser);
    return res.json({
      token,
      user: sanitizeUser(newUser),
      message: isTeacherReg
        ? 'Tài khoản của thầy/cô đang chờ quản trị viên phê duyệt'
        : 'Đăng ký tài khoản học sinh thành công!',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return res.status(500).json({ error: `Đăng ký thất bại: ${msg}` });
  }
});

// POST /api/auth/login - Authenticate user
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = StorageService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.',
      });
    }

    // Update last login
    StorageService.updateUser(user.id, { lastLogin: new Date().toISOString() });

    StorageService.logAudit({
      action: 'LOGIN',
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      details: `Đăng nhập thành công với vai trò: ${user.role.toUpperCase()} (Trạng thái: ${user.status || 'approved'})`,
    });

    const token = generateToken(user);
    return res.json({
      token,
      user: sanitizeUser(user),
      message: user.status === 'pending'
        ? 'Tài khoản của thầy/cô đang chờ quản trị viên phê duyệt'
        : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return res.status(500).json({ error: `Đăng nhập thất bại: ${msg}` });
  }
});

// GET /api/auth/me - Get current user profile
app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: sanitizeUser(req.user) });
});

// ==========================================
// ADMIN USER & TEACHER MANAGEMENT ROUTES (Admin only)
// ==========================================

// GET /api/admin/teachers - List all teachers and statistical overview
app.get('/api/admin/teachers', requireAdmin, (req: Request, res: Response) => {
  const teachers = StorageService.getUsers()
    .filter((u) => u.role === 'teacher')
    .map(sanitizeUser);
  const stats = StorageService.getTeacherStats();
  return res.json({ teachers, stats });
});

// PATCH /api/admin/teachers/:id/status - Approve, reject, suspend, or reactivate a teacher
app.patch('/api/admin/teachers/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái tài khoản không hợp lệ.' });
  }

  const targetUser = StorageService.findUserById(id);
  if (!targetUser) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản giáo viên.' });
  }

  if (targetUser.id === req.user!.id) {
    return res.status(400).json({ error: 'Bạn không thể tự thay đổi trạng thái của chính mình.' });
  }

  const updates: Partial<StoredUser> = {
    status: status as AccountStatus,
  };

  if (status === 'approved') {
    updates.approvedAt = new Date().toISOString();
    updates.approvedBy = req.user!.fullName;
    updates.rejectionReason = undefined;
  } else if (status === 'rejected') {
    updates.rejectionReason = reason || 'Hồ sơ chưa đạt yêu cầu xác thực giáo viên';
  }

  const updated = StorageService.updateUser(id, updates);
  if (!updated) {
    return res.status(500).json({ error: 'Không thể cập nhật trạng thái.' });
  }

  StorageService.logAudit({
    action: 'STATUS_CHANGE',
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.fullName,
    target: targetUser.email,
    details: `Đã thay đổi trạng thái giáo viên ${targetUser.fullName} (${targetUser.email}) thành [${status.toUpperCase()}]${reason ? `. Ghi chú: ${reason}` : ''}`,
  });

  const stats = StorageService.getTeacherStats();
  return res.json({
    success: true,
    user: sanitizeUser(updated),
    stats,
    message: `Đã cập nhật trạng thái tài khoản thành ${status}.`,
  });
});

// PATCH /api/admin/teachers/:id/revoke - Revoke teacher rights (downgrade to student)
app.patch('/api/admin/teachers/:id/revoke', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const targetUser = StorageService.findUserById(id);
  if (!targetUser) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
  }

  if (targetUser.id === req.user!.id) {
    return res.status(400).json({ error: 'Bạn không thể tự thu hồi quyền của chính mình.' });
  }

  const updated = StorageService.updateUser(id, {
    role: 'student',
    status: 'approved',
  });

  StorageService.logAudit({
    action: 'ROLE_CHANGE',
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.fullName,
    target: targetUser.email,
    details: `Đã thu hồi quyền Giáo viên của ${targetUser.fullName} (${targetUser.email}), chuyển thành quyền Học sinh.`,
  });

  const stats = StorageService.getTeacherStats();
  return res.json({
    success: true,
    user: sanitizeUser(updated!),
    stats,
    message: `Đã thu hồi quyền giáo viên của ${targetUser.fullName}.`,
  });
});

// GET /api/admin/users - List all users
app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const users = StorageService.getUsers().map(sanitizeUser);
  return res.json({ users });
});

// PATCH /api/admin/users/:id/role - Change user role
app.patch('/api/admin/users/:id/role', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'teacher', 'student'].includes(role)) {
    return res.status(400).json({ error: 'Vai trò không hợp lệ.' });
  }

  const targetUser = StorageService.findUserById(id);
  if (!targetUser) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }

  // Prevent admin from removing their own admin role
  if (targetUser.id === req.user!.id && role !== 'admin') {
    return res.status(400).json({ error: 'Bạn không thể tự hạ quyền quản trị viên của chính mình.' });
  }

  const updated = StorageService.updateUser(id, { 
    role: role as UserRole,
    // If promoting to teacher, set approved status
    ...(role === 'teacher' && targetUser.status === 'pending' ? { status: 'approved' } : {})
  });
  if (!updated) {
    return res.status(500).json({ error: 'Không thể cập nhật quyền.' });
  }

  StorageService.logAudit({
    action: 'ROLE_CHANGE',
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.fullName,
    target: targetUser.email,
    details: `Đã thay đổi vai trò của ${targetUser.email} từ [${targetUser.role}] sang [${role}]`,
  });

  return res.json({ user: sanitizeUser(updated) });
});

// DELETE /api/admin/users/:id - Delete a user
app.delete('/api/admin/users/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Bạn không thể tự xóa tài khoản của chính mình.' });
  }

  const target = StorageService.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }

  StorageService.deleteUser(id);

  StorageService.logAudit({
    action: 'DELETE',
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.fullName,
    target: target.email,
    details: `Đã xóa tài khoản người dùng ${target.email} (${target.fullName})`,
  });

  return res.json({ success: true });
});

// GET /api/admin/audit-logs - View audit logs
app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const logs = StorageService.getAuditLogs();
  return res.json({ logs });
});

// ==========================================
// MATERIAL / LEARNING RESOURCES ROUTES
// (Protected: Teachers and Admins only)
// ==========================================

// GET /api/materials - List materials (Teachers see theirs/all; Admins see all)
app.get('/api/materials', requireTeacherOrAdmin, (req: AuthRequest, res: Response) => {
  const docs = StorageService.getDocuments();
  return res.json({ documents: docs, materials: docs });
});

// POST /api/materials/upload - Upload and index document
app.post('/api/materials/upload', requireTeacherOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      fileName, 
      fileType, 
      fileData, // base64
      title, 
      grade, 
      subject, 
      bookSeries, 
      topic, 
      lesson 
    } = req.body;

    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tệp tài liệu hợp lệ.' });
    }

    if (!['pdf', 'docx', 'txt'].includes(fileType.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp PDF, DOCX hoặc TXT.' 
      });
    }

    // Clean base64
    let cleanBase64 = fileData;
    if (fileData.includes('base64,')) {
      cleanBase64 = fileData.split('base64,')[1];
    }
    const fileBuffer = Buffer.from(cleanBase64, 'base64');

    // Limit 15MB
    if (fileBuffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Dung lượng tệp vượt quá giới hạn 15MB.' });
    }

    const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const newDoc: DocumentMaterial = {
      id: docId,
      fileName,
      fileSize: fileBuffer.length,
      fileType: fileType.toLowerCase() as 'pdf' | 'docx' | 'txt',
      title: title?.trim() || fileName,
      grade: grade ? parseInt(grade, 10) as 3 | 4 | 5 : 3,
      subject: subject || 'Tin học',
      bookSeries: bookSeries || 'ket_noi_tri_thuc',
      topic: topic || 'Chủ đề bài học',
      lesson: lesson || '',
      uploadedBy: {
        id: req.user!.id,
        email: req.user!.email,
        fullName: req.user!.fullName,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processingStatus: 'processing',
      usageStatus: 'active', // Active by default
      totalChunks: 0,
    };

    // Store initial document
    StorageService.createDocument(newDoc);

    // Extract text and chunk
    try {
      const { chunksCount, snippet } = await StorageService.processAndIndexDocument(newDoc, fileBuffer);
      const updatedDoc = StorageService.updateDocument(docId, {
        processingStatus: 'ready',
        totalChunks: chunksCount,
        extractedSnippet: snippet,
      });

      StorageService.logAudit({
        action: 'UPLOAD',
        userId: req.user!.id,
        userEmail: req.user!.email,
        userName: req.user!.fullName,
        target: newDoc.title,
        details: `Đã tải lên và lập chỉ mục thành công tệp ${fileName} (${chunksCount} đoạn RAG)`,
      });

      return res.json({
        success: true,
        document: updatedDoc,
        material: updatedDoc,
        message: `Đã xử lý xong tệp: trích xuất thành công ${chunksCount} đoạn kiến thức chuẩn.`,
      });
    } catch (parseErr: unknown) {
      const errMessage = parseErr instanceof Error ? parseErr.message : 'Lỗi xử lý tệp';
      const failedDoc = StorageService.updateDocument(docId, {
        processingStatus: 'error',
        errorMessage: errMessage,
      });
      return res.status(422).json({
        error: `Trích xuất văn bản thất bại: ${errMessage}`,
        document: failedDoc,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return res.status(500).json({ error: `Không thể tải lên: ${msg}` });
  }
});

// PATCH /api/materials/:id/status - Toggle activate / deactivate material for BiTi
app.patch('/api/materials/:id/status', requireTeacherOrAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { usageStatus } = req.body;

  if (!['active', 'inactive'].includes(usageStatus)) {
    return res.status(400).json({ error: 'Trạng thái sử dụng không hợp lệ.' });
  }

  const doc = StorageService.findDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
  }

  // Check ownership unless admin
  if (req.user!.role !== 'admin' && doc.uploadedBy.id !== req.user!.id) {
    return res.status(403).json({ error: 'Bạn chỉ có quyền thay đổi tài liệu do chính bạn tải lên.' });
  }

  const updated = StorageService.updateDocument(id, { usageStatus });

  StorageService.logAudit({
    action: usageStatus === 'active' ? 'ACTIVATE' : 'DEACTIVATE',
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.fullName,
    target: doc.title,
    details: `Đã chuyển trạng thái tài liệu [${doc.title}] sang [${usageStatus.toUpperCase()}]`,
  });

  return res.json({ document: updated });
});

// DELETE /api/materials/:id - Delete material
app.delete('/api/materials/:id', requireTeacherOrAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const doc = StorageService.findDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
  }

  // Check ownership unless admin
  if (req.user!.role !== 'admin' && doc.uploadedBy.id !== req.user!.id) {
    return res.status(403).json({ error: 'Bạn chỉ có quyền xóa tài liệu do chính bạn tải lên.' });
  }

  StorageService.deleteDocument(id);

  StorageService.logAudit({
    action: 'DELETE',
    userId: req.user!.id,
    userEmail: req.user!.email,
    userName: req.user!.fullName,
    target: doc.title,
    details: `Đã xóa tài liệu [${doc.title}] và toàn bộ các đoạn trích liên quan khỏi hệ thống`,
  });

  return res.json({ success: true, message: 'Đã xóa tài liệu thành công.' });
});

// GET /api/materials/:id/preview - View extracted text & chunks
app.get('/api/materials/:id/preview', requireTeacherOrAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = StorageService.findDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
  }

  const chunks = StorageService.getChunks().filter((c) => c.documentId === id);
  return res.json({ document: doc, chunks });
});

// POST /api/materials/test-rag - Test query retrieval against active chunks
app.post('/api/materials/test-rag', requireTeacherOrAdmin, (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Vui lòng cung cấp câu hỏi kiểm thử.' });
  }

  const results = StorageService.searchActiveChunks(query, 5);
  let simulatedAnswer = '';
  if (results.length > 0) {
    simulatedAnswer = `Robot BiTi đã tìm thấy ${results.length} đoạn kiến thức phù hợp trong SGK đang kích hoạt.\n\nTrích từ tài liệu: "${results[0].chunk.documentTitle}" (${results[0].chunk.topic}):\n"${results[0].chunk.content.slice(0, 300)}..."`;
  } else {
    simulatedAnswer = 'Hiện tại không tìm thấy đoạn kiến thức nào khớp với câu hỏi trong các tài liệu SGK đang ở trạng thái Kích hoạt.';
  }

  return res.json({ query, results, matchedChunks: results, simulatedAnswer });
});

// ==========================================
// CHAT & VISION ROUTES (RAG Augmented)
// ==========================================

// Chat endpoint with active RAG search grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, textbookContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống. Vui lòng thiết lập khóa trong bảng cài đặt máy chủ.',
      });
    }

    // Extract student's latest question
    const latestUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    const questionText = latestUserMsg ? latestUserMsg.content : '';

    // Perform RAG retrieval from currently ACTIVE documents
    const matchedChunks = StorageService.searchActiveChunks(questionText, 4);

    let dynamicSystemPrompt = BITI_SYSTEM_INSTRUCTION;

    if (matchedChunks.length > 0) {
      const ragContext = matchedChunks
        .map(
          (r, idx) =>
            `[Đoạn tham khảo ${idx + 1}] Nguồn: "${r.chunk.documentTitle}" (Chủ đề: ${r.chunk.topic}, ${r.chunk.lesson || ''}${r.chunk.pageNumber ? ', Trang ' + r.chunk.pageNumber : ''}):\n${r.chunk.content}`
        )
        .join('\n\n');

      dynamicSystemPrompt += `\n\n[HỌC LIỆU SÁCH GIÁO KHOA CHUẨN ĐƯỢC GIÁO VIÊN KÍCH HOẠT]:\n${ragContext}\n\nHướng dẫn trả lời: Hãy dựa vào các đoạn trích trên để giải thích cho học sinh, đồng thời ghi rõ tên tài liệu và bài học làm nguồn tham khảo ở cuối câu trả lời.`;
    } else {
      dynamicSystemPrompt += `\n\n[LƯU Ý RAG]: Không tìm thấy đoạn trích phù hợp trong kho học liệu đã kích hoạt của giáo viên cho câu hỏi này. Hãy giải thích theo kiến thức chuẩn GDPT 2018 Tin học lớp 3 và nói rõ: "BiTi chưa tìm thấy nội dung này trong tài liệu sách giáo khoa được kích hoạt của thầy cô. Con hãy tham khảo thêm bài học trên lớp nhé!".`;
    }

    if (textbookContext) {
      dynamicSystemPrompt += `\n\n[GHI CHÚ GIÁO VIÊN BỔ SUNG]:\n${textbookContext}`;
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const result = await generateWithFallback((model) => ({
      model,
      contents,
      config: {
        systemInstruction: dynamicSystemPrompt,
        temperature: 0.7,
      },
    }));

    const reply = result.text || 'BiTi đã nghe rõ rồi, bạn hãy thử hỏi lại một chút nhé!';
    return res.json({ 
      reply, 
      model: result.modelUsed,
      sources: matchedChunks.map((m) => ({
        documentTitle: m.chunk.documentTitle,
        title: m.chunk.documentTitle,
        topic: m.chunk.topic,
        lesson: m.chunk.lesson,
        pageNumber: m.chunk.pageNumber,
        grade: m.chunk.grade,
        bookSeries: m.chunk.bookSeries,
        similarityScore: m.score,
      })),
    });
  } catch (err: unknown) {
    console.error('Lỗi khi gọi Gemini chat:', err);
    const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ AI.';
    return res.status(500).json({
      error: `BiTi đang gặp chút khó khăn khi suy nghĩ: ${errorMessage}. Bạn hãy thử lại sau ít giây nhé!`,
    });
  }
});

// Vision endpoint for image questions (devices, workbook photos, diagrams)
app.post('/api/vision', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, prompt, textbookContext } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Vui lòng cung cấp dữ liệu hình ảnh.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống.',
      });
    }

    let dynamicSystemPrompt = BITI_SYSTEM_INSTRUCTION + 
      `\n\nHỌC SINH ĐÃ GỬI MỘT BỨC ẢNH. 
Nhiệm vụ của BiTi:
1. Quan sát kỹ những gì có trong ảnh (bộ phận máy tính, bàn phím, chuột, màn hình, trang sách giáo khoa, bài tập trắc nghiệm, hình vẽ Paint).
2. Nếu ảnh mờ hoặc không đọc rõ được câu hỏi/chữ, hãy khuyên học sinh chụp lại rõ nét hơn một cách nhẹ nhàng.
3. Không tự suy diễn những chi tiết bị khuất.
4. Hướng dẫn học sinh giải bài tập theo từng bước, chỉ rõ vị trí chi tiết trên ảnh để học sinh dễ quan sát.`;

    const promptText = prompt || '';
    const visionMatchedChunks = promptText ? StorageService.searchActiveChunks(promptText, 3) : [];
    if (visionMatchedChunks.length > 0) {
      dynamicSystemPrompt += `\n\n[TÀI LIỆU SÁCH GIÁO KHOA LIÊN QUAN]:\n` + 
        visionMatchedChunks.map((m, i) => `[Đoạn ${i+1}] Nguồn: "${m.chunk.documentTitle}" (${m.chunk.topic}):\n${m.chunk.content}`).join('\n\n');
    }

    if (textbookContext) {
      dynamicSystemPrompt += `\n\n[TÀI LIỆU BỔ SUNG]:\n${textbookContext}`;
    }

    let cleanBase64 = imageBase64;
    let cleanMime = mimeType || 'image/jpeg';
    if (imageBase64.includes('base64,')) {
      const parts = imageBase64.split('base64,');
      cleanBase64 = parts[1];
      const match = parts[0].match(/data:(.*?);/);
      if (match && match[1]) {
        cleanMime = match[1];
      }
    }

    const imagePart = {
      inlineData: {
        mimeType: cleanMime,
        data: cleanBase64,
      },
    };

    const textPrompt = prompt && prompt.trim().length > 0 
      ? prompt 
      : 'BiTi ơi, hãy quan sát bức ảnh này và giải thích cho con biết về thiết bị hoặc nội dung bài tập trong hình nhé!';

    const textPart = {
      text: textPrompt,
    };

    const result = await generateWithFallback((model) => ({
      model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        systemInstruction: dynamicSystemPrompt,
        temperature: 0.7,
      },
    }));

    const reply = result.text || 'BiTi đã xem ảnh rồi! Bạn có muốn BiTi giải thích thêm phần nào không?';
    return res.json({ 
      reply, 
      model: result.modelUsed,
      sources: visionMatchedChunks.map((m) => ({
        documentTitle: m.chunk.documentTitle,
        title: m.chunk.documentTitle,
        topic: m.chunk.topic,
        lesson: m.chunk.lesson,
        pageNumber: m.chunk.pageNumber,
        grade: m.chunk.grade,
        bookSeries: m.chunk.bookSeries,
        similarityScore: m.score,
      })),
    });
  } catch (err: unknown) {
    console.error('Lỗi khi gọi Gemini vision:', err);
    const errorMessage = err instanceof Error ? err.message : 'Lỗi xử lý hình ảnh.';
    return res.status(500).json({
      error: `BiTi chưa xem rõ được bức ảnh: ${errorMessage}. Bạn hãy kiểm tra lại ảnh hoặc chụp góc sáng hơn nhé!`,
    });
  }
});

// ==========================================
// TEXT-TO-SPEECH (TTS) ROUTES
// ==========================================

// GET /api/tts/voices - List supported server voices
app.get('/api/tts/voices', (req: Request, res: Response) => {
  res.json({
    googleCloud: [
      { id: 'vi-VN-Neural2-A', name: 'vi-VN-Neural2-A (Nữ - Neural2 tự nhiên)', gender: 'FEMALE' },
      { id: 'vi-VN-Neural2-D', name: 'vi-VN-Neural2-D (Nam - Neural2 chuẩn âm)', gender: 'MALE' },
      { id: 'vi-VN-Wavenet-A', name: 'vi-VN-Wavenet-A (Nữ - WaveNet)', gender: 'FEMALE' },
      { id: 'vi-VN-Wavenet-B', name: 'vi-VN-Wavenet-B (Nam - WaveNet)', gender: 'MALE' },
      { id: 'vi-VN-Standard-A', name: 'vi-VN-Standard-A (Nữ - Tiêu chuẩn)', gender: 'FEMALE' },
      { id: 'vi-VN-Standard-C', name: 'vi-VN-Standard-C (Nữ - Trầm ấm)', gender: 'FEMALE' },
    ],
    geminiTTS: [
      { id: 'Kore', name: 'Kore (Nữ ấm áp, phát âm tiếng Việt rõ ràng)', style: 'warm' },
      { id: 'Puck', name: 'Puck (Vui tươi, sinh động cho thiếu nhi)', style: 'playful' },
      { id: 'Zephyr', name: 'Zephyr (Trầm ấm, đĩnh đạc)', style: 'calm' },
      { id: 'Fenrir', name: 'Fenrir (Nam dứt khoát)', style: 'energetic' },
      { id: 'Charon', name: 'Charon (Nhẹ nhàng)', style: 'gentle' },
    ],
  });
});

// POST /api/tts - Dedicated Vietnamese Text-to-Speech synthesizer
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, provider, voice, speed } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Nội dung văn bản phát âm không được để trống.' });
    }

    const cleanText = text.trim();
    const speakingRate = speed ? Math.max(0.7, Math.min(1.4, parseFloat(speed))) : 0.95;

    // 1. Google Cloud Text-to-Speech mode
    if (provider === 'google_cloud') {
      const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'Chưa cấu hình API Key cho Google Cloud Text-to-Speech.',
          setupRequired: true,
        });
      }

      const gttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const gttsBody = {
        input: { text: cleanText },
        voice: {
          languageCode: 'vi-VN',
          name: voice || 'vi-VN-Neural2-A',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speakingRate,
        },
      };

      try {
        const gttsRes = await fetch(gttsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gttsBody),
        });

        const gttsData = await gttsRes.json();
        if (gttsRes.ok && gttsData.audioContent) {
          return res.json({
            success: true,
            provider: 'google_cloud',
            mimeType: 'audio/mp3',
            audioData: gttsData.audioContent,
            voice: voice || 'vi-VN-Neural2-A',
          });
        } else {
          const apiMsg = gttsData.error?.message || 'Lỗi gọi Google Cloud TTS';
          console.warn('Google Cloud TTS returned:', apiMsg);
          return res.status(502).json({
            error: `Google Cloud TTS: ${apiMsg}`,
            setupRequired: true,
            provider: 'google_cloud',
          });
        }
      } catch (gttsErr: unknown) {
        const msg = gttsErr instanceof Error ? gttsErr.message : 'Lỗi kết nối';
        return res.status(500).json({ error: `Lỗi kết nối Google Cloud TTS: ${msg}` });
      }
    }

    // 2. Gemini Audio TTS (gemini-3.8-flash-lite-tts) - Clean text only!
    const ttsVoice = voice || 'Kore';
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Giọng đọc tiếng Việt tự nhiên, phát âm rõ từng từ có dấu, truyền cảm, phù hợp với học sinh tiểu học',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: ttsVoice },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      return res.json({
        success: true,
        provider: 'gemini_tts',
        mimeType: 'audio/wav',
        audioData: audioBase64,
        voice: ttsVoice,
      });
    }

    return res.status(500).json({ error: 'Mô hình không trả về dữ liệu âm thanh.' });
  } catch (err: unknown) {
    console.error('Lỗi khi xử lý TTS:', err);
    const errorMessage = err instanceof Error ? err.message : 'Lỗi tổng hợp giọng nói.';
    return res.status(500).json({
      error: `Chưa thể tạo âm thanh: ${errorMessage}. Bạn có thể nghe thử giọng khác trong phần Cài đặt nhé!`,
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Robot BiTi Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
