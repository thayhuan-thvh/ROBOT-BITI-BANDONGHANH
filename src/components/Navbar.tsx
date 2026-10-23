import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  Award, 
  Settings, 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import { BookSeries } from '../types';
import { User } from '../types/auth';

interface NavbarProps {
  activeTab: 'chat' | 'practice' | 'lessons';
  setActiveTab: (tab: 'chat' | 'practice' | 'lessons') => void;
  starCount: number;
  autoSpeak: boolean;
  toggleAutoSpeak: () => void;
  onOpenTeacherModal: () => void;
  currentBookSeries: BookSeries;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  starCount,
  autoSpeak,
  toggleAutoSpeak,
  onOpenTeacherModal,
  currentBookSeries,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-sm ring-2 ring-sky-200">
              <span className="font-extrabold text-base tracking-tighter">BiTi</span>
            </div>
            <div>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setActiveTab('chat'); }}
                className="text-sm sm:text-base md:text-lg font-bold text-sky-950 tracking-tight flex items-center gap-1.5 whitespace-nowrap"
              >
                ROBOT BITI
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-semibold border border-sky-200">
                  TIN HỌC
                </span>
              </a>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                Bạn đồng hành
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hỏi đáp</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'practice'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Luyện tập</span>
            </button>

            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'lessons'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bài học</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Star Reward Counter */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs sm:text-sm font-bold text-amber-700 shadow-2xs"
              title="Số ngôi sao bạn đạt được khi trả lời đúng"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="tabular-nums">{starCount}</span>
              <span className="hidden sm:inline text-[11px] text-amber-600 font-medium">Sao</span>
            </div>

            {/* Voice auto-read toggle */}
            <button
              onClick={toggleAutoSpeak}
              className={`p-2 rounded-lg border transition-all ${
                autoSpeak 
                  ? 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={autoSpeak ? 'Đang bật tự động đọc tiếng Việt (Bấm để tắt)' : 'Đang tắt tự động đọc (Bấm để bật)'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Teacher / Admin Portal Button */}
            <button
              onClick={onOpenTeacherModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                isTeacherOrAdmin
                  ? 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Góc Giáo Viên & Quản Trị Kho Học Liệu Số"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">
                {currentUser?.role === 'admin' ? 'Quản Trị' : 'Góc Giáo Viên'}
              </span>
            </button>

            {/* User Account / Auth Section */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <div 
                  className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  title={`${currentUser.fullName} (${currentUser.email})`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden xl:inline font-semibold max-w-[100px] truncate">
                    {currentUser.fullName}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-sm text-[10px] font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : currentUser.role === 'teacher'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'teacher' ? 'GV' : 'HS'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
