import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RobotBitiAvatar } from './components/RobotBitiAvatar';
import { ChatInterface } from './components/ChatInterface';
import { PracticeZone } from './components/PracticeZone';
import { LessonsExplorer } from './components/LessonsExplorer';
import { TeacherPortal } from './components/TeacherPortal';
import { AuthModal } from './components/AuthModal';
import { 
  ChatMessage, 
  BiTiState, 
  BookSeries, 
  AudioSettings 
} from './types';
import { User } from './types/auth';
import { SpeechService } from './services/speech';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'chat' | 'practice' | 'lessons'>('chat');

  // Robot BiTi avatar status
  const [bitiState, setBitiState] = useState<BiTiState>('greeting');
  const [bubbleText, setBubbleText] = useState<string>(
    'Chào bạn! Mình là Robot BiTi, người bạn đồng hành môn Tin học lớp 3. Hãy hỏi BiTi bất cứ điều gì bạn chưa hiểu nhé!'
  );

  // User & Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('biti_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('biti_auth_token');
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTeacherPortalOpen, setIsTeacherPortalOpen] = useState(false);

  // Validate and refresh user session with server on initial mount
  useEffect(() => {
    if (!authToken) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token expired or invalid');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('biti_auth_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Clear invalid session
        setCurrentUser(null);
        setAuthToken(null);
        localStorage.removeItem('biti_auth_token');
        localStorage.removeItem('biti_auth_user');
      });
  }, [authToken]);

  // Handle successful login/registration
  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    try {
      localStorage.setItem('biti_auth_user', JSON.stringify(user));
      localStorage.setItem('biti_auth_token', token);
    } catch {
      // ignore
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('biti_auth_user');
      localStorage.removeItem('biti_auth_token');
    } catch {
      // ignore
    }
  };

  // Chat conversation messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'Chào con! Thầy cô và BiTi rất vui được đồng hành cùng con trong môn Tin học lớp 3. Con có thể gõ câu hỏi, nhấn nút micro để nói, hoặc chụp ảnh bài tập trong sách để hỏi BiTi nhé! 🤖✨',
        timestamp: Date.now(),
      },
    ];
  });

  // Star Rewards Count
  const [starCount, setStarCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('biti_stars');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  // Audio settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem('biti_audio_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      autoSpeak: true,
      provider: 'gemini_tts',
      googleCloudVoice: 'vi-VN-Neural2-A',
      geminiVoice: 'Kore',
      rate: 0.95,
      pitch: 1.05,
      selectedVoiceURI: '',
      isMuted: false,
    };
  });

  // Active playing message ID
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Active book series
  const [currentBookSeries] = useState<BookSeries>(() => {
    try {
      const saved = localStorage.getItem('biti_book_series');
      if (saved) return saved as BookSeries;
    } catch {
      // fallback
    }
    return 'ket_noi_tri_thuc';
  });

  // Save stars
  const handleEarnStar = () => {
    setStarCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('biti_stars', next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Toggle Auto-speak
  const handleToggleAutoSpeak = () => {
    setAudioSettings((prev) => {
      const next = { ...prev, autoSpeak: !prev.autoSpeak };
      try {
        localStorage.setItem('biti_audio_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (!next.autoSpeak) {
        SpeechService.stopSpeaking();
        setSpeakingMessageId(null);
        if (bitiState === 'speaking') setBitiState('idle');
      }
      return next;
    });
  };

  // Update audio settings
  const handleUpdateAudioSettings = (partial: Partial<AudioSettings>) => {
    setAudioSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem('biti_audio_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Clear chat conversation
  const handleClearChat = () => {
    SpeechService.stopSpeaking();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'msg-cleared-' + Date.now(),
        role: 'assistant',
        content: 'BiTi đã làm mới trang hội thoại rồi! Con muốn hỏi BiTi câu hỏi nào tiếp theo nhỉ?',
        timestamp: Date.now(),
      },
    ]);
    setBitiState('idle');
  };

  // Interactive Avatar Click
  const handleAvatarClick = () => {
    setBitiState('greeting');
    const greetingText = 'Chào bạn! Mình là Robot BiTi, sẵn sàng cùng bạn khám phá thế giới Tin học 3!';
    setBubbleText(greetingText);
    SpeechService.speak(greetingText, {
      settings: audioSettings,
      onEnd: () => setBitiState('idle'),
      onError: () => setBitiState('idle'),
    });
  };

  // Send message to Gemini API backend with RAG Knowledge Search
  const handleSendMessage = async (text: string, imageBase64?: string) => {
    // Stop any ongoing speech
    SpeechService.stopSpeaking();
    setSpeakingMessageId(null);

    const userMsgId = 'user_' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      imageUrl: imageBase64,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setBitiState('thinking');
    setBubbleText('Đang tra cứu kho học liệu và suy nghĩ câu trả lời...');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      let replyContent = '';
      let retrievedSources: ChatMessage['sources'] = undefined;

      if (imageBase64) {
        // Call Vision endpoint
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            imageBase64,
            prompt: text,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Lỗi khi gửi ảnh');
        }
        replyContent = data.reply;
        retrievedSources = data.sources;
      } else {
        // Call Text Chat endpoint with RAG context
        const chatHistory = [...messages, newUserMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: chatHistory,
            bookSeries: currentBookSeries,
            grade: 3,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Lỗi kết nối AI');
        }
        replyContent = data.reply;
        retrievedSources = data.sources;
      }

      const botMsgId = 'bot_' + Date.now();
      const newBotMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: replyContent,
        timestamp: Date.now(),
        sources: retrievedSources,
      };

      setMessages((prev) => [...prev, newBotMsg]);

      // Set speech bubble snippet
      const shortSnippet = replyContent.slice(0, 100) + (replyContent.length > 100 ? '...' : '');
      setBubbleText(shortSnippet);

      // Auto speak if enabled
      if (audioSettings.autoSpeak) {
        setBitiState('speaking');
        setSpeakingMessageId(botMsgId);
        SpeechService.speak(replyContent, {
          settings: audioSettings,
          onEnd: () => {
            setSpeakingMessageId(null);
            setBitiState('idle');
          },
          onError: () => {
            setSpeakingMessageId(null);
            setBitiState('idle');
          },
        });
      } else {
        setBitiState('idle');
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errMsg = err instanceof Error ? err.message : 'BiTi chưa kết nối được máy chủ AI.';
      const errorBotMsg: ChatMessage = {
        id: 'bot_err_' + Date.now(),
        role: 'assistant',
        content: `BiTi đang gặp chút khó khăn: ${errMsg}. Con hãy thử lại sau ít giây nhé!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorBotMsg]);
      setBitiState('idle');
      setBubbleText('Ối, kết nối bị gián đoạn một chút rồi!');
    }
  };

  // Jump from Lessons Explorer to Chat with a sample question
  const handleAskAboutLesson = (lessonTitle: string, sampleQuestion?: string) => {
    setActiveTab('chat');
    const question = sampleQuestion || `BiTi ơi, hãy giải thích giúp con về bài học "${lessonTitle}" nhé!`;
    handleSendMessage(question);
  };

  return (
    <div className="min-h-screen bg-radial from-sky-50 via-sky-100/40 to-white flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          SpeechService.stopSpeaking();
          setSpeakingMessageId(null);
          setActiveTab(tab);
        }}
        starCount={starCount}
        autoSpeak={audioSettings.autoSpeak}
        toggleAutoSpeak={handleToggleAutoSpeak}
        onOpenTeacherModal={() => setIsTeacherPortalOpen(true)}
        currentBookSeries={currentBookSeries}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Robot BiTi Section */}
      <section className="pt-6 pb-4 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <RobotBitiAvatar
            state={bitiState}
            size="md"
            showSpeechBubble={true}
            bubbleText={bubbleText}
            onAvatarClick={handleAvatarClick}
          />
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {activeTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            bitiState={bitiState}
            setBitiState={setBitiState}
            autoSpeak={audioSettings.autoSpeak}
            speakingMessageId={speakingMessageId}
            setSpeakingMessageId={setSpeakingMessageId}
            audioSettings={audioSettings}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeZone
            onEarnStar={handleEarnStar}
            setBitiState={setBitiState}
            audioSettings={audioSettings}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsExplorer
            onAskAboutLesson={handleAskAboutLesson}
          />
        )}
      </main>

      {/* Teacher & Admin Portal Modal */}
      <TeacherPortal
        isOpen={isTeacherPortalOpen}
        onClose={() => setIsTeacherPortalOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        audioSettings={audioSettings}
        onUpdateAudioSettings={handleUpdateAudioSettings}
      />

      {/* Authentication Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Subtle Footer */}
      <footer className="py-4 border-t border-sky-100 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ROBOT BITI · Bạn Đồng Hành Tin Học 3 · Chương trình GDPT 2018</span>
          <span>Khẩu hiệu: “Học Tin học thật vui – Khám phá thế giới số cùng BiTi!”</span>
        </div>
      </footer>
    </div>
  );
}
