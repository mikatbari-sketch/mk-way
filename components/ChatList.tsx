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

  const filteredChats = isAdmin 
    ? chats.sort((a, b) => b.timestamp - a.timestamp)
    : chats.filter(c => c.target === activeTab).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-0 h-full flex flex-col bg-[#fcfcfd] animate-in fade-in duration-500 relative">
      <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-30">
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

      <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-60">
        {filteredChats.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-sm">No messages found here</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div key={chat.id} className="space-y-4">
              <div className="flex flex-col items-start max-w-[85%] group">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {isAdmin ? chat.studentName : 'Me'}
                  </span>
                  <span className="text-[8px] font-bold text-slate-300">{formatRelativeTime(chat.timestamp)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-t-3xl rounded-br-3xl rounded-bl-lg shadow-sm">
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{chat.text}</p>
                </div>
              </div>

              {chat.answer ? (
                <div className="flex flex-col items-end max-w-[90%] self-end ml-auto">
                  <div className="flex items-center gap-2 mb-1.5 mr-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${chat.target === Target.GEMINI ? 'text-indigo-500' : 'text-slate-900'}`}>
                      {chat.target === Target.GEMINI ? 'AI Wisdom' : 'Teacher Verified'}
                    </span>
                  </div>
                  <div className={`${chat.target === Target.GEMINI ? 'bg-indigo-600' : 'bg-black'} p-4 rounded-t-3xl rounded-bl-3xl rounded-br-lg shadow-sm`}>
                    <p className="text-sm text-white font-bold leading-relaxed">{chat.answer}</p>
                  </div>
                </div>
              ) : isAdmin && (
                <div className="mt-2 w-full pl-4">
                  <div className="relative">
                    <textarea
                      value={replyText[chat.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [chat.id]: e.target.value })}
                      placeholder="Type reply..."
                      className="w-full bg-slate-50 rounded-2xl p-4 pr-12 text-sm border focus:border-red-500 outline-none resize-none"
                    />
                    <button 
                      onClick={() => handleReplySubmit(chat.id)}
                      className="absolute right-2 bottom-2 p-2 bg-red-500 text-white rounded-xl"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

 {!isAdmin && (
        <div style={{
          position: 'absolute',
          bottom: '180px',
          left: '20px',
          right: '20px',
          zIndex: 999999999,
          pointerEvents: 'auto',
          display: 'block'
        }}>
          <div 
            onClick={onAskNew}
            style={{
              maxWidth: '400px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '3px solid #f97316',
              boxShadow: '0 0 30px rgba(249, 115, 22, 0.4)',
              display: 'flex',
              alignItems: 'center',
              padding: '15px 20px',
              cursor: 'pointer'
            }}
          >
            <span style={{
              flex: 1,
              fontSize: '16px',
              fontWeight: '900',
              color: '#0f172a'
            }}>
              Ask anything...
            </span>
            <div style={{
              width: '45px',
              height: '45px',
              backgroundColor: '#f97316',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Send size={24} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatList;