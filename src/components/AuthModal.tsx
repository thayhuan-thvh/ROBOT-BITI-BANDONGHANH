import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  KeyRound,
  Building,
  GraduationCap,
  Clock
} from 'lucide-react';
import { User } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerRole, setRegisterRole] = useState<'teacher' | 'student'>('teacher');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập không thành công.');
      }
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsPendingNotice(false);

    // Validation
    const cleanEmail = regEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại!');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự để bảo đảm an toàn.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.');
      return;
    }

    if (registerRole === 'teacher' && (!regSchool || !regSchool.trim())) {
      setErrorMessage('Thầy/cô vui lòng nhập trường hoặc đơn vị công tác.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: cleanEmail,
          school: registerRole === 'teacher' ? regSchool.trim() : undefined,
          password: regPassword,
          confirmPassword: regConfirmPassword,
          isTeacher: registerRole === 'teacher',
          role: registerRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký không thành công.');
      }

      onAuthSuccess(data.user, data.token);

      if (registerRole === 'teacher' || data.user.status === 'pending') {
        setIsPendingNotice(true);
        setSuccessNotice('Tài khoản của thầy/cô đang chờ quản trị viên phê duyệt');
      } else {
        setSuccessNotice(data.message || 'Đăng ký tài khoản thành công!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cổng Xác Thực Robot BiTi</h3>
              <p className="text-xs text-sky-100">Đăng ký & Quản lý tài khoản Giáo viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); setSuccessNotice(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-sky-600 text-sky-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); setSuccessNotice(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-sky-600 text-sky-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className={`p-4 rounded-2xl text-xs border flex items-start gap-3 ${
              isPendingNotice 
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              {isPendingNotice ? (
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">{successNotice}</div>
                {isPendingNotice ? (
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Hồ sơ giáo viên đã được tiếp nhận an toàn. Quản trị viên hệ thống sẽ kiểm tra và kích hoạt quyền quản lý học liệu cho thầy/cô trong thời gian sớm nhất.
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-700">Đang chuyển tiếp về giao diện...</p>
                )}
                {isPendingNotice && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Đã hiểu & Đóng
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ten@truonghoc.edu.vn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}</span>
              </button>

              {/* Demo Accounts Presets for Quick Testing */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Tài khoản mẫu được khởi tạo sẵn (Bấm để điền nhanh):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@biti.edu.vn', 'Admin@BiTi2026')}
                    className="p-2 rounded-lg border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-sky-800 text-left font-medium cursor-pointer transition-colors"
                  >
                    <span className="font-bold block text-sky-900">👑 Quản trị viên</span>
                    admin@biti.edu.vn
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('giaovien@biti.edu.vn', 'GiaoVien@123')}
                    className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-left font-medium cursor-pointer transition-colors"
                  >
                    <span className="font-bold block text-emerald-900">👩‍🏫 Giáo viên</span>
                    giaovien@biti.edu.vn
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              
              {/* Role selection tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRegisterRole('teacher')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    registerRole === 'teacher'
                      ? 'bg-white text-sky-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Tôi là Giáo viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('student')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    registerRole === 'student'
                      ? 'bg-white text-sky-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Tôi là Học sinh</span>
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên {registerRole === 'teacher' ? 'thầy/cô *' : 'học sinh *'}:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={registerRole === 'teacher' ? 'VD: Thầy Nguyễn Văn Minh' : 'VD: Em Lê Bảo An'}
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email {registerRole === 'teacher' ? 'công vụ / liên hệ *' : 'đăng ký *'}:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="email@truonghoc.edu.vn"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* School (Required for teachers) */}
              {registerRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trường / Đơn vị công tác *:
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="VD: Trường Tiểu học Chu Văn An, Hà Nội"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu (tối thiểu 6 ký tự) *:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu *:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Nhập lại mật khẩu để xác nhận"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {registerRole === 'teacher' && (
                <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl text-[11px] text-sky-900 leading-relaxed">
                  📌 <strong>Quy định bảo mật:</strong> Tài khoản giáo viên sau khi đăng ký sẽ ở trạng thái <em>Chờ duyệt (pending)</em>. Quản trị viên hệ thống sẽ kiểm duyệt trước khi cấp quyền tải và quản lý kho học liệu.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer mt-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Đang gửi hồ sơ...' : registerRole === 'teacher' ? 'Đăng ký tài khoản Giáo viên' : 'Đăng ký tài khoản Học sinh'}</span>
              </button>
            </form>
          )}

          {/* Student policy disclaimer */}
          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            Học sinh có thể trải nghiệm hỏi đáp và luyện tập mà không bắt buộc đăng nhập.
          </div>

        </div>

      </div>
    </div>
  );
};
