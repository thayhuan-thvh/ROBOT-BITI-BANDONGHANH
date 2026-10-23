import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Volume2, 
  ShieldCheck, 
  Sliders, 
  Play, 
  Square,
  FileText,
  AlertTriangle,
  Info,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BookSeries, TeacherMaterial, AudioSettings, TTSProvider } from '../types';
import { SpeechService } from '../services/speech';
import { prepareVietnameseSpeechText } from '../services/speechNormalizer';

interface TeacherCornerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookSeries: BookSeries;
  onChangeBookSeries: (series: BookSeries) => void;
  materials: TeacherMaterial[];
  onAddMaterial: (mat: Omit<TeacherMaterial, 'id' | 'dateAdded'>) => void;
  onDeleteMaterial: (id: string) => void;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (settings: Partial<AudioSettings>) => void;
}

// 5 Mandatory Test Sentences required by Section 8
const MANDATORY_TEST_SENTENCES = [
  'Xin chào! Mình là Robot BiTi, người bạn đồng hành học Tin học của bạn.',
  'Bàn phím dùng để nhập chữ, số và kí hiệu vào máy tính.',
  'Chuột máy tính giúp chúng ta di chuyển con trỏ, chọn đối tượng và thực hiện các thao tác.',
  'Để bảo vệ mắt, bạn nên ngồi đúng tư thế và giữ khoảng cách phù hợp với màn hình.',
  'Máy tính gồm các thiết bị có chức năng khác nhau. Mỗi thiết bị giúp chúng ta thực hiện một công việc nhất định.',
];

