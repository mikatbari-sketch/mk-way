
import React, { useState } from 'react';
import { generateQuiz } from '../services/gemini';
import { BookOpen, Trophy, Play, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface QuizListProps {
  onPointsEarned: (points: number) => void;
}

const subjects = [
  { name: 'Mathematics', icon: '📐', color: 'bg-blue-500' },
  { name: 'Science', icon: '🧪', color: 'bg-green-500' },
  { name: 'History', icon: '📜', color: 'bg-amber-500' },
  { name: 'Computer Science', icon: '💻', color: 'bg-indigo-500' },
  { name: 'Geography', icon: '🌍', color: 'bg-teal-500' }
];

const QuizList: React.FC<QuizListProps> = ({ onPointsEarned }) => {
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const startQuiz = async (subject: string) => {
    setLoading(true);
    try {
      const quiz = await generateQuiz(subject);
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        setActiveQuiz(quiz);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setSelectedOption(null);
      } else {
        throw new Error("Invalid quiz format received");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null || !activeQuiz) return;
    setSelectedOption(idx);
    
    const isCorrect = idx === activeQuiz.questions[currentQuestionIndex].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }

    setTimeout(() => {
      if (currentQuestionIndex < activeQuiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setShowResults(true);
        const points = Math.round((newScore / activeQuiz.questions.length) * 50);
        onPointsEarned(points);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-bold">Generating personalized quiz...</h3>
        <p className="text-gray-500 text-sm">Gemini is preparing your study set based on the subject.</p>
      </div>
    );
  }

  // Handle active quiz state (either showing question or results)
  if (activeQuiz) {
    if (showResults) {
      const xpGained = Math.round((score / activeQuiz.questions.length) * 50);
      return (
        <div className="p-8 flex flex-col items-center text-center h-full justify-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Trophy className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8">Great job on your progress!</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Score</p>
              <p className="text-2xl font-black text-indigo-600">{score}/{activeQuiz.questions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">XP Gained</p>
              <p className="text-2xl font-black text-amber-500">+{xpGained}</p>
            </div>
          </div>

          <button 
            onClick={() => setActiveQuiz(null)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
          >
            Return to Subjects
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    const q = activeQuiz.questions[currentQuestionIndex];
    return (
      <div className="p-4 h-full flex flex-col animate-in fade-in duration-300">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Question {currentQuestionIndex + 1}/{activeQuiz.questions.length}</span>
            <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 leading-snug">{q.question}</h2>
        </div>

        <div className="space-y-3 flex-1">
          {q.options.map((opt: string, idx: number) => {
            const isCorrect = idx === q.correctAnswer;
            const isSelected = idx === selectedOption;
            
            let btnClass = "bg-white border-gray-100 text-gray-700";
            if (selectedOption !== null) {
              if (isCorrect) btnClass = "bg-green-50 border-green-500 text-green-700";
              else if (isSelected) btnClass = "bg-red-50 border-red-500 text-red-700";
            } else {
              btnClass = "hover:border-indigo-300 hover:bg-indigo-50";
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full p-5 rounded-2xl border-2 text-left font-bold text-sm transition-all duration-200 flex items-center justify-between group ${btnClass}`}
              >
                <span>{opt}</span>
                {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {selectedOption !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default subject list view
  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
            AI Quiz Arena
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
          </h2>
          <p className="text-indigo-100 text-sm mb-6 max-w-[80%]">Boost your level by completing subject-based quizzes generated in real-time by Gemini.</p>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Trophy className="w-3 h-3" />
            Top reward: 50 XP
          </div>
        </div>
        <Sparkles className="absolute top-[-20px] right-[-20px] w-48 h-48 text-indigo-500 opacity-20" />
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-gray-900 text-lg">Pick a Subject</h3>
        <div className="grid grid-cols-1 gap-3">
          {subjects.map((sub) => (
            <button
              key={sub.name}
              onClick={() => startQuiz(sub.name)}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${sub.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm shadow-black/10`}>
                  {sub.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{sub.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">5 Questions • 2 Mins</p>
                </div>
              </div>
              <Play className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizList;
