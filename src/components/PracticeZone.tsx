import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  ArrowRight,
  Award,
  Zap,
  Volume2
} from 'lucide-react';
import { QuizQuestion, BiTiState, AudioSettings } from '../types';
import { INITIAL_QUIZ_QUESTIONS } from '../data/curriculum';
import { SpeechService } from '../services/speech';

interface PracticeZoneProps {
  onEarnStar: () => void;
  setBitiState: (state: BiTiState) => void;
  audioSettings?: AudioSettings;
}

export const PracticeZone: React.FC<PracticeZoneProps> = ({
  onEarnStar,
  setBitiState,
  audioSettings,
}) => {
  const [questions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<number | null>(null);
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const currentQ = questions[currentIndex];

  // Matching game: select left item and right item
  const [activeMatchingLeft, setActiveMatchingLeft] = useState<string | null>(null);

  const filteredQuestions = activeCategoryFilter === 'all'
    ? questions
    : questions.filter(q => q.topicId === activeCategoryFilter);

  const q = filteredQuestions[currentIndex] || questions[0];

  // Handle MCQ / True-False answer submission
  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    const correct = index === q.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      onEarnStar();
      setBitiState('celebrating');
      setTimeout(() => setBitiState('idle'), 3500);
    } else {
      setBitiState('thinking');
      setTimeout(() => setBitiState('idle'), 2500);
    }
  };

  // Handle Matching click
  const handleMatchingPair = (rightMatch: string) => {
    if (!activeMatchingLeft || isAnswered) return;
    const nextPairs = { ...matchingSelections, [activeMatchingLeft]: rightMatch };
    setMatchingSelections(nextPairs);
    setActiveMatchingLeft(null);

    // If all items matched, check
    if (q.pairs && Object.keys(nextPairs).length === q.pairs.length) {
      const allCorrect = Object.entries(nextPairs).every(
        ([left, right]) => (q.correctAnswer as Record<string, string>)[left] === right
      );
      setIsCorrect(allCorrect);
      setIsAnswered(true);
      if (allCorrect) {
        onEarnStar();
        setBitiState('celebrating');
        setTimeout(() => setBitiState('idle'), 3500);
      }
    }
  };

  // Next Question
  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedTrueFalse(null);
    setMatchingSelections({});
    setActiveMatchingLeft(null);
    setShowHint(false);
    setIsCorrect(false);

    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Reset current question to try again
  const handleRetry = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedTrueFalse(null);
    setMatchingSelections({});
    setActiveMatchingLeft(null);
    setShowHint(false);
    setIsCorrect(false);
  };

  // Read question aloud
  const handleReadQuestion = () => {
    const textToSpeak = `${q.title}. ${q.question}. ${q.options ? q.options.join('. ') : ''}`;
    SpeechService.speak(textToSpeak, { settings: audioSettings });
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      
      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center gap-1.5 p-1 bg-sky-100/70 rounded-xl overflow-x-auto">
        <button
          onClick={() => { setActiveCategoryFilter('all'); setCurrentIndex(0); handleRetry(); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeCategoryFilter === 'all'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-600 hover:text-sky-700'
          }`}
        >
          Tất cả câu đố ({questions.length})
        </button>
        <button
          onClick={() => { setActiveCategoryFilter('topic_a'); setCurrentIndex(0); handleRetry(); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeCategoryFilter === 'topic_a'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-600 hover:text-sky-700'
          }`}
        >
          Máy tính & Em
        </button>
        <button
          onClick={() => { setActiveCategoryFilter('topic_b'); setCurrentIndex(0); handleRetry(); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeCategoryFilter === 'topic_b'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-600 hover:text-sky-700'
          }`}
        >
          An toàn Internet
        </button>
        <button
          onClick={() => { setActiveCategoryFilter('topic_e'); setCurrentIndex(0); handleRetry(); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeCategoryFilter === 'topic_e'
              ? 'bg-white text-sky-800 shadow-xs'
              : 'text-slate-600 hover:text-sky-700'
          }`}
        >
          Phần mềm Paint & Gõ phím
        </button>
      </div>

      {/* Main Quiz Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-sky-100 shadow-md relative overflow-hidden">
        
        {/* Progress header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-sky-700">
              Câu {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">{q.title}</span>
          </div>

          <button
            onClick={handleReadQuestion}
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-md"
            title="Nghe BiTi đọc câu hỏi"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nghe câu hỏi</span>
          </button>
        </div>

        {/* Question Text */}
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-6 leading-relaxed">
          {q.question}
        </h2>

        {/* Form Types */}

        {/* Type 1: MCQ & True/False */}
        {(q.type === 'mcq' || q.type === 'true_false') && q.options && (
          <div className="space-y-3 mb-6">
            {q.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let btnStyle = 'border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 bg-white';

              if (isAnswered) {
                if (idx === q.correctAnswer) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'border-red-400 bg-red-50 text-red-900 ring-2 ring-red-200';
                } else {
                  btnStyle = 'opacity-50 border-slate-200 bg-slate-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-sm md:text-base ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && idx === q.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && idx !== q.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Type 2: Matching Game */}
        {q.type === 'matching' && q.pairs && (
          <div className="mb-6 space-y-4">
            <p className="text-xs text-sky-700 font-medium">
              👉 Bấm chọn 1 thiết bị ở cột trái, rồi bấm chức năng tương ứng ở cột phải nhé:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column (Items) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Bộ phận máy tính:</span>
                {q.pairs.map((p, idx) => {
                  const isMatched = Boolean(matchingSelections[p.item]);
                  const isActive = activeMatchingLeft === p.item;
                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswered && setActiveMatchingLeft(p.item)}
                      className={`w-full text-left p-3 rounded-xl border text-xs md:text-sm font-semibold transition-all ${
                        isActive
                          ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-300'
                          : isMatched
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {p.item} {isMatched && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Matches) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Chức năng:</span>
                {q.pairs.map((p, idx) => {
                  const isUsed = Object.values(matchingSelections).includes(p.match);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleMatchingPair(p.match)}
                      disabled={!activeMatchingLeft || isUsed || isAnswered}
                      className={`w-full text-left p-3 rounded-xl border text-xs md:text-sm transition-all ${
                        isUsed
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-medium'
                          : activeMatchingLeft
                          ? 'border-sky-300 bg-white hover:bg-sky-50 cursor-pointer'
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {p.match}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Feedback & Explanation Box */}
        {isAnswered && (
          <div className={`p-4 md:p-5 rounded-2xl border-2 mb-6 transition-all ${
            isCorrect 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
              )}

              <div className="space-y-1">
                <h4 className="font-bold text-base">
                  {isCorrect ? 'Tuyệt vời! Bạn nhận được +1 Ngôi sao! ⭐' : 'Chưa chính xác rồi, đừng buồn nhé! BiTi giải thích giúp bạn này:'}
                </h4>
                <p className="text-sm leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hint Box (when requested) */}
        {showHint && !isAnswered && (
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs md:text-sm text-sky-800 mb-6 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gợi ý từ BiTi: </span>
              <span>{q.hint}</span>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            {!isAnswered && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-900 font-semibold py-2 px-3 rounded-lg hover:bg-sky-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-sky-500" />
                <span>Xem gợi ý</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAnswered && !isCorrect && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            )}

            {isAnswered && (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
