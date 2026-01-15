
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Question, Target, User } from '../types';
import { Camera, Image as ImageIcon, Send, Sparkles, User as UserIcon, X, Loader2, ShieldCheck, GraduationCap, Clock, LogOut, ChevronRight, ArrowLeft, MessageSquare, Shield } from 'lucide-react';
import { askGemini } from '../services/gemini';

interface AskQuestionProps {
  user: User;
  questions: Question[]; 
  onAsk: (question: Question) => void;
  isAdmin: boolean;
  onReply: (id: string, answer: string) => void;
  onLogoutAdmin: () => void;
}

const formatRelativeTime = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
};

const AskQuestion: React.FC<AskQuestionProps> = ({ user, questions, onAsk, isAdmin, onReply, onLogoutAdmin }) => {
  const [text, setText] = useState('');
  const [target, setTarget] = useState<Target>(Target.GEMINI);
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const studentConversations = useMemo(() => {
    if (!isAdmin) return [];
    const groups: { [key: string]: { studentName: string, lastMessage: string, timestamp: number, unrepliedCount: number } } = {};
    
    questions
      .filter(q => q.isPrivate && q.target === Target.TEACHER)
      .forEach(q => {
        if (!groups[q.studentId] || q.timestamp > groups[q.studentId].timestamp) {
          groups[q.studentId] = {
            studentName: q.studentName,
            lastMessage: q.text,
            timestamp: q.timestamp,
            unrepliedCount: groups[q.studentId]?.unrepliedCount || 0
          };
        }
        if (!q.answer) {
          groups[q.studentId].unrepliedCount += 1;
        }
      });

    return Object.entries(groups).sort((a, b) => b[1].timestamp - a[1].timestamp);
  }, [questions, isAdmin]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questions, target, selectedStudentId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    const userText = text;
    const userImage = image;
    setText('');
    setImage(null);

    let answer: string | undefined = undefined;
    if (target === Target.GEMINI) {
      answer = await askGemini(userText, userImage || undefined);
    }
    
    const newQuestion: Question = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      text: userText,
      image: userImage || undefined,
      target,
      timestamp: Date.now(),
      points: target === Target.GEMINI ? 5 : 10,
      tags: ['General'],
      answer,
      likes: [],
      comments: [],
      isPrivate: true
    };
    onAsk(newQuestion);
    setIsSubmitting(false);
  };

  const handleAdminReply = (questionId: string) => {
    if (text.trim()) {
      onReply(questionId, text);
      setText('');
    }
  };

  const activeThread = useMemo(() => {
    if (isAdmin) {
      if (!selectedStudentId) return [];
      return questions
        .filter(q => q.isPrivate && q.studentId === selectedStudentId && q.target === Target.TEACHER)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return questions
      .filter(q => q.isPrivate && q.studentId === user.id && q.target === target)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [questions, user.id, target, isAdmin, selectedStudentId]);

  if (isAdmin && !selectedStudentId) {
    return (
      <div className="flex flex-col h-full bg-[#fcfcfd] animate-in fade-in duration-500">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Teacher Inbox</h2>
              <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Direct Private Queries</p>
            </div>
            <button onClick={onLogoutAdmin} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-95 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {studentConversations.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center opacity-30">
              <MessageSquare size={48} className="mb-4" />
              <p className="font-black text-xs uppercase tracking-widest">Inbox is empty</p>
            </div>
          ) : (
            studentConversations.map(([sid, data]) => (
              <button
                key={sid}
                onClick={() => setSelectedStudentId(sid)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.studentName}`} alt="" />
                  </div>
                  {data.unrepliedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white rounded-full text-[10px] font-black text-white flex items-center justify-center">
                      {data.unrepliedCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[#0f172a] truncate">{data.studentName}</h4>
                    <span className="text-[10px] font-medium text-[#94a3b8]">{formatRelativeTime(data.timestamp)}</span>
                  </div>
                  <p className="text-sm text-[#64748b] truncate">{data.lastMessage}</p>
                </div>
                <ChevronRight size={16} className="text-[#cbd5e1] group-hover:text-orange-500 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fcfcfd] animate-in fade-in duration-500">
      <div className="px-6 pt-6 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
             {isAdmin && (
              <button onClick={() => setSelectedStudentId(null)} className="p-2 bg-slate-50 rounded-xl text-slate-600">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-black text-[#0f172a]">Private Q&A</h1>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mt-0.5">Intelligence Lab</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-[24px] flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Privacy Mode Active</h4>
            <p className="text-[11px] text-[#64748b] font-medium mt-0.5">Direct encrypted chat with experts.</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="mt-6 flex gap-4">
            <button 
              onClick={() => setTarget(Target.GEMINI)}
              className={`flex-1 py-4 px-6 rounded-[20px] flex items-center justify-center gap-2 border-2 transition-all ${
                target === Target.GEMINI ? 'border-orange-100 bg-white shadow-sm ring-4 ring-orange-50/50' : 'border-transparent text-[#94a3b8]'
              }`}
            >
              <Sparkles size={18} className={target === Target.GEMINI ? 'text-orange-500' : ''} />
              <span className={`text-[12px] font-black uppercase tracking-widest ${target === Target.GEMINI ? 'text-orange-500' : ''}`}>AI Tutor</span>
            </button>
            <button 
              onClick={() => setTarget(Target.TEACHER)}
              className={`flex-1 py-4 px-6 rounded-[20px] flex items-center justify-center gap-2 border-2 transition-all ${
                target === Target.TEACHER ? 'border-orange-100 bg-white shadow-sm ring-4 ring-orange-50/50' : 'border-transparent text-[#94a3b8]'
              }`}
            >
              <UserIcon size={18} className={target === Target.TEACHER ? 'text-orange-500' : ''} />
              <span className={`text-[12px] font-black uppercase tracking-widest ${target === Target.TEACHER ? 'text-orange-500' : ''}`}>Teacher</span>
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {activeThread.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center mb-4 text-slate-300">
              {target === Target.GEMINI ? <Sparkles size={32} /> : <UserIcon size={32} />}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#64748b]">No conversation yet</p>
          </div>
        ) : (
          activeThread.map((q) => (
            <div key={q.id} className="space-y-4">
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="bg-white border border-slate-100 p-4 rounded-t-[24px] rounded-br-[24px] rounded-bl-lg shadow-sm">
                  <p className="text-sm font-bold text-[#1e293b] leading-relaxed">{q.text}</p>
                  {q.image && (
                    <img src={q.image} className="mt-3 w-full rounded-xl object-cover max-h-48" alt="" />
                  )}
                </div>
                <span className="mt-1 ml-2 text-[9px] font-bold text-[#cbd5e1]">{formatRelativeTime(q.timestamp)}</span>
              </div>

              {q.answer ? (
                <div className="flex flex-col items-end max-w-[90%] self-end">
                  <div className={`p-4 rounded-t-[24px] rounded-bl-[24px] rounded-br-lg shadow-md ${q.target === Target.GEMINI ? 'bg-orange-500 text-white' : 'bg-[#0f172a] text-white'}`}>
                    <p className="text-sm font-bold leading-relaxed">{q.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 mr-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${q.target === Target.GEMINI ? 'text-orange-500' : 'text-[#0f172a]'}`}>
                      {q.target === Target.GEMINI ? 'AI Wisdom' : 'Teacher Verified'}
                    </span>
                  </div>
                </div>
              ) : !isAdmin && (
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit ml-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                  Pending...
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-white safe-bottom">
        <div className="relative bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm overflow-hidden min-h-[160px] flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAdmin ? "Type your reply..." : `Type your private message for the ${target === Target.GEMINI ? 'AI' : 'Teacher'}...`}
            className="w-full flex-1 bg-transparent text-[14px] font-bold text-slate-800 placeholder:text-slate-200 border-none focus:ring-0 resize-none"
          />

          {image && (
            <div className="mt-2 mb-4 relative inline-block">
              <img src={image} className="w-20 h-20 object-cover rounded-xl border border-slate-100" alt="" />
              <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full shadow-md">
                <X size={10} />
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <ImageIcon size={20} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <Camera size={20} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <button
              onClick={() => {
                if (isAdmin) {
                  const latestUnanswered = activeThread.slice().reverse().find(q => !q.answer);
                  if (latestUnanswered) handleAdminReply(latestUnanswered.id);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!text.trim() || isSubmitting}
              className={`flex items-center gap-2 py-4 px-8 rounded-full font-black text-[12px] uppercase tracking-widest transition-all ${
                !text.trim() || isSubmitting 
                  ? 'bg-slate-50 text-slate-300' 
                  : 'bg-orange-50 text-orange-500 shadow-sm hover:bg-orange-100'
              }`}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send Private
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
