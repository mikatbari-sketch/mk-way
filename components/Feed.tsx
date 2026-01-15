
import React, { useState, useEffect, useRef } from 'react';
import { Question, Target, User } from '../types';
import { MessageCircle, ThumbsUp, Share2, Sparkles, UserCircle, Star, Send, Globe, MoreHorizontal, Image as ImageIcon, Compass, X, Loader2 } from 'lucide-react';

interface FeedProps {
  questions: Question[];
  onRate: (id: string, rating: number) => void;
  onLike: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  onPostPublic: (text: string, image?: string) => void;
  currentUserId: string;
  onAskClick: () => void;
  user: User;
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

const RotaryItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTransform = () => {
      if (!itemRef.current) return;
      const rect = itemRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const center = viewportHeight / 2;
      const itemCenter = rect.top + rect.height / 2;
      
      const distanceFromCenter = (itemCenter - center) / (viewportHeight / 1.5);
      const clampedDistance = Math.max(-1, Math.min(1, distanceFromCenter));
      
      const scale = 1 - Math.abs(clampedDistance) * 0.12;
      const rotateX = clampedDistance * -15;
      const opacity = 1 - Math.abs(clampedDistance) * 0.15;

      itemRef.current.style.transform = `perspective(1000px) scale(${scale}) rotateX(${rotateX}deg)`;
      itemRef.current.style.opacity = `${opacity}`;
    };

    updateTransform();

    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateTransform, { passive: true });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateTransform);
      }
    };
  }, []);

  return (
    <div 
      ref={itemRef} 
      className="transition-transform duration-75 ease-out origin-center"
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </div>
  );
};

const Feed: React.FC<FeedProps> = ({ questions, onRate, onLike, onAddComment, onPostPublic, currentUserId, onAskClick, user }) => {
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [publicPostText, setPublicPostText] = useState('');
  const [publicImage, setPublicImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPublicImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = () => {
    if (!publicPostText.trim()) return;
    setIsPosting(true);
    setTimeout(() => {
      onPostPublic(publicPostText, publicImage || undefined);
      setPublicPostText('');
      setPublicImage(null);
      setIsPosting(false);
    }, 800);
  };

  return (
    <div className="space-y-6 px-4 py-12 bg-transparent min-h-full pb-32 overflow-x-hidden">
      <RotaryItem>
        <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-6 shadow-2xl animate-in fade-in slide-in-from-top duration-700 mb-8">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Compass className="w-24 h-24 text-white rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              <h2 className="text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Discovery Lab Live • Public</h2>
            </div>
            
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-4 transition-all focus-within:bg-white/10">
              <textarea 
                value={publicPostText}
                onChange={(e) => setPublicPostText(e.target.value)}
                placeholder="What did you discover today? Share with everyone..."
                className="w-full bg-transparent border-none text-white text-sm font-bold placeholder:text-white/30 focus:ring-0 resize-none min-h-[80px]"
              />
              
              {publicImage && (
                <div className="mt-2 relative inline-block">
                  <img src={publicImage} className="w-20 h-20 object-cover rounded-xl border border-white/20" alt="" />
                  <button 
                    onClick={() => setPublicImage(null)}
                    className="absolute -top-2 -right-2 bg-white text-black p-1 rounded-full shadow-lg"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <ImageIcon size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                <button 
                  onClick={handlePostSubmit}
                  disabled={!publicPostText.trim() || isPosting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    !publicPostText.trim() || isPosting 
                      ? 'bg-white/5 text-white/20' 
                      : 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 active:scale-95'
                  }`}
                >
                  {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Share Post
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-5">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=explorer${i}`} alt="" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest self-center">
                Discoveries by <span className="text-white font-black">{questions.length + 42}</span> explorers
              </p>
            </div>
          </div>
        </div>
      </RotaryItem>

      <div className="space-y-12">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]">Public Feed</h3>
          <div className="h-px flex-1 bg-orange-100 mx-4"></div>
          <Globe className="w-4 h-4 text-orange-300" />
        </div>

        {questions.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <Globe size={48} className="mx-auto mb-4" />
            <p className="font-black text-xs uppercase tracking-widest">The feed is waiting for your spark</p>
          </div>
        ) : (
          questions.map((q) => {
            const isLiked = q.likes.includes(currentUserId);
            const isCommenting = activeCommentId === q.id;

            return (
              <RotaryItem key={q.id}>
                <div className="relative bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/30 p-1 elegant-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${q.studentName}`} 
                          className="w-12 h-12 rounded-2xl bg-white/60 object-cover ring-4 ring-white/20" 
                          alt=""
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{q.studentName}</p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span>{formatRelativeTime(q.timestamp)}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-orange-500">Public Discovery</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2.5 rounded-xl hover:bg-white/40 transition-colors text-slate-400">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-6 px-2">
                      <p className="text-[16px] font-bold text-slate-800 leading-relaxed">
                        {q.text}
                      </p>
                      
                      {q.image && (
                        <div className="mt-5 rounded-3xl overflow-hidden border border-white/40 bg-white/20">
                          <img src={q.image} className="w-full h-auto object-cover max-h-[300px]" alt="" />
                        </div>
                      )}
                    </div>

                    {q.answer && (
                      <div className="mb-6 p-5 bg-white/50 rounded-[32px] border border-white/40 relative overflow-hidden group">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${q.target === Target.GEMINI ? 'bg-orange-500 text-white' : 'bg-black text-white'}`}>
                            {q.target === Target.GEMINI ? <Sparkles size={10} /> : <UserCircle size={10} />}
                            {q.target === Target.GEMINI ? 'AI Tutor' : 'Teacher Verified'}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => onLike(q.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${isLiked ? 'bg-orange-50 text-orange-600 shadow-sm' : 'bg-white/40 text-slate-500 hover:bg-white/60'}`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-orange-600' : ''}`} />
                        <span className="text-xs font-black">{q.likes.length || 0}</span>
                      </button>

                      <button 
                        onClick={() => setActiveCommentId(isCommenting ? null : q.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${isCommenting ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/40 text-slate-500 hover:bg-white/60'}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-black">{q.comments.length || 0}</span>
                      </button>

                      <button className="ml-auto p-3 bg-white/40 text-slate-400 rounded-2xl hover:bg-white/60 transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isCommenting && (
                    <div className="p-8 bg-white/40 rounded-b-[40px] border-t border-white/20 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {q.comments.length === 0 ? (
                          <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest py-4">Be the first to reflect</p>
                        ) : (
                          q.comments.map(c => (
                            <div key={c.id} className="flex gap-4">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userName}`} className="w-8 h-8 rounded-full bg-white/80 border border-white/20 shadow-sm" alt="" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-black text-slate-900">{c.userName}</span>
                                  <span className="text-[8px] font-bold text-slate-400">{formatRelativeTime(c.timestamp)}</span>
                                </div>
                                <p className="text-sm text-slate-600 font-semibold leading-snug">{c.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-9 h-9 rounded-full bg-white/80 shadow-sm border border-white/20" alt="" />
                        <div className="flex-1 relative">
                          <input 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && commentText.trim() && (onAddComment(q.id, commentText), setCommentText(''))}
                            placeholder="Add your thought..."
                            className="w-full bg-white/60 text-sm font-bold px-5 py-3 rounded-2xl border border-white/40 focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-400"
                          />
                          <button 
                            disabled={!commentText.trim()}
                            onClick={() => { if(commentText.trim()) { onAddComment(q.id, commentText); setCommentText(''); } }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${commentText.trim() ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-200'}`}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </RotaryItem>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Feed;
