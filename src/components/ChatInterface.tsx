import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Trash2, 
  Volume2, 
  Square, 
  RotateCcw, 
  Camera, 
  X, 
  Sparkles,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { ChatMessage, BiTiState, AudioSettings } from '../types';
import { QUICK_SUGGESTIONS } from '../data/curriculum';
import { SpeechService } from '../services/speech';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageBase64?: string) => Promise<void>;
  onClearChat: () => void;
  bitiState: BiTiState;
  setBitiState: (state: BiTiState) => void;
  autoSpeak: boolean;
  speakingMessageId: string | null;
  setSpeakingMessageId: (id: string | null) => void;
  audioSettings: AudioSettings;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  bitiState,
  setBitiState,
  autoSpeak,
  speakingMessageId,
  setSpeakingMessageId,
  audioSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, bitiState]);

  // Handle voice recording
  const handleToggleVoice = () => {
    if (isListening) {
      SpeechService.stopListening();
      setIsListening(false);
      setBitiState('idle');
      return;
    }

    setErrorMessage(null);
    setSpeechTranscript('');

    const stopFn = SpeechService.startListening({
      onStart: () => {
        setIsListening(true);
        setBitiState('listening');
      },
      onResult: (transcript, isFinal) => {
        setSpeechTranscript(transcript);
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          setBitiState('idle');
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsListening(false);
        setBitiState('idle');
      },
      onEnd: () => {
        setIsListening(false);
        if (bitiState === 'listening') {
          setBitiState('idle');
        }
      },
    });

    return stopFn;
  };

  // Image file select
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Con hãy chọn một tệp hình ảnh (JPG, PNG) nhé!');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Bức ảnh hơi lớn (vượt quá 8MB). Con hãy chọn ảnh nhỏ hơn nhé!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setErrorMessage('Không thể mở máy ảnh. Con hãy kiểm tra quyền truy cập camera của trình duyệt nhé!');
      setIsCameraActive(false);
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
    }
    stopCamera();
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Submit Question
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();

    if (!cleanText && !selectedImage) {
      setErrorMessage('Con hãy gõ câu hỏi hoặc bấm micro để nói nhé!');
      return;
    }

    setErrorMessage(null);
    setInputText('');
    setSpeechTranscript('');
    const imageToSend = selectedImage;
    setSelectedImage(null);

    // Stop listening if active
    if (isListening) {
      SpeechService.stopListening();
      setIsListening(false);
    }

    await onSendMessage(cleanText || 'BiTi ơi hãy quan sát bức ảnh này nhé!', imageToSend || undefined);
  };

  // Voice playback controls for an assistant message
  const handlePlayVoice = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      SpeechService.stopSpeaking();
      setSpeakingMessageId(null);
      setBitiState('idle');
      return;
    }

    setSpeakingMessageId(msgId);
    setBitiState('speaking');
    setErrorMessage(null);

    SpeechService.speak(text, {
      settings: audioSettings,
      onEnd: () => {
        setSpeakingMessageId(null);
        setBitiState('idle');
      },
      onError: (err) => {
        setSpeakingMessageId(null);
        setBitiState('idle');
        setErrorMessage(err || 'Không thể phát âm thanh câu trả lời.');
      },
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Suggestions Chips Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-sky-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Gợi ý câu hỏi hay cho bạn:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(suggestion);
                setErrorMessage(null);
              }}
              className="text-xs bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 py-1.5 rounded-full border border-sky-200 transition-colors shrink-0 shadow-2xs cursor-pointer font-medium"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white/70 border border-sky-100 shadow-inner p-4 md:p-6 space-y-4 min-h-[360px] max-h-[560px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-sky-500 animate-spin-slow" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">
              Hộp trò chuyện cùng Robot BiTi
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              Con có thể gõ câu hỏi, nhấn nút micro để nói tiếng Việt, hoặc chụp ảnh bài tập trong sách để hỏi BiTi nhé!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Robot Avatar Mini Icon */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-sky-200">
                    BiTi
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xs text-sm md:text-base leading-relaxed ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-sky-100 rounded-tl-xs shadow-sm'
                  }`}
                >
                  {/* Attached Image if present */}
                  {msg.imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-sky-200 max-h-60 max-w-sm">
                      <img 
                        src={msg.imageUrl} 
                        alt="Hình ảnh bài tập" 
                        className="w-full h-auto object-contain bg-slate-900/5"
                      />
                    </div>
                  )}

                  {/* Message Text with Paragraphing */}
                  <div className="whitespace-pre-wrap break-words space-y-2">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Knowledge Source Badges (RAG Citations) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-sky-100/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-800 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                        <span>Trích nguồn học liệu số đã kiểm duyệt:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, sIdx) => (
                          <div 
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 font-medium"
                            title={`Chủ đề: ${s.topic}${s.lesson ? ` - ${s.lesson}` : ''} (Độ tương đồng: ${Math.round(s.similarityScore * 100)}%)`}
                          >
                            <span className="font-semibold">{s.documentTitle}</span>
                            {s.lesson && <span className="text-sky-600">• {s.lesson}</span>}
                            <span className="text-[10px] text-sky-500 font-bold bg-white px-1.5 py-0.2 rounded-sm border border-sky-100">
                              Lớp {s.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Controls for Robot BiTi responses */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePlayVoice(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                            isSpeaking
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                          }`}
                          title={isSpeaking ? 'Dừng đọc' : 'Nghe BiTi đọc'}
                        >
                          {isSpeaking ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Dừng đọc</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Nghe BiTi đọc</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            SpeechService.stopSpeaking();
                            handlePlayVoice(msg.id, msg.content);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Nghe lại từ đầu"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Avatar Mini Icon */}
                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-amber-200">
                    Con
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* BiTi Thinking Indicator */}
        {bitiState === 'thinking' && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              BiTi
            </div>
            <div className="bg-white border border-sky-100 rounded-2xl rounded-tl-xs p-3.5 shadow-sm text-sm text-slate-600 flex items-center gap-2">
              <div className="flex gap-1.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-bounce"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="font-medium text-sky-700">BiTi đang suy nghĩ câu trả lời cho con...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview Area */}
      {selectedImage && (
        <div className="mt-2 p-2 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={selectedImage} 
              alt="Ảnh bài tập đã chọn" 
              className="w-14 h-14 object-cover rounded-lg border border-sky-300"
            />
            <div>
              <p className="text-xs font-semibold text-sky-900">Ảnh đã được đính kèm</p>
              <p className="text-[11px] text-slate-500">Con có thể gõ thêm câu hỏi bên dưới rồi nhấn Gửi nhé!</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Camera Live Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 md:p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-600" />
                <span>Chụp ảnh bài tập hoặc thiết bị</span>
              </h3>
              <button 
                onClick={stopCamera} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>Chụp ảnh này</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Notice */}
      {errorMessage && (
        <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Listening Feedback Banner */}
      {isListening && (
        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-semibold">Đang lắng nghe:</span>
            <span className="italic">{speechTranscript || 'Con hãy nói câu hỏi bằng tiếng Việt...'}</span>
          </div>
          <button
            onClick={handleToggleVoice}
            className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md font-medium hover:bg-emerald-700"
          >
            Xong
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2 bg-white rounded-2xl p-2 border-2 border-sky-200 shadow-md focus-within:border-sky-500 transition-colors">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          title="Tải ảnh bài tập hoặc thiết bị"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Camera Button */}
        <button
          type="button"
          onClick={startCamera}
          className="p-2.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors hidden sm:block"
          title="Chụp ảnh trực tiếp bằng camera"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-emerald-500 text-white shadow-md animate-pulse'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
          }`}
          title={isListening ? 'Bấm để dừng nói' : 'Bấm để nói câu hỏi (Web Speech vi-VN)'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Con muốn hỏi BiTi điều gì nhỉ? (Gõ chữ hoặc bấm micro)..."
          className="flex-1 bg-transparent border-none outline-none px-2 text-sm md:text-base text-slate-800 placeholder-slate-400"
        />

        {/* Clear chat button */}
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors hidden sm:block"
            title="Xóa lịch sử hội thoại"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={bitiState === 'thinking'}
          className={`p-3 rounded-xl font-bold flex items-center justify-center transition-all ${
            bitiState === 'thinking'
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95'
          }`}
          title="Gửi câu hỏi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
