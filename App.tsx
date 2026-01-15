import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, increment, setDoc } from 'firebase/firestore';
import { AppView, Question, User, Target, Notification } from './types';
import { Home, MessageSquarePlus, Trophy, LayoutGrid, User as UserIcon, MessageCircle, Bell } from 'lucide-react';
import Feed from './components/Feed';
import AskQuestion from './components/AskQuestion';
import QuizList from './components/Quizzes';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import SplashScreen from './components/SplashScreen';
import Notifications from './components/Notifications';
import AuthPortal from './components/AuthPortal'; 

const REGISTRY_KEY = 'mk_way_registry_v1';
const SESSION_KEY = 'mk_way_session_v1';
const NavButton: React.FC<{ active: boolean; icon: React.ReactNode; onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-3 transition-all ${active ? 'text-orange-500' : 'text-[#94a3b8]'}`}>
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28, strokeWidth: active ? 2.5 : 2 }) : icon}
  </button>
);
const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  
  const [registry, setRegistry] = useState<User[]>(() => {
    const saved = localStorage.getItem(REGISTRY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

const showNotification = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
  const newNotif: any = {
    id: Date.now().toString(),
    message,
    type,
    isRead: false,
    userId: user?.id || 'guest',
    timestamp: new Date(),
    questionId: null 
  };
  setActiveNotification(newNotif);
  setNotifications(prev => [newNotif, ...prev]);
  setTimeout(() => setActiveNotification(null), 3000);
};
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(postsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setRegistry(prev => prev.map(u => u.id === user.id ? user : u));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem(SESSION_KEY);
      setIsLoggedIn(false);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }, [registry]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

const handleAuthSuccess = async (authUser: User) => {
    if (!registry.find(u => u.id === authUser.id)) {
      setRegistry(prev => [...prev, authUser]);
      try {
        await setDoc(doc(db, "users", authUser.id), {
          id: authUser.id,
          name: authUser.name,
          points: 0,
          level: 1
        });
      } catch (e) {
        console.error("Error creating user profile:", e);
      }
    }
    setUser(authUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('feed');
    setIsAdmin(false);
  };

  const handleQuizPoints = async (pts: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        points: increment(pts),
        level: Math.floor((user.points + pts) / 100) + 1
      });
      setUser(prev => prev ? ({ 
        ...prev, 
        points: prev.points + pts, 
        level: Math.floor((prev.points + pts) / 100) + 1 
      }) : null);
    } catch (e) {
      console.error("Database Update Error:", e);
    }
  };

  const addQuestion = async (newQ: Question) => {
    try {
      const { id, ...dataWithoutId } = newQ; 
      const dataToSave = {
        ...dataWithoutId,
        image: newQ.image || null,
        answer: newQ.answer || null,
        timestamp: Date.now()
      };
      await addDoc(collection(db, "posts"), dataToSave);
      if (user && newQ.studentId === user.id) {
        handleQuizPoints(newQ.points);
      }
    } catch (e) { 
      console.error("Post Creation Error:", e); 
    }
  };

  const handlePostPublic = async (text: string, image?: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "posts"), {
        studentId: user.id,
        studentName: user.name,
        text: text,
        image: image || null,
        answer: null, 
        target: Target.TEACHER,
        timestamp: Date.now(),
        points: 20,
        tags: ['Community'],
        likes: [],
        comments: [],
        isPrivate: false
      });
      handleQuizPoints(20);
    } catch (e) { 
      console.error("Chat Error:", e); 
    }
  };

  const adminReply = async (questionId: string, answer: string) => {
    try {
      const postRef = doc(db, "posts", questionId);
      await updateDoc(postRef, { 
        answer: answer,
        repliedBy: user?.name || 'Teacher',
        repliedAt: Date.now()
      });
    } catch (e) {
      console.error("Reply Error:", e);
    }
  };

  const toggleLike = async (id: string) => {
    if (!user) return;
    const postRef = doc(db, "posts", id);
    const post = questions.find(q => q.id === id);
    if (!post) return;
    await updateDoc(postRef, { likes: post.likes.includes(user.id) ? arrayRemove(user.id) : arrayUnion(user.id) });
  };

  const addComment = async (id: string, text: string) => {
    if (!user) return;
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      comments: arrayUnion({ id: Date.now().toString(), userId: user.id, userName: user.name, text, timestamp: Date.now() })
    });
  };

  const renderView = () => {
    if (!user) return null;
    switch (currentView) {
      case 'feed': return (
        <Feed questions={questions.filter(q => !q.isPrivate)} onRate={() => {}} onLike={toggleLike} onAddComment={addComment} 
          onPostPublic={handlePostPublic} currentUserId={user.id} onAskClick={() => setCurrentView('ask')} user={user} />
      );
      case 'ask': return (
        <AskQuestion user={user} questions={questions.filter(q => q.isPrivate || (isAdmin && q.target === Target.TEACHER))}
          onAsk={addQuestion} isAdmin={isAdmin} onReply={adminReply} onLogoutAdmin={() => { setIsAdmin(false); setCurrentView('feed'); }} />
      );
      case 'quiz': return <QuizList onPointsEarned={handleQuizPoints} />;
      case 'leaderboard': return <Leaderboard />;
      case 'profile': return <Profile user={user} onAdminLogin={() => setIsAdmin(true)} isAdmin={isAdmin} onLogout={handleLogout} />;
      case 'notifications': return (
        <Notifications notifications={notifications.filter(n => n.userId === user.id)} 
          onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))} 
          onClearAll={() => setNotifications(prev => prev.filter(n => n.userId !== user.id))} onNavigateToQuestion={() => setCurrentView('ask')} />
      );
      default: return null;
    }
  };

  if (showSplash) return <SplashScreen />;
  if (!isLoggedIn) return <AuthPortal onAuthSuccess={handleAuthSuccess} existingUsers={registry} />;

return (
  <div className="flex flex-col h-screen max-w-md mx-auto cosmic-bg shadow-2xl overflow-hidden relative border-x border-slate-800">
    {/* Animated Cosmic Background Layer */}
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      
      {/* MK-way Animated Text (Centrally Positioned) */}
      <div 
        className="absolute top-1/2 left-1/2 font-black italic text-7xl text-indigo-500/20 select-none uppercase tracking-tighter whitespace-nowrap"
        style={{ animation: 'cosmic-pulse 6s infinite ease-in-out' }}
      >
        MK-way
      </div>

      {/* Rotating Orbit Paths & Planets */}
      {/* Outer Orbit */}
      <div className="absolute top-1/2 left-1/2 w-[350px] height-[350px] border border-indigo-500/5 rounded-full" 
           style={{ animation: 'orbit-rotate 25s linear infinite' }}>
        <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_10px_#60a5fa]"></div>
      </div>

      {/* Inner Orbit */}
      <div className="absolute top-1/2 left-1/2 w-[220px] height-[220px] border border-white/5 rounded-full" 
           style={{ animation: 'orbit-rotate 15s linear infinite reverse' }}>
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-orange-400 rounded-full blur-[1px] shadow-[0_0_8px_#fb923c]"></div>
      </div>
      
      {/* Background Stars */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            '--duration': `${2 + Math.random() * 3}s`
          } as any}
        />
      ))}
    </div>

    {/* Content Layer */}
    <header className="px-5 py-4 flex items-center justify-between bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <span className="text-black font-black italic text-sm">MK</span>
        </div>
        <div>
          <h1 className="font-extrabold text-xl leading-none text-white">MK-way</h1>
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em] mt-0.5">Discovery Lab</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-full bg-white/10 text-slate-300 border border-white/10 shadow-sm"><MessageCircle size={20} /></button>
        <button onClick={() => setCurrentView('notifications')} className={`p-2.5 rounded-full bg-white/10 text-slate-300 relative border border-white/10 shadow-sm transition-all ${currentView === 'notifications' ? 'bg-orange-500 text-white' : ''}`}>
          <Bell size={20} />
          {notifications.filter(n => !n.isRead && n.userId === user?.id).length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full text-[8px] font-black text-white flex items-center justify-center">
              {notifications.filter(n => !n.isRead && n.userId === user?.id).length}
            </span>
          )}
        </button>
      </div>
    </header>

    <main className="flex-1 overflow-y-auto relative z-10">
      {renderView()}
    </main>

  {/* Glass Notification Popup */}
      {activeNotification && (
        <div className="fixed top-20 right-4 z-[100] w-72 animate-slide-in pointer-events-auto">
          <div className="glass-morphism p-4 rounded-2xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${activeNotification.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500'}`} />
            <p className="text-sm font-medium text-white">{activeNotification.message}</p>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex justify-around items-center shadow-2xl z-50">
        <NavButton active={currentView === 'feed'} icon={<Home />} onClick={() => setCurrentView('feed')} />
        <NavButton active={currentView === 'quiz'} icon={<LayoutGrid />} onClick={() => setCurrentView('quiz')} />
        <div className="relative -top-6">
          <button onClick={() => setCurrentView('ask')} className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] border-4 border-[#020617] bg-orange-500 text-white">
            <MessageSquarePlus className="w-8 h-8" />
          </button>
        </div>
        <div className="flex gap-8">
          <NavButton active={currentView === 'leaderboard'} icon={<Trophy />} onClick={() => setCurrentView('leaderboard')} />
          <NavButton active={currentView === 'profile'} icon={<UserIcon />} onClick={() => setCurrentView('profile')} />
        </div>
      </nav>
    </div>
  );
};

export default App;