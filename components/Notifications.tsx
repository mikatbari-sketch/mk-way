
import React from 'react';
import { Notification } from '../types';
import { MessageCircle, CheckCircle, Heart, Clock, Trash2 } from 'lucide-react';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNavigateToQuestion: (questionId: string) => void;
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

const Notifications: React.FC<NotificationsProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll,
  onNavigateToQuestion 
}) => {
  return (
    <div className="p-6 h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Updates</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Stay in the loop</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-200" />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-sm">Nothing to see here yet</p>
              <p className="text-slate-300 text-[10px] uppercase font-bold tracking-widest mt-1">We'll notify you of new activity</p>
            </div>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                onMarkAsRead(n.id);
                onNavigateToQuestion(n.questionId);
              }}
              className={`w-full text-left p-5 rounded-[28px] border transition-all flex items-start gap-4 elegant-shadow active:scale-[0.98] ${
                n.isRead ? 'bg-white border-slate-50 opacity-70' : 'bg-indigo-50/30 border-indigo-100/50'
              }`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                n.type === 'answer' ? 'bg-indigo-600 text-white' : 
                n.type === 'comment' ? 'bg-slate-900 text-white' : 'bg-pink-500 text-white'
              }`}>
                {n.type === 'answer' ? <CheckCircle className="w-5 h-5" /> : 
                 n.type === 'comment' ? <MessageCircle className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <p className={`text-sm leading-snug ${n.isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(n.timestamp)}</span>
                  {!n.isRead && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full ml-1"></span>}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
