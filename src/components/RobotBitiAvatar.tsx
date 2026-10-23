import React from 'react';
import { BiTiState } from '../types';

interface RobotBitiAvatarProps {
  state: BiTiState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  bubbleText?: string;
  onAvatarClick?: () => void;
}

export const RobotBitiAvatar: React.FC<RobotBitiAvatarProps> = ({
  state,
  size = 'md',
  showSpeechBubble = true,
  bubbleText,
  onAvatarClick,
}) => {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32 md:w-40 md:h-40',
    lg: 'w-44 h-44 md:w-52 md:h-52',
    xl: 'w-56 h-56 md:w-64 md:h-64',
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'listening':
        return { text: 'BiTi đang lắng nghe con nói...', color: 'bg-emerald-500 text-white' };
      case 'thinking':
        return { text: 'BiTi đang suy nghĩ câu trả lời...', color: 'bg-amber-500 text-white animate-pulse' };
      case 'speaking':
        return { text: 'BiTi đang đọc cho con nghe...', color: 'bg-sky-600 text-white' };
      case 'celebrating':
        return { text: 'Hoan hô! Bạn giỏi quá!', color: 'bg-yellow-400 text-slate-900 font-bold' };
      case 'greeting':
        return { text: 'BiTi chào bạn nhé!', color: 'bg-sky-500 text-white' };
      default:
        return { text: 'Sẵn sàng cùng con học Tin học!', color: 'bg-sky-100 text-sky-800' };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="flex flex-col items-center select-none relative">
      {/* Speech Bubble */}
      {showSpeechBubble && bubbleText && (
        <div className="relative mb-3 max-w-xs md:max-w-md bg-white border-2 border-sky-200 shadow-md rounded-2xl p-3 text-sm md:text-base text-slate-700 text-center font-medium transition-all duration-300">
          <p>{bubbleText}</p>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-sky-200 rotate-45 transform"></div>
        </div>
      )}

      {/* Robot SVG Container */}
      <div 
        onClick={onAvatarClick}
        className={`relative ${sizeMap[size]} cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95`}
        title="Robot BiTi – Bấm vào mình để nghe chào hỏi nhé!"
      >
        {/* Soft Background Aura depending on state */}
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-colors duration-500 ${
            state === 'listening' ? 'bg-emerald-400 scale-110 animate-ping' :
            state === 'thinking' ? 'bg-amber-400 scale-105' :
            state === 'speaking' ? 'bg-sky-400 scale-105' :
            state === 'celebrating' ? 'bg-yellow-400 scale-125' :
            'bg-sky-200'
          }`}
        />

        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full relative z-10 drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Robot Body Gradients */}
            <linearGradient id="bitiBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>

            <linearGradient id="bitiBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            <linearGradient id="bitigoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Glowing Eye Filter */}
            <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Antenna */}
          <g className={state === 'thinking' ? 'animate-bounce' : ''}>
            {/* Antenna Stem */}
            <line x1="100" y1="42" x2="100" y2="20" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" />
            {/* Antenna Ring Pulsing */}
            {state === 'listening' && (
              <circle cx="100" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.7">
                <animate attributeName="r" values="8;18" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Antenna Ball */}
            <circle cx="100" cy="18" r="9" fill="url(#bitigoldGrad)" stroke="#CA8A04" strokeWidth="2" />
            <circle cx="97" cy="15" r="3" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* Ears / Sound Receivers */}
          {/* Left Ear */}
          <g>
            <rect x="24" y="70" width="16" height="34" rx="8" fill="url(#bitiBlueGrad)" stroke="#0369A1" strokeWidth="2" />
            <circle cx="32" cy="87" r="4" fill="url(#bitigoldGrad)" />
            {state === 'listening' && (
              <path d="M 18 75 Q 12 87 18 99" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round">
                <animate attributeName="stroke-width" values="2;4;2" dur="0.8s" repeatCount="indefinite" />
              </path>
            )}
          </g>

          {/* Right Ear */}
          <g>
            <rect x="160" y="70" width="16" height="34" rx="8" fill="url(#bitiBlueGrad)" stroke="#0369A1" strokeWidth="2" />
            <circle cx="168" cy="87" r="4" fill="url(#bitigoldGrad)" />
            {state === 'listening' && (
              <path d="M 182 75 Q 188 87 182 99" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round">
                <animate attributeName="stroke-width" values="2;4;2" dur="0.8s" repeatCount="indefinite" />
              </path>
            )}
          </g>

          {/* Head Outer Shell */}
          <rect 
            x="36" 
            y="38" 
            width="128" 
            height="100" 
            rx="32" 
            fill="url(#bitiBodyGrad)" 
            stroke="#0284C7" 
            strokeWidth="4" 
          />

          {/* Head Blue Accent Cap */}
          <path 
            d="M 60 38 Q 100 32 140 38 L 140 46 Q 100 42 60 46 Z" 
            fill="url(#bitiBlueGrad)" 
          />

          {/* Face Visor / Screen */}
          <rect 
            x="48" 
            y="52" 
            width="104" 
            height="72" 
            rx="20" 
            fill="url(#screenGrad)" 
            stroke="#38BDF8" 
            strokeWidth="2.5" 
          />

          {/* Visor Reflection Gloss */}
          <path 
            d="M 54 58 L 146 58 Q 146 68 136 74 L 64 74 Q 54 68 54 58 Z" 
            fill="#FFFFFF" 
            opacity="0.12" 
          />

          {/* EYES */}
          {state === 'celebrating' ? (
            /* Star Eyes for Celebrating */
            <g fill="#FDE047" stroke="#EAB308" strokeWidth="1">
              {/* Left Star Eye */}
              <polygon points="76,68 80,78 91,78 82,84 85,95 76,88 67,95 70,84 61,78 72,78" />
              {/* Right Star Eye */}
              <polygon points="124,68 128,78 139,78 130,84 133,95 124,88 115,95 118,84 109,78 120,78" />
            </g>
          ) : state === 'thinking' ? (
            /* Thinking Eyes (Looking up to right) */
            <g fill="#38BDF8" filter="url(#eyeGlow)">
              <circle cx="78" cy="74" r="10" />
              <circle cx="82" cy="70" r="3.5" fill="#FFFFFF" />
              <circle cx="126" cy="74" r="10" />
              <circle cx="130" cy="70" r="3.5" fill="#FFFFFF" />
            </g>
          ) : state === 'listening' ? (
            /* Attentive Big Round Eyes */
            <g fill="#10B981" filter="url(#eyeGlow)">
              <circle cx="76" cy="80" r="12" />
              <circle cx="73" cy="76" r="4.5" fill="#FFFFFF" />
              <circle cx="124" cy="80" r="12" />
              <circle cx="121" cy="76" r="4.5" fill="#FFFFFF" />
            </g>
          ) : (
            /* Standard Friendly Bright Cyan Eyes */
            <g fill="#06B6D4" filter="url(#eyeGlow)">
              {/* Left Eye */}
              <ellipse cx="76" cy="80" rx="10.5" ry="12" />
              <circle cx="73" cy="76" r="4" fill="#FFFFFF" />
              <circle cx="80" cy="84" r="2" fill="#FFFFFF" />
              {/* Right Eye */}
              <ellipse cx="124" cy="80" rx="10.5" ry="12" />
              <circle cx="121" cy="76" r="4" fill="#FFFFFF" />
              <circle cx="128" cy="84" r="2" fill="#FFFFFF" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <circle cx="62" cy="98" r="5" fill="#F43F5E" opacity="0.4" />
          <circle cx="138" cy="98" r="5" fill="#F43F5E" opacity="0.4" />

          {/* MOUTH */}
          {state === 'speaking' ? (
            /* Animated Speaking Mouth */
            <ellipse cx="100" cy="104" rx="12" ry="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="2">
              <animate attributeName="ry" values="4;8;3;7;5" dur="0.4s" repeatCount="indefinite" />
              <animate attributeName="rx" values="10;14;9;13;10" dur="0.4s" repeatCount="indefinite" />
            </ellipse>
          ) : state === 'celebrating' || state === 'greeting' ? (
            /* Huge Joyful Smile */
            <path 
              d="M 88 100 Q 100 114 112 100" 
              fill="#FDE047" 
              stroke="#EAB308" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
          ) : state === 'thinking' ? (
            /* Wondering O Mouth */
            <circle cx="100" cy="103" r="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          ) : (
            /* Gentle Gentle Smile */
            <path 
              d="M 90 102 Q 100 111 110 102" 
              fill="none" 
              stroke="#38BDF8" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
          )}

          {/* NECK */}
          <rect x="88" y="138" width="24" height="10" rx="4" fill="#0284C7" />

          {/* CHEST / BODY */}
          <path 
            d="M 64 148 L 136 148 Q 152 148 150 178 L 148 196 Q 148 200 144 200 L 56 200 Q 52 200 52 196 L 50 178 Q 48 148 64 148 Z" 
            fill="url(#bitiBodyGrad)" 
            stroke="#0284C7" 
            strokeWidth="3.5" 
          />

          {/* Chest Heart/Core Badge (Informatics Star) */}
          <circle cx="100" cy="174" r="14" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
          <polygon 
            points="100,165 103,171 110,171 104,175 106,181 100,177 94,181 96,175 90,171 97,171" 
            fill="url(#bitigoldGrad)" 
          />

          {/* Arms */}
          {state === 'greeting' || state === 'celebrating' ? (
            /* Left Arm Waving Up */
            <g>
              <path 
                d="M 52 156 Q 30 140 26 120" 
                fill="none" 
                stroke="#0284C7" 
                strokeWidth="8" 
                strokeLinecap="round" 
              />
              <circle cx="26" cy="116" r="8" fill="url(#bitigoldGrad)" stroke="#CA8A04" strokeWidth="2" />
            </g>
          ) : (
            /* Left Arm Resting */
            <g>
              <path 
                d="M 52 156 Q 36 175 42 192" 
                fill="none" 
                stroke="#0284C7" 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
              <circle cx="42" cy="192" r="7" fill="url(#bitigoldGrad)" stroke="#CA8A04" strokeWidth="2" />
            </g>
          )}

          {/* Right Arm */}
          {state === 'celebrating' ? (
            /* Right Arm Waving Up Too */
            <g>
              <path 
                d="M 148 156 Q 170 140 174 120" 
                fill="none" 
                stroke="#0284C7" 
                strokeWidth="8" 
                strokeLinecap="round" 
              />
              <circle cx="174" cy="116" r="8" fill="url(#bitigoldGrad)" stroke="#CA8A04" strokeWidth="2" />
            </g>
          ) : (
            /* Right Arm Resting */
            <g>
              <path 
                d="M 148 156 Q 164 175 158 192" 
                fill="none" 
                stroke="#0284C7" 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
              <circle cx="158" cy="192" r="7" fill="url(#bitigoldGrad)" stroke="#CA8A04" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Status Text Badge */}
      <div className={`mt-2 px-3 py-1 text-xs md:text-sm font-semibold rounded-full shadow-sm transition-all duration-300 ${status.color}`}>
        {status.text}
      </div>
    </div>
  );
};
