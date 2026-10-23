import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  Volume2, 
  Play, 
  BookOpen, 
  RefreshCw,
  FolderOpen,
  ArrowUpDown,
  Lock,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';
import { User, UserRole, DocumentMaterial, AuditLog, RAGSearchResult } from '../types/auth';
import { BookSeries, AudioSettings } from '../types';
import { BOOK_SERIES_LABELS } from '../data/curriculum';
import { SpeechService } from '../services/speech';

interface TeacherPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  authToken: string | null;
  onOpenAuthModal: () => void;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (partial: Partial<AudioSettings>) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onOpenAuthModal,
  audioSettings,
  onUpdateAudioSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'rag_test' | 'users' | 'audit' | 'audio'>('materials');

  // Materials state
  const [materials, setMaterials] = useState<DocumentMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Upload Form inputs
  const [docTitle, setDocTitle] = useState('');
  const [docGrade, setDocGrade] = useState<'3' | '4' | '5'>('3');
  const [docSeries, setDocSeries] = useState<string>('ket_noi_tri_thuc');
  const [docTopic, setDocTopic] = useState('');
  const [docLesson, setDocLesson] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<{
    document: DocumentMaterial;
    chunks: Array<{ chunkIndex: number; content: string; pageNumber?: number }>;
    rawText: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // RAG Test state
  const [ragQuery, setRagQuery] = useState('Bàn phím máy tính gồm những hàng phím nào?');
  const [ragResults, setRagResults] = useState<RAGSearchResult[]>([]);
  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [ragTesting, setRagTesting] = useState(false);

  // Users state (Admin)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleUpdatingId, setUserRoleUpdatingId] = useState<string | null>(null);

  // Audit Logs state (Admin)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Audio testing
  const [testingSentence, setTestingSentence] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Fetch materials when modal opens or tab changes to materials
  useEffect(() => {
    if (isOpen && authToken && isTeacherOrAdmin) {
      fetchMaterials();
    }
  }, [isOpen, authToken, isTeacherOrAdmin]);

  // Fetch users or audit logs if admin switches tabs
  useEffect(() => {
    if (isOpen && authToken && isAdmin) {
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'audit') fetchAuditLogs();
    }
  }, [activeTab, isOpen, authToken, isAdmin]);

  if (!isOpen) return null;

  // API Call: Fetch materials
  const fetchMaterials = async () => {
    if (!authToken) return;
    setMaterialsLoading(true);
    try {
      const res = await fetch('/api/materials', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // API Call: Upload new material
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !selectedFile) {
      setUploadError('Vui lòng chọn tệp tài liệu để tải lên!');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Lỗi đọc tệp từ thiết bị.'));
        reader.readAsDataURL(selectedFile);
      });

      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'txt';

      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: ext,
          fileData: base64Data,
          title: docTitle || selectedFile.name.replace(/\.[^/.]+$/, ''),
          grade: docGrade,
          bookSeries: docSeries,
          topic: docTopic || 'Chung',
          lesson: docLesson || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tải tài liệu thất bại.');
      }

      const doc = data.material || data.document;
      setUploadSuccess(`Đã tải lên và phân tích thành công: ${doc?.title || selectedFile.name} (${doc?.totalChunks || 0} đoạn dữ liệu)`);
      setSelectedFile(null);
      setDocTitle('');
      setDocTopic('');
      setDocLesson('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMaterials();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Lỗi khi tải tệp.');
    } finally {
      setUploadLoading(false);
    }
  };

  // API Call: Toggle document status (active/inactive)
  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    if (!authToken) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/materials/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ usageStatus: newStatus }),
      });
      if (res.ok) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === id ? { ...m, usageStatus: newStatus } : m))
        );
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // API Call: Delete document
  const handleDeleteDocument = async (id: string, title: string) => {
    if (!authToken) return;
    if (!window.confirm(`Thầy cô có chắc chắn muốn xóa tài liệu "${title}" khỏi hệ thống?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // API Call: Preview document
  const handlePreviewDocument = async (id: string) => {
    if (!authToken) return;
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/materials/${id}/preview`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewDoc(data);
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // API Call: Test RAG search
  const handleRunRAGTest = async () => {
    if (!authToken || !ragQuery.trim()) return;
    setRagTesting(true);
    setRagAnswer(null);
    setRagResults([]);
    try {
      const res = await fetch('/api/materials/test-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          query: ragQuery,
          grade: 3,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRagResults(data.matchedChunks || []);
        setRagAnswer(data.simulatedAnswer || 'Không tạo được câu trả lời.');
      }
    } catch (err) {
      console.error('RAG test error:', err);
    } finally {
      setRagTesting(false);
    }
  };

  // API Call: Fetch users (Admin only)
  const fetchUsers = async () => {
    if (!authToken || !isAdmin) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Users error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // API Call: Change user role (Admin only)
  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (!authToken || !isAdmin) return;
    setUserRoleUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.error || 'Không thể đổi vai trò.');
      }
    } catch (err) {
      console.error('Change role error:', err);
    } finally {
      setUserRoleUpdatingId(null);
    }
  };

  // API Call: Fetch audit logs (Admin only)
  const fetchAuditLogs = async () => {
    if (!authToken || !isAdmin) return;
    setAuditLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Audit logs error:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Test sentence audio playback
  const handleTestSentence = (text: string) => {
    setTestingSentence(text);
    SpeechService.speak(text, {
      settings: audioSettings,
      onEnd: () => setTestingSentence(null),
      onError: () => setTestingSentence(null),
    });
  };

  const TEST_SENTENCES = [
    'Chào con! Mình là Robot BiTi, người bạn đồng hành môn Tin học lớp 3.',
    'Bàn phím máy tính giúp con gõ chữ và số vào máy tính.',
    'Khi ngồi học máy tính, con nhớ ngồi thẳng lưng và mắt cách màn hình 50 cm nhé!',
    'Chuột máy tính có nút trái, nút phải và bánh lăn ở giữa.',
    'Thông tin là tất cả những gì con tiếp nhận được từ thế giới xung quanh.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
              <Database className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                Góc Giáo Viên & Quản Trị Học Liệu Số
                {isAdmin && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-400 text-slate-900 font-extrabold uppercase tracking-wider">
                    Admin
                  </span>
                )}
                {currentUser?.role === 'teacher' && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-400 text-slate-900 font-extrabold uppercase tracking-wider">
                    Giáo viên
                  </span>
                )}
              </h2>
              <p className="text-xs text-sky-200">
                Hệ thống quản lý tài liệu SGK chuẩn GDPT 2018 và kiểm soát tri thức RAG cho Robot BiTi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In or Not Authorized Gate */}
        {!currentUser || !isTeacherOrAdmin ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Yêu cầu quyền Giáo viên hoặc Quản trị viên
            </h3>
            <p className="text-sm text-slate-600 max-w-md">
              Khu vực này dành riêng cho thầy cô giáo và quản trị viên quản lý kho học liệu Tin học, tải tệp SGK, kiểm tra RAG và phân quyền.
              {currentUser?.role === 'student' && (
                <span className="block mt-2 font-semibold text-rose-600">
                  Tài khoản hiện tại của bạn là Học sinh, không có quyền quản lý kho học liệu.
                </span>
              )}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition-colors"
              >
                Đăng nhập tài khoản Thầy Cô / Admin
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'materials'
                    ? 'border-sky-600 text-sky-700 bg-white/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Kho học liệu số ({materials.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('rag_test')}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'rag_test'
                    ? 'border-sky-600 text-sky-700 bg-white/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Thử nghiệm RAG</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'border-sky-600 text-sky-700 bg-white/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Quản trị người dùng</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'audit'
                      ? 'border-sky-600 text-sky-700 bg-white/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Nhật ký thao tác</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'audio'
                    ? 'border-sky-600 text-sky-700 bg-white/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Giọng đọc tiếng Việt</span>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: KHO HỌC LIỆU SỐ */}
              {activeTab === 'materials' && (
                <div className="space-y-6">
                  {/* Upload Form Box */}
                  <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-5 shadow-2xs">
                    <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-sky-600" />
                      Tải lên tài liệu SGK mới (PDF, DOCX, TXT)
                    </h3>

                    {uploadError && (
                      <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{uploadSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Tiêu đề tài liệu *
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Bài 3 - Máy tính người bạn mới"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Khối lớp *
                          </label>
                          <select
                            value={docGrade}
                            onChange={(e) => setDocGrade(e.target.value as '3' | '4' | '5')}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                          >
                            <option value="3">Lớp 3 (Mặc định)</option>
                            <option value="4">Lớp 4</option>
                            <option value="5">Lớp 5</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Bộ sách giáo khoa *
                          </label>
                          <select
                            value={docSeries}
                            onChange={(e) => setDocSeries(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                          >
                            <option value="ket_noi_tri_thuc">Kết nối tri thức với cuộc sống</option>
                            <option value="canh_dieu">Cánh diều</option>
                            <option value="chan_troi_sang_tao">Chân trời sáng tạo</option>
                            <option value="other">Giáo án / Tài liệu mở rộng</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Chủ đề GDPT 2018 (Tuỳ chọn)
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Chủ đề A: Máy tính và em"
                            value={docTopic}
                            onChange={(e) => setDocTopic(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Tên bài học cụ thể (Tuỳ chọn)
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Bài 4 - Làm việc với máy tính"
                            value={docLesson}
                            onChange={(e) => setDocLesson(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* File picker */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            required
                            className="block w-full text-xs text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-xl file:border-0
                              file:text-xs file:font-semibold
                              file:bg-sky-100 file:text-sky-700
                              hover:file:bg-sky-200 cursor-pointer"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={uploadLoading || !selectedFile}
                          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
                        >
                          {uploadLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang tách đoạn và trích xuất...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Tải lên & Tách đoạn RAG</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        * Định dạng hỗ trợ: PDF (.pdf), Word (.docx), Plain Text (.txt). Dung lượng tối đa 20MB. Hệ thống sẽ tự động trích xuất nội dung, làm sạch và chia thành các đoạn ngữ nghĩa phục vụ câu trả lời của Robot BiTi.
                      </p>
                    </form>
                  </div>

                  {/* Materials List Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800">
                        Danh sách tài liệu đã lưu trữ ({materials.length})
                      </h3>
                      <button
                        onClick={fetchMaterials}
                        disabled={materialsLoading}
                        className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${materialsLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <th className="py-3 px-4">Tài liệu & Thông tin</th>
                            <th className="py-3 px-3">Khối / Bộ sách</th>
                            <th className="py-3 px-3">Đoạn RAG</th>
                            <th className="py-3 px-3">Người tải</th>
                            <th className="py-3 px-3 text-center">Trạng thái RAG</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {materials.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500">
                                Chưa có tài liệu nào. Thầy cô hãy tải lên tệp SGK ở biểu mẫu phía trên!
                              </td>
                            </tr>
                          ) : (
                            materials.map((mat) => {
                              const isActive = mat.usageStatus === 'active';
                              return (
                                <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-800">{mat.title}</div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                      <span className="uppercase px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-700 font-mono text-[10px]">
                                        {mat.fileType}
                                      </span>
                                      <span>{mat.fileName}</span>
                                      <span>•</span>
                                      <span>{(mat.fileSize / 1024).toFixed(1)} KB</span>
                                    </div>
                                    {mat.topic && (
                                      <div className="text-[11px] text-sky-700 mt-0.5">
                                        {mat.topic} {mat.lesson && `— ${mat.lesson}`}
                                      </div>
                                    )}
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-slate-700">Lớp {mat.grade}</div>
                                    <div className="text-[11px] text-slate-500">
                                      {BOOK_SERIES_LABELS[mat.bookSeries as BookSeries]?.split('(')[0]?.trim() || mat.bookSeries}
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                                      {mat.totalChunks} đoạn
                                    </span>
                                  </td>

                                  <td className="py-3 px-3 text-slate-600">
                                    <div className="font-medium">{mat.uploadedBy.fullName}</div>
                                    <div className="text-[10px] text-slate-400">{mat.uploadedBy.email}</div>
                                  </td>

                                  <td className="py-3 px-3 text-center">
                                    <button
                                      onClick={() => handleToggleStatus(mat.id, mat.usageStatus)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                                        isActive
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                          : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                                      }`}
                                      title={isActive ? 'Tài liệu ĐANG ĐƯỢC DÙNG để trả lời học sinh. Bấm để tạm ngưng.' : 'Tài liệu ĐANG TẮT (Robot BiTi sẽ không dùng). Bấm để kích hoạt.'}
                                    >
                                      {isActive ? (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                          <span>Đang kích hoạt</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                                          <span>Tạm ngưng</span>
                                        </>
                                      )}
                                    </button>
                                  </td>

                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handlePreviewDocument(mat.id)}
                                        className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                                        title="Xem trước nội dung trích xuất & các đoạn RAG"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDocument(mat.id, mat.title)}
                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                        title="Xóa tài liệu khỏi hệ thống"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THỬ NGHIỆM RAG */}
              {activeTab === 'rag_test' && (
                <div className="space-y-6">
                  <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Kiểm nghiệm truy xuất ngữ nghĩa (RAG Verification)
                    </h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      Thầy cô có thể đặt bất kỳ câu hỏi nào để kiểm tra xem hệ thống có tìm đúng các đoạn văn bản trong SGK đang kích hoạt hay không, và xem câu trả lời mô phỏng của BiTi có trích dẫn đúng nguồn hay không.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={ragQuery}
                        onChange={(e) => setRagQuery(e.target.value)}
                        placeholder="Nhập câu hỏi Tin học (VD: Bàn phím có những hàng phím nào?)"
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        onClick={handleRunRAGTest}
                        disabled={ragTesting || !ragQuery.trim()}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
                      >
                        {ragTesting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Đang truy xuất...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Truy vấn RAG</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-[11px] text-slate-500 font-semibold self-center">Câu hỏi gợi ý:</span>
                      {[
                        'Bàn phím máy tính gồm những hàng phím nào?',
                        'Thông tin là gì? Cho ví dụ',
                        'Chuột máy tính có những thao tác cơ bản nào?',
                        'Quy tắc an toàn khi sử dụng máy tính là gì?'
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setRagQuery(q); }}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-amber-300 text-slate-700 hover:bg-amber-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Display */}
                  {ragAnswer !== null && (
                    <div className="space-y-4">
                      {/* Simulated Answer */}
                      <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <h4 className="text-xs font-bold text-sky-950 uppercase">
                            Câu trả lời Robot BiTi tạo ra dựa trên SGK:
                          </h4>
                        </div>
                        <div className="p-3 rounded-xl bg-sky-50/70 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {ragAnswer}
                        </div>
                      </div>

                      {/* Matched Chunks */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-sky-600" />
                          Các đoạn SGK được truy xuất ({ragResults.length} đoạn khớp):
                        </h4>

                        {ragResults.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-200">
                            Không tìm thấy đoạn kiến thức phù hợp trong các tài liệu SGK đang kích hoạt.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {ragResults.map((r, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition-all text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sky-900 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">
                                      #{idx + 1}
                                    </span>
                                    {r.chunk.documentTitle}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                                    Độ khớp: {Math.round(r.score * 100)}%
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Lớp {r.chunk.grade} • Bộ: {r.chunk.bookSeries} {r.chunk.topic && `• Chủ đề: ${r.chunk.topic}`} {r.chunk.lesson && `• Bài: ${r.chunk.lesson}`}
                                </div>
                                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-sans">
                                  {r.chunk.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: QUẢN TRỊ NGƯỜI DÙNG (Admin) */}
              {activeTab === 'users' && isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Danh sách tài khoản ({usersList.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Chỉ Quản trị viên (Admin) mới có quyền cấp hoặc thu hồi quyền Giáo viên.
                      </p>
                    </div>
                    <button
                      onClick={fetchUsers}
                      disabled={usersLoading}
                      className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                      Làm mới
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="py-3 px-4">Họ và tên & Email</th>
                          <th className="py-3 px-3">Vai trò hiện tại</th>
                          <th className="py-3 px-3">Ngày tạo</th>
                          <th className="py-3 px-4 text-right">Phân quyền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList.map((u) => {
                          const isSelf = u.id === currentUser?.id;
                          return (
                            <tr key={u.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                  {u.fullName}
                                  {isSelf && (
                                    <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.2 rounded-sm border border-sky-200">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{u.email}</div>
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    u.role === 'admin'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : u.role === 'teacher'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                                  }`}
                                >
                                  {u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-slate-500 text-[11px]">
                                {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                              </td>

                              <td className="py-3 px-4 text-right">
                                {isSelf ? (
                                  <span className="text-slate-400 text-[11px] italic">Không tự sửa vai trò</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <select
                                      value={u.role}
                                      disabled={userRoleUpdatingId === u.id}
                                      onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-sky-500"
                                    >
                                      <option value="student">Học sinh (Không có quyền upload)</option>
                                      <option value="teacher">Giáo viên (Được quản lý SGK)</option>
                                      <option value="admin">Quản trị viên (Toàn quyền)</option>
                                    </select>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: NHẬT KÝ THAO TÁC (Admin) */}
              {activeTab === 'audit' && isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Nhật ký thao tác hệ thống ({auditLogs.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Ghi nhận toàn bộ thao tác tải lên, kích hoạt, vô hiệu hóa, xóa tài liệu và thay đổi phân quyền.
                      </p>
                    </div>
                    <button
                      onClick={fetchAuditLogs}
                      disabled={auditLoading}
                      className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                      Làm mới
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="py-3 px-4">Thời gian</th>
                          <th className="py-3 px-3">Hành động</th>
                          <th className="py-3 px-3">Người thực hiện</th>
                          <th className="py-3 px-4">Chi tiết thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-500">
                              Chưa có nhật ký nào được ghi lại.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                                  log.action === 'UPLOAD' ? 'bg-sky-100 text-sky-800' :
                                  log.action === 'ACTIVATE' ? 'bg-emerald-100 text-emerald-800' :
                                  log.action === 'DEACTIVATE' ? 'bg-amber-100 text-amber-800' :
                                  log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                                  log.action === 'ROLE_CHANGE' ? 'bg-purple-100 text-purple-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {log.userEmail}
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                {log.details}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: GIỌNG ĐỌC TIẾNG VIỆT */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-sky-600" />
                      Cấu hình động cơ phát âm tiếng Việt (TTS)
                    </h3>
                    <p className="text-xs text-slate-600 mb-4">
                      Tách riêng biệt câu trả lời kiến thức và chỉ dẫn âm thanh. Tuyệt đối không đọc hướng dẫn hệ thống thành tiếng.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Provider Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Bộ chuyển đổi âm thanh (TTS Provider)
                        </label>
                        <select
                          value={audioSettings.provider}
                          onChange={(e) =>
                            onUpdateAudioSettings({
                              provider: e.target.value as 'gemini_tts' | 'google_cloud' | 'browser',
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="gemini_tts">Google Gemini TTS (Chuẩn giọng Việt tự nhiên)</option>
                          <option value="google_cloud">Google Cloud Neural2 (vi-VN-Neural2-A / Neural2-D)</option>
                          <option value="browser">Web Speech API (Trình duyệt máy khách)</option>
                        </select>
                      </div>

                      {/* Google Cloud Voice selection */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Giọng Cloud / Gemini
                        </label>
                        <select
                          value={audioSettings.googleCloudVoice}
                          onChange={(e) => onUpdateAudioSettings({ googleCloudVoice: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="vi-VN-Neural2-A">vi-VN-Neural2-A (Nữ miền Bắc, ấm áp, truyền cảm)</option>
                          <option value="vi-VN-Neural2-D">vi-VN-Neural2-D (Nam miền Bắc, rõ ràng)</option>
                          <option value="vi-VN-Wavenet-A">vi-VN-Wavenet-A (Nữ)</option>
                          <option value="vi-VN-Wavenet-B">vi-VN-Wavenet-B (Nam)</option>
                        </select>
                      </div>

                      {/* Rate Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>Tốc độ đọc: {audioSettings.rate}x</span>
                          <span className="text-slate-400 text-[11px]">(0.9x - 1.0x tối ưu cho lớp 3)</span>
                        </div>
                        <input
                          type="range"
                          min="0.75"
                          max="1.3"
                          step="0.05"
                          value={audioSettings.rate}
                          onChange={(e) => onUpdateAudioSettings({ rate: parseFloat(e.target.value) })}
                          className="w-full accent-sky-600"
                        />
                      </div>

                      {/* Pitch Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>Độ cao giọng: {audioSettings.pitch}</span>
                          <span className="text-slate-400 text-[11px]">(1.0 - 1.1 trong trẻo, vui tươi)</span>
                        </div>
                        <input
                          type="range"
                          min="0.8"
                          max="1.3"
                          step="0.05"
                          value={audioSettings.pitch}
                          onChange={(e) => onUpdateAudioSettings({ pitch: parseFloat(e.target.value) })}
                          className="w-full accent-sky-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5 Mandatory Test Sentences */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4 text-sky-600" />
                      5 Câu mẫu kiểm tra độ phát âm tiếng Việt chuẩn:
                    </h4>
                    <div className="space-y-2">
                      {TEST_SENTENCES.map((st, idx) => {
                        const isSpeakingThis = testingSentence === st;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="text-slate-700 flex-1 leading-relaxed">
                              <span className="font-bold text-sky-700 mr-2">{idx + 1}.</span>
                              {st}
                            </span>
                            <button
                              onClick={() => {
                                if (isSpeakingThis) {
                                  SpeechService.stopSpeaking();
                                  setTestingSentence(null);
                                } else {
                                  handleTestSentence(st);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 ${
                                isSpeakingThis
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{isSpeakingThis ? 'Dừng' : 'Phát thử'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* PREVIEW DOCUMENT MODAL OVERLAY */}
        {previewDoc && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xs flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Xem trước nội dung trích xuất: {previewDoc.document.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Tổng số {previewDoc.chunks.length} đoạn đã được lập chỉ mục phục vụ truy xuất RAG
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {previewDoc.chunks.map((chk) => (
                <div
                  key={chk.chunkIndex}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="font-bold text-sky-800 flex items-center justify-between">
                    <span>Đoạn #{chk.chunkIndex + 1}</span>
                    {chk.pageNumber && <span className="text-slate-400">Trang {chk.pageNumber}</span>}
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans">{chk.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xs hover:bg-slate-300"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phân quyền máy chủ & Xác thực HMAC Token bảo mật</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
