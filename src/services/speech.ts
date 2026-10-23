/**
 * Unified Speech Service for Robot BiTi Grade 3 Informatics
 * Supports:
 * 1. Google Cloud Text-to-Speech (Neural2-A, Neural2-D, etc. via /api/tts)
 * 2. Gemini Audio TTS (Kore, Puck, Zephyr via /api/tts)
 * 3. Browser SpeechSynthesis (STRICT vi-VN validation - NO English fallback)
 * 4. Web Speech Recognition (vi-VN)
 */

import { AudioSettings, TTSProvider } from '../types';
import { prepareVietnameseSpeechText } from './speechNormalizer';

// Web Speech Recognition Interfaces
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface IWindowSpeech extends Window {
  SpeechRecognition?: {
    new (): ISpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new (): ISpeechRecognition;
  };
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

export interface SpeakOptions {
  settings?: AudioSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errMessage: string) => void;
}

export class SpeechService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentAudioElement: HTMLAudioElement | null = null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static recognition: ISpeechRecognition | null = null;
  private static activeAudioUrl: string | null = null;

  /**
   * Check if browser has speech synthesis
   */
  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Check if speech recognition is supported
   */
  public static isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindowSpeech;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  /**
   * Get verified Vietnamese voices installed in browser
   * CRITICAL: Strictly filters for vi / vi-VN. NEVER returns foreign voices!
   */
  public static getVietnameseVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    return all.filter((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang.startsWith('vi') ||
        lang.includes('vi-vn') ||
        lang.includes('vi_vn') ||
        name.includes('vietnam') ||
        name.includes('tiếng việt')
      );
    });
  }

  /**
   * Check if any Vietnamese voice is available in the browser
   */
  public static hasVietnameseBrowserVoice(): boolean {
    return this.getVietnameseVoices().length > 0;
  }

  /**
   * Stop all audio immediately and release resources
   */
  public static stopSpeaking(): void {
    // Stop server-based HTML5 audio
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement.src = '';
      this.currentAudioElement = null;
    }

    if (this.activeAudioUrl) {
      URL.revokeObjectURL(this.activeAudioUrl);
      this.activeAudioUrl = null;
    }

    // Stop browser speech synthesis
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause speech playback
   */
  public static pauseSpeaking(): void {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume speech playback
   */
  public static resumeSpeaking(): void {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play();
    }
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Main Speak Method
   * 1. Prepares text using prepareVietnameseSpeechText()
   * 2. Routes to requested TTS provider (Google Cloud TTS, Gemini TTS, or Browser vi-VN)
   * 3. Prevents overlapping audio
   */
  public static async speak(rawText: string, options?: SpeakOptions): Promise<void> {
    this.stopSpeaking();

    // 1. Prepare phonetic Vietnamese text (separate from displayed markdown text)
    const preparedText = prepareVietnameseSpeechText(rawText);
    if (!preparedText) return;

    const provider: TTSProvider = options?.settings?.provider || 'gemini_tts';
    const rate = options?.settings?.rate || 0.95;

    // A. Browser SpeechSynthesis mode
    if (provider === 'browser') {
      const viVoices = this.getVietnameseVoices();

      // STRICT VALIDATION: If no Vietnamese voice is installed, DO NOT play with English voice!
      if (viVoices.length === 0) {
        const errorMsg = 'Trình duyệt của bạn chưa cài đặt giọng đọc tiếng Việt (vi-VN). Hệ thống đang tự động chuyển sang giọng AI chuẩn...';
        options?.onError?.(errorMsg);
        // Automatically fallback to server Gemini TTS so the child hears clear Vietnamese
        return this.speakWithServerTTS(preparedText, 'gemini_tts', 'Kore', rate, options);
      }

      this.speakWithBrowserSynth(preparedText, viVoices, options);
      return;
    }

    // B. Google Cloud Text-to-Speech mode
    if (provider === 'google_cloud') {
      const voice = options?.settings?.googleCloudVoice || 'vi-VN-Neural2-A';
      return this.speakWithServerTTS(preparedText, 'google_cloud', voice, rate, options, true);
    }

    // C. Gemini TTS mode (default & recommended)
    const geminiVoice = options?.settings?.geminiVoice || 'Kore';
    return this.speakWithServerTTS(preparedText, 'gemini_tts', geminiVoice, rate, options);
  }

  /**
   * Synthesize audio via server API (/api/tts)
   */
  private static async speakWithServerTTS(
    preparedText: string,
    provider: 'google_cloud' | 'gemini_tts',
    voice: string,
    speed: number,
    options?: SpeakOptions,
    allowFallbackToGemini: boolean = false
  ): Promise<void> {
    try {
      options?.onStart?.();

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: preparedText,
          provider,
          voice,
          speed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.audioData) {
        // If Google Cloud was requested but not enabled on project, fallback to Gemini TTS
        if (allowFallbackToGemini && provider === 'google_cloud') {
          console.warn('Google Cloud TTS unavailable, automatically using Gemini TTS fallback...');
          return this.speakWithServerTTS(preparedText, 'gemini_tts', 'Kore', speed, options, false);
        }

        const msg = data.error || 'Không thể tạo âm thanh từ máy chủ.';
        options?.onError?.(msg);
        options?.onEnd?.();
        return;
      }

      // Convert base64 audio to Blob URL
      const mimeType = data.mimeType || (provider === 'google_cloud' ? 'audio/mp3' : 'audio/wav');
      const audioBytes = Uint8Array.from(atob(data.audioData), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);
      this.activeAudioUrl = audioUrl;

      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      // Adjust playback rate if supported
      audio.playbackRate = speed >= 0.8 && speed <= 1.3 ? speed : 1.0;

      audio.onended = () => {
        this.currentAudioElement = null;
        if (this.activeAudioUrl) {
          URL.revokeObjectURL(this.activeAudioUrl);
          this.activeAudioUrl = null;
        }
        options?.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        this.currentAudioElement = null;
        options?.onError?.('Không thể phát tệp âm thanh tiếng Việt.');
        options?.onEnd?.();
      };

      await audio.play();
    } catch (err: unknown) {
      console.error('Server TTS error:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ giọng đọc.';
      options?.onError?.(msg);
      options?.onEnd?.();
    }
  }

  /**
   * Synthesize with browser SpeechSynthesis with verified vi-VN voice only
   */
  private static speakWithBrowserSynth(
    preparedText: string,
    viVoices: SpeechSynthesisVoice[],
    options?: SpeakOptions
  ): void {
    if (!this.synth) {
      options?.onError?.('Trình duyệt không hỗ trợ bộ phát âm thanh.');
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(preparedText);
    utterance.lang = 'vi-VN';
    utterance.rate = options?.settings?.rate ?? 0.95;
    utterance.pitch = options?.settings?.pitch ?? 1.05;

    // Pick chosen or best matching Vietnamese voice
    const requestedUri = options?.settings?.selectedVoiceURI;
    const match = viVoices.find((v) => v.voiceURI === requestedUri);
    utterance.voice = match || viVoices[0];

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.currentUtterance = null;
      options?.onError?.('Lỗi phát âm thanh từ trình duyệt.');
      options?.onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Start Vietnamese voice recognition (vi-VN)
   */
  public static startListening(callbacks: {
    onStart: () => void;
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (errorMsg: string) => void;
    onEnd: () => void;
  }): () => void {
    const win = window as unknown as IWindowSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      callbacks.onError('Trình duyệt chưa hỗ trợ nhận diện giọng nói Web Speech. Con hãy gõ bàn phím câu hỏi nhé!');
      callbacks.onEnd();
      return () => {};
    }

    try {
      const recog = new SpeechRecognitionClass();
      recog.lang = 'vi-VN';
      recog.continuous = false;
      recog.interimResults = true;

      recog.onstart = () => {
        callbacks.onStart();
      };

      recog.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        callbacks.onResult(transcript, Boolean(finalTranscript));
      };

      recog.onerror = (event: SpeechRecognitionErrorEvent) => {
        let message = 'BiTi chưa nghe rõ, con hãy thử nói lại nhé!';
        if (event.error === 'not-allowed') {
          message = 'Trình duyệt chưa cấp quyền sử dụng micro. Con hãy cho phép quyền micro để nói chuyện cùng BiTi nhé!';
        } else if (event.error === 'no-speech') {
          message = 'BiTi chưa nghe thấy tiếng nói. Con hãy đến gần micro hơn một chút nhé!';
        } else if (event.error === 'network') {
          message = 'Đường truyền mạng bị gián đoạn khi nhận diện giọng nói.';
        }
        callbacks.onError(message);
      };

      recog.onend = () => {
        callbacks.onEnd();
      };

      this.recognition = recog;
      recog.start();

      return () => {
        try {
          recog.stop();
        } catch {
          // ignore
        }
      };
    } catch {
      callbacks.onError('Không thể khởi động micro lúc này.');
      callbacks.onEnd();
      return () => {};
    }
  }

  /**
   * Stop listening
   */
  public static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}
