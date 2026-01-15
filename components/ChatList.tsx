import React, { useState } from 'react';
import { Question, Target } from '../types';
import { MessageSquare, Sparkles, User, ShieldCheck, Plus, Send, LogOut, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<Target>(Target.TEACHER);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleReplySubmit = (id: string) => {
    if (onReply && replyText[id]?.trim()) {
      onReply(id, replyText[id]);
      setReplyText({ ...replyText, [id]: '' });
    }
  };

  const filteredChats = isAdmin 
    ? [...chats].sort((a, b) => b.timestamp - a.timestamp)
    : chats.filter(c => c.target === activeTab).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-0 h-full flex flex-col bg-[#fcfcfd] animate-in fade-in duration-500 relative min-h-screen">
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
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors shadow-sm"
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

              {chat.answer && (
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
              )}
              
              {isAdmin && !chat.answer && (
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
          position: 'fixed',
          bottom: isMenuVisible ? '140px' : '30px',
          left: '0',
          right: '0',
          zIndex: 999999,
          padding: '0 20px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none'
        }}>
          <div 
            onClick={onAskNew}
            style={{
              maxWidth: '450px',
              margin: '0 auto',
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '2px solid #f97316',
              boxShadow: '0 20px 50px rgba(249, 115, 22, 0.2)',
              display: 'flex',
              alignItems: 'center',
              height: '65px',
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            <div style={{ flex: 1, padding: '0 25px', color: '#1e293b', fontSize: '15px', fontWeight: 'bold' }}>Ask your question...</div>
            <div style={{ paddingRight: '10px' }}>
              <div style={{ width: '45px', height: '45px', backgroundColor: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Send size={22} />
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsMenuVisible(!isMenuVisible)}
        style={{
          position: 'fixed',
          bottom: '85px',
          right: '15px',
          zIndex: 1000000,
          backgroundColor: '#1e293b',
          color: 'white',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          border: '2px solid #334155'
        }}
      >
        {isMenuVisible ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
      </button>

     <style>
  {`
  
    nav.fixed.bottom-6.left-1\/2 { 
      transform: ${isMenuVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(150%)'} !important;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      opacity: ${isMenuVisible ? '1' : '0'} !important;
      pointer-events: ${isMenuVisible ? 'auto' : 'none'} !important;
    }
  `}
</style>
    </div>
  );
};

export default ChatList;