export const TeacherCornerModal: React.FC<TeacherCornerModalProps> = ({
  isOpen,
  onClose,
  currentBookSeries,
  onChangeBookSeries,
  materials,
  onAddMaterial,
  onDeleteMaterial,
  audioSettings,
  onUpdateAudioSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'audio' | 'test' | 'safety'>('audio');
  
  // New material form state
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('Chủ đề A: Máy tính và em');
  const [newContent, setNewContent] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState(false);

  // Test playground state
  const [testPrompt, setTestPrompt] = useState('Bàn phím máy tính dùng để làm gì?');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Playing test sentence index
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);
  const [audioErrorNotice, setAudioErrorNotice] = useState<string | null>(null);

  // Available browser voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (SpeechService.isSpeechSynthesisSupported()) {
      const loadVoices = () => {
        const v = SpeechService.getVietnameseVoices();
        setBrowserVoices(v);
      };
      loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddMaterial({
      title: newTitle.trim(),
      bookSeries: currentBookSeries,
      topic: newTopic,
      content: newContent.trim(),
    });

    setNewTitle('');
    setNewContent('');
    setAddSuccessMsg(true);
    setTimeout(() => setAddSuccessMsg(false), 3000);
  };

  const handleTestChat = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testPrompt }],
          textbookContext: materials.map(m => `[${m.topic}] ${m.title}: ${m.content}`).join('\n\n'),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResponse(data.reply || 'Không có phản hồi.');
      } else {
        setTestResponse(`Lỗi: ${data.error || 'Không kết nối được server.'}`);
      }
    } catch {
      setTestResponse('Lỗi kết nối kiểm thử.');
    } finally {
      setIsTesting(false);
    }
  };

  // Play a specific test sentence with active settings
  const handlePlaySentence = (sentence: string, index: number) => {
    if (playingSentenceIndex === index) {
      SpeechService.stopSpeaking();
      setPlayingSentenceIndex(null);
      return;
    }

    setAudioErrorNotice(null);
    setPlayingSentenceIndex(index);

    SpeechService.speak(sentence, {
      settings: audioSettings,
      onEnd: () => setPlayingSentenceIndex(null),
      onError: (err) => {
        setAudioErrorNotice(err);
        setPlayingSentenceIndex(null);
      },
    });
  };

  const handleStopAllAudio = () => {
    SpeechService.stopSpeaking();
    setPlayingSentenceIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-sky-700 to-sky-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Góc Giáo Viên & Quản Trị Hệ Thống BiTi</h2>
              <p className="text-xs text-sky-200">Cấu hình giọng đọc tiếng Việt, kiểm thử phát âm và quản lý tài liệu SGK</p>
            </div>
          </div>
          <button 
            onClick={() => { handleStopAllAudio(); onClose(); }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 bg-slate-50 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => { handleStopAllAudio(); setActiveTab('audio'); }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audio'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Cài đặt giọng đọc (TTS)</span>
          </button>

          <button
            onClick={() => { handleStopAllAudio(); setActiveTab('test'); }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'test'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Kiểm thử phát âm (5 câu chuẩn)</span>
          </button>

          <button
            onClick={() => { handleStopAllAudio(); setActiveTab('materials'); }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'materials'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Kho tài liệu SGK</span>
          </button>

          <button
            onClick={() => { handleStopAllAudio(); setActiveTab('safety'); }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'safety'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>An toàn học đường</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Cài đặt giọng đọc (TTS) */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              
              {/* Error Notice */}
              {audioErrorNotice && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                  <span>{audioErrorNotice}</span>
                  <button onClick={() => setAudioErrorNotice(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TTS Provider Selection */}
              <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-sky-950 mb-1 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-sky-600" />
                    <span>Lựa chọn công nghệ tổng hợp giọng nói tiếng Việt:</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hệ thống đã tách riêng văn bản hiển thị và văn bản phát âm, giúp câu trả lời được đọc chuẩn dấu thanh, rõ ràng.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option 1: Gemini TTS */}
                  <button
                    type="button"
                    onClick={() => onUpdateAudioSettings({ provider: 'gemini_tts' })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      audioSettings.provider === 'gemini_tts'
                        ? 'bg-white border-sky-600 ring-2 ring-sky-300 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-sky-900">Gemini Audio TTS</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Khuyên dùng</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Giọng đọc AI tự nhiên, phát âm tiếng Việt đầy đủ dấu thanh, ngữ điệu truyền cảm cho trẻ tiểu học.
                    </p>
                  </button>

                  {/* Option 2: Google Cloud TTS */}
                  <button
                    type="button"
                    onClick={() => onUpdateAudioSettings({ provider: 'google_cloud' })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      audioSettings.provider === 'google_cloud'
                        ? 'bg-white border-sky-600 ring-2 ring-sky-300 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-sky-900">Google Cloud TTS</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">Neural2 / WaveNet</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Giọng đọc chuyên dụng vi-VN (Neural2-A, Neural2-D). Cần kích hoạt Text-to-Speech API trên dự án.
                    </p>
                  </button>

                  {/* Option 3: Browser SpeechSynthesis */}
                  <button
                    type="button"
                    onClick={() => onUpdateAudioSettings({ provider: 'browser' })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      audioSettings.provider === 'browser'
                        ? 'bg-white border-sky-600 ring-2 ring-sky-300 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-sky-900">Trình duyệt (vi-VN)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Dự phòng</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Chỉ phát khi thiết bị có cài đặt giọng đọc tiếng Việt. Tuyệt đối không tự động đọc bằng tiếng Anh.
                    </p>
                  </button>
                </div>

                {/* Sub-config: Voice Pickers */}
                <div className="pt-2 border-t border-sky-200/60">
                  {audioSettings.provider === 'gemini_tts' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Chọn giọng đọc Gemini TTS:
                      </label>
                      <select
                        value={audioSettings.geminiVoice || 'Kore'}
                        onChange={(e) => onUpdateAudioSettings({ geminiVoice: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                      >
                        <option value="Kore">Kore – Giọng Nữ ấm áp, phát âm tiếng Việt chuẩn từng từ (Khuyên dùng cho lớp 3)</option>
                        <option value="Puck">Puck – Giọng Nam vui tươi, sôi nổi, thân thiện</option>
                        <option value="Zephyr">Zephyr – Giọng Nam đĩnh đạc, từ tốn</option>
                        <option value="Fenrir">Fenrir – Giọng Nam rõ ràng, mạch lạc</option>
                        <option value="Charon">Charon – Giọng Nhẹ nhàng, êm dịu</option>
                      </select>
                    </div>
                  )}

                  {audioSettings.provider === 'google_cloud' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Chọn cấu hình giọng Google Cloud vi-VN:
                        </label>
                        <select
                          value={audioSettings.googleCloudVoice || 'vi-VN-Neural2-A'}
                          onChange={(e) => onUpdateAudioSettings({ googleCloudVoice: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                        >
                          <option value="vi-VN-Neural2-A">vi-VN-Neural2-A (Giọng Nữ - Công nghệ Neural2 tự nhiên, chuẩn dấu)</option>
                          <option value="vi-VN-Neural2-D">vi-VN-Neural2-D (Giọng Nam - Công nghệ Neural2 ấm áp)</option>
                          <option value="vi-VN-Wavenet-A">vi-VN-Wavenet-A (Giọng Nữ - WaveNet)</option>
                          <option value="vi-VN-Wavenet-B">vi-VN-Wavenet-B (Giọng Nam - WaveNet)</option>
                          <option value="vi-VN-Standard-A">vi-VN-Standard-A (Giọng Nữ - Standard)</option>
                          <option value="vi-VN-Standard-C">vi-VN-Standard-C (Giọng Nữ Trầm - Standard)</option>
                        </select>
                      </div>

                      {/* Informative setup notice */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Hướng dẫn kích hoạt Google Cloud Text-to-Speech API:</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed">
                            Google Cloud TTS yêu cầu API được kích hoạt trên Google Cloud Project của bạn. Nếu chưa kích hoạt, hệ thống sẽ tự động sử dụng <strong>Gemini TTS</strong> làm phương án dự phòng chất lượng cao để đảm bảo giọng đọc luôn hoạt động.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {audioSettings.provider === 'browser' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Giọng đọc tiếng Việt (vi-VN) có sẵn trên trình duyệt:
                      </label>
                      {browserVoices.length > 0 ? (
                        <select
                          value={audioSettings.selectedVoiceURI}
                          onChange={(e) => onUpdateAudioSettings({ selectedVoiceURI: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                        >
                          {browserVoices.map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <span>
                            Không tìm thấy giọng tiếng Việt vi-VN trên máy này. Ứng dụng sẽ tự động chuyển sang <strong>Gemini Audio TTS</strong> để không đọc nhầm bằng giọng tiếng Anh.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Speed rate slider */}
                <div className="pt-2 border-t border-sky-200/60">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Tốc độ đọc phù hợp cho học sinh lớp 3:</span>
                    <span className="font-mono text-sky-700 font-bold">{audioSettings.rate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={audioSettings.rate}
                    onChange={(e) => onUpdateAudioSettings({ rate: parseFloat(e.target.value) })}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Chậm (0.8x)</span>
                    <span>Chuẩn lớp 3 (0.95x)</span>
                    <span>Nhanh (1.2x)</span>
                  </div>
                </div>

                {/* Auto speak toggle */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-sky-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Tự động đọc to khi có câu trả lời mới</div>
                    <div className="text-[11px] text-slate-500">Giúp học sinh khiếm thị hoặc các em thích học bằng cách nghe.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSettings.autoSpeak}
                    onChange={(e) => onUpdateAudioSettings({ autoSpeak: e.target.checked })}
                    className="w-5 h-5 accent-sky-600 cursor-pointer"
                  />
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Kiểm thử phát âm bắt buộc (Section 8) */}
          {activeTab === 'test' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>5 Câu Kiểm Thử Bắt Buộc Theo Chuẩn Sư Phạm Tin Học 3</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Thầy cô hãy bấm nghe từng câu dưới đây với công nghệ đang chọn (<strong>{audioSettings.provider === 'gemini_tts' ? 'Gemini TTS' : audioSettings.provider === 'google_cloud' ? 'Google Cloud TTS' : 'Trình duyệt vi-VN'}</strong>) để thẩm định độ rõ nét, đúng dấu thanh:
                </p>
              </div>

              {audioErrorNotice && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                  <span>{audioErrorNotice}</span>
                  <button onClick={() => setAudioErrorNotice(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {MANDATORY_TEST_SENTENCES.map((sentence, idx) => {
                  const isPlaying = playingSentenceIndex === idx;
                  const phoneticVersion = prepareVietnameseSpeechText(sentence);

                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPlaying 
                          ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-sky-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Văn bản hiển thị gốc:
                            </span>
                          </div>
                          
                          <p className="text-xs md:text-sm text-slate-800 font-semibold pl-8">
                            “{sentence}”
                          </p>

                          <div className="pl-8 pt-1 text-[11px] text-slate-500">
                            <span className="font-medium text-sky-800">Bản phát âm chuẩn hóa TTS: </span>
                            <span className="italic">{phoneticVersion}</span>
                          </div>
                        </div>

                        {/* Play/Stop button */}
                        <button
                          type="button"
                          onClick={() => handlePlaySentence(sentence, idx)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Dừng đọc</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Nghe mẫu {idx + 1}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom testing sandbox */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Thử nghiệm câu hỏi tự chọn:
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                    placeholder="Nhập câu bất kỳ để thử nghiệm..."
                  />
                  <button
                    onClick={handleTestChat}
                    disabled={isTesting}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isTesting ? 'Đang hỏi Gemini...' : 'Hỏi & Đọc thử'}
                  </button>
                </div>

                {testResponse && (
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900">Phản hồi từ BiTi:</span>
                      <button
                        onClick={() => SpeechService.speak(testResponse, { settings: audioSettings })}
                        className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-sky-200"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe phát âm</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-sky-100">
                      {testResponse}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: Kho tài liệu SGK */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {/* Select Active Book Series */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider mb-2">
                  Bộ sách giáo khoa Tin học 3 đang áp dụng:
                </label>
                <select
                  value={currentBookSeries}
                  onChange={(e) => onChangeBookSeries(e.target.value as BookSeries)}
                  className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="ket_noi_tri_thuc">Kết nối tri thức với cuộc sống (Khuyên dùng - Chuẩn GDPT 2018)</option>
                  <option value="canh_dieu">Cánh diều</option>
                  <option value="chan_troi_sang_tao">Chân trời sáng tạo</option>
                </select>
                <p className="mt-1.5 text-xs text-sky-700">
                  BiTi sẽ tự động ưu tiên kiến thức và thuật ngữ tương ứng theo bộ sách thầy cô đã chọn.
                </p>
              </div>

              {/* Upload / Add Custom Material Form */}
              <form onSubmit={handleCreateMaterial} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-sky-600" />
                  <span>Bổ sung tài liệu / Bài giảng / Ghi chú của giáo viên</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tiêu đề tài liệu:</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Phiếu học tập Bài 3 - Bàn phím"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Chủ đề:</label>
                    <select
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                    >
                      <option value="Chủ đề A: Máy tính và em">Chủ đề A: Máy tính và em</option>
                      <option value="Chủ đề B: Mạng máy tính và Internet">Chủ đề B: Mạng máy tính và Internet</option>
                      <option value="Chủ đề C: Tổ chức lưu trữ, tìm kiếm">Chủ đề C: Tổ chức lưu trữ, tìm kiếm</option>
                      <option value="Chủ đề D: Đạo đức, văn hoá số">Chủ đề D: Đạo đức, văn hoá số</option>
                      <option value="Chủ đề E: Ứng dụng tin học (Gõ phím, Paint)">Chủ đề E: Ứng dụng tin học</option>
                      <option value="Chủ đề F: Giải quyết vấn đề">Chủ đề F: Giải quyết vấn đề</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nội dung tóm tắt / Kiến thức chuẩn cần lưu ý:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Dán nội dung sách giáo khoa, hướng dẫn giải bài tập hoặc câu hỏi trọng tâm mà giáo viên muốn BiTi ưu tiên sử dụng..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {addSuccessMsg ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Đã thêm tài liệu vào kho kiến thức chuẩn!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Lưu vào nguồn tham chiếu
                  </button>
                </div>
              </form>

              {/* Uploaded Materials List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tài liệu bổ sung hiện có ({materials.length}):
                </h4>
                {materials.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Chưa có tài liệu tùy chỉnh nào. Hệ thống đang sử dụng dữ liệu chuẩn của bộ sách Kết nối tri thức.
                  </p>
                ) : (
                  materials.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{m.title}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                            {m.topic}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2">{m.content}</p>
                        <span className="text-[10px] text-slate-400">{m.dateAdded}</span>
                      </div>
                      <button
                        onClick={() => onDeleteMaterial(m.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md cursor-pointer"
                        title="Xóa tài liệu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: An toàn học đường */}
          {activeTab === 'safety' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Chính sách An Toàn Học Đường & Quyền Riêng Tư Của Trẻ Em</span>
                </div>
                <p>
                  Ứng dụng tuân thủ nghiêm ngặt chuẩn an toàn cho học sinh tiểu học:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Không thu thập và không lưu trữ thông tin nhận dạng cá nhân (họ tên đầy đủ, địa chỉ nhà, số điện thoại, trường lớp cụ thể).</li>
                  <li>Ảnh chụp bài tập và giọng nói chỉ dùng tạm thời để xử lý câu hỏi trong phiên học, không lưu trữ lâu dài.</li>
                  <li>Gemini API Key và Cloud Credentials được bảo mật hoàn toàn phía máy chủ trung gian, không bị phơi bày ra trình duyệt.</li>
                  <li>Không có quảng cáo, không có nội dung độc hại.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => { handleStopAllAudio(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng bảng cài đặt
          </button>
        </div>

      </div>
    </div>
  );
};
