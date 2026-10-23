import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { GRADE_3_TOPICS } from '../data/curriculum';
import { TextbookTopic } from '../types';

interface LessonsExplorerProps {
  onAskAboutLesson: (lessonTitle: string, sampleQuestion?: string) => void;
}

export const LessonsExplorer: React.FC<LessonsExplorerProps> = ({ onAskAboutLesson }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(GRADE_3_TOPICS[0].id);
  const currentTopic = GRADE_3_TOPICS.find((t) => t.id === selectedTopicId) || GRADE_3_TOPICS[0];

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      
      {/* Topic Selection Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {GRADE_3_TOPICS.map((topic) => {
          const isSelected = topic.id === selectedTopicId;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 border-sky-100 hover:border-sky-300 hover:bg-sky-50/50'
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isSelected ? 'text-sky-200' : 'text-sky-600'
              }`}>
                {topic.code}
              </div>
              <div className="text-xs font-bold truncate">
                {topic.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Topic Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sky-200 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>{currentTopic.code} · Chương trình GDPT 2018</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold mb-2">
          {currentTopic.title}
        </h2>
        <p className="text-sm text-sky-100 max-w-2xl">
          {currentTopic.description}
        </p>
      </div>

      {/* Lessons List in Selected Topic */}
      <div className="space-y-4">
        {currentTopic.lessons.map((lesson) => (
          <div
            key={lesson.number}
            className="bg-white rounded-2xl p-5 md:p-6 border border-sky-100 shadow-2xs hover:shadow-sm transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {lesson.number}
                </span>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-800">
                    Bài {lesson.number}: {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-400">Sách giáo khoa Tin học 3 Kết nối tri thức</p>
                </div>
              </div>

              <button
                onClick={() => onAskAboutLesson(lesson.title)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs md:text-sm font-semibold transition-colors self-start md:self-auto shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <span>Hỏi BiTi bài này</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Key Learning Points */}
            <div className="mb-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kiến thức trọng tâm:
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-700 leading-relaxed">
                {lesson.keyPoints.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Questions to ask BiTi */}
            {lesson.sampleQuestions.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-sky-800">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Câu hỏi học sinh thường hỏi BiTi:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lesson.sampleQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => onAskAboutLesson(lesson.title, q)}
                      className="text-xs bg-sky-50/70 hover:bg-sky-100 text-sky-800 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors cursor-pointer text-left font-medium"
                    >
                      “{q}”
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
