
import React, { useState } from 'react';
import { Question, Target } from '../types';
import { MessageSquare, Sparkles, User, ShieldCheck, Plus, Send, GraduationCap, Clock, LogOut, ChevronRight } from 'lucide-react';

interface ChatListProps {
  chats: Question[];
  isAdmin: boolean;
  onReply?: (id: string, answer: string) => void;
  onAskNew: () => void;
  onLogoutAdmin?: () => void;
}

const formatRelativeTime = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const ChatList: React.FC<ChatListProps> = ({ chats, isAdmin, onReply, onAskNew, onLogoutAdmin }) => {
  const [activeTab, setActiveTab] = useState<Target>(Target.TEACHER);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleReplySubmit = (id: string) => {
    if (onReply && replyText[id]?.trim()) {
      onReply(id, replyText[id]);
      setReplyText({ ...replyText, [id]: '' });
    }
  };

  // For students, we filter by the active tab (AI vs Teacher)
  // For Admin, we show all Teacher-targeted messages (serially)
  const filteredChats = isAdmin 
    ? chats.sort((a, b) => b.timestamp - a.timestamp)
    : chats.filter(c => c.target === activeTab).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-0 h-full flex flex-col bg-[#fcfcfd] animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="p-6 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-red-500' : 'text-indigo-600'}`} />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isAdmin ? 'Teacher Inbox' : 'My Conversations'}
              </h2>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {isAdmin ? `Reviewing ${filteredChats.length} inquiries` : 'Secure learning threads'}
            </p>
          </div>
          
          {isAdmin ? (
            <button 
              onClick={onLogoutAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors shadow-sm active:scale-95"
            >
              <LogOut size={12} />
              Exit Admin
            </button>
          ) : (
            <button 
              onClick={onAskNew}
              className="p-3 bg-black text-white rounded-2xl shadow-lg active:scale-90 transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* Student Tab Switcher */}
        {!isAdmin && (
          <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab(Target.TEACHER)}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === Target.TEACHER ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              <User size={14} />
              Teacher Chat
            </button>
            <button
              onClick={() => setActiveTab(Target.GEMINI)}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === Target.GEMINI ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Sparkles size={14} />
              AI Tutor
            </button>
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-32">
        {filteredChats.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-sm">No messages found here</p>
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-1">
              {isAdmin ? 'All students are up to date' : 'Start a new discovery path'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div key={chat.id} className="space-y-4">
              {/* Student Message Section */}
              <div className="flex flex-col items-start max-w-[85%] group">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {isAdmin ? chat.studentName : 'Me'}
                  </span>
                  <span className="text-[8px] font-bold text-slate-300">{formatRelativeTime(chat.timestamp)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-t-3xl rounded-br-3xl rounded-bl-lg shadow-sm">
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{chat.text}</p>
                  {chat.image && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-50 bg-slate-50">
                      <img src={chat.image} className="w-full h-auto object-cover max-h-56" alt="Detail" />
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Section (Directly After Text) */}
              {chat.answer ? (
                <div className="flex flex-col items-end max-w-[90%] self-end ml-auto animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-2 mb-1.5 mr-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${chat.target === Target.GEMINI ? 'text-indigo-500' : 'text-slate-900'}`}>
                      {chat.target === Target.GEMINI ? 'AI Wisdom' : 'Teacher Verified'}
                    </span>
                    <div className={`w-4 h-4 rounded-lg flex items-center justify-center text-white ${chat.target === Target.GEMINI ? 'bg-indigo-600' : 'bg-black'}`}>
                      {chat.target === Target.GEMINI ? <Sparkles size={10} /> : <GraduationCap size={10} />}
                    </div>
                  </div>
                  <div className={`${chat.target === Target.GEMINI ? 'bg-indigo-600' : 'bg-black'} p-4 rounded-t-3xl rounded-bl-3xl rounded-br-lg shadow-xl shadow-slate-100`}>
                    <p className="text-sm text-white font-bold leading-relaxed">
                      {chat.answer}
                    </p>
                  </div>
                </div>
              ) : isAdmin ? (
                /* Admin Reply Interface - Sits where the reply will appear */
                <div className="mt-2 w-full animate-in fade-in duration-300 pl-4">
                  <div className="relative group">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-red-100 rounded-full group-focus-within:bg-red-500 transition-colors"></div>
                    <textarea
                      value={replyText[chat.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [chat.id]: e.target.value })}
                      placeholder={`Type reply to ${chat.studentName.split(' ')[0]}...`}
                      className="w-full bg-slate-50/50 rounded-[32px] p-5 pr-16 text-sm font-bold border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-red-500 transition-all resize-none min-h-[100px] placeholder:text-slate-300 shadow-inner"
                    />
                    <button 
                      onClick={() => handleReplySubmit(chat.id)}
                      disabled={!replyText[chat.id]?.trim()}
                      className={`absolute right-4 bottom-4 p-3 rounded-2xl transition-all ${
                        replyText[chat.id]?.trim() ? 'bg-red-500 text-white shadow-xl active:scale-90' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Student "Awaiting" Interface */
                <div className="flex items-center gap-3 text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50/50 py-3 px-5 rounded-3xl w-fit ml-2 border border-amber-100/50">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                  {chat.target === Target.GEMINI ? 'AI Processing Inquiry...' : 'Awaiting Teacher Review'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
