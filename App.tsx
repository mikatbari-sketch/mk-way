import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, increment, setDoc } from 'firebase/firestore';
import { AppView, Question, User, Target, Notification } from './types';
import { Home, MessageSquarePlus, Trophy, LayoutGrid, User as UserIcon, MessageCircle, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
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
const SidebarItem: React.FC<{ 
  active: boolean; 
  icon: React.ReactNode; 
  label: string;
  onClick: () => void;
  isMini: boolean;
}> = ({ active, icon, label, onClick, isMini }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-orange-500/20 text-orange-500' : 'text-[#94a3b8] hover:bg-white/5'}`}
  >
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 2.5 : 2 }) : icon}
    {!isMini && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);
const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [isSidebarMini, setIsSidebarMini] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  
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
  <div className="flex h-screen cosmic-bg overflow-hidden relative">
    {/* Animated Cosmic Background Layer */}
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* ... তোমার existing background code ... */}
    </div>

    {/* ✅ SIDEBAR - MODIFIED for sliding effect */}
    <div className={`
      relative z-40 h-full transition-all duration-500 ease-in-out
      ${isNavHidden 
        ? 'translate-y-full opacity-0 pointer-events-none' 
        : 'translate-y-0 opacity-100'
      }
      ${isSidebarMini ? 'w-20' : 'w-64'} flex-shrink-0
    `}>
      <div className="h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Sidebar Header with Hide Button */}
        <div className={`p-4 border-b border-white/10 ${isSidebarMini ? 'flex justify-center' : 'flex items-center justify-between'}`}>
          {!isSidebarMini ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <span className="text-black font-black italic text-sm">MK</span>
                </div>
                <div>
                  <h1 className="font-extrabold text-lg leading-none text-white">MK-way</h1>
                  <p className="text-[9px] font-bold text-orange-400 uppercase tracking-[0.2em]">Discovery Lab</p>
                </div>
              </div>
              
              {/* ✅ Hide Button */}
              <button 
                onClick={() => setIsNavHidden(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-colors text-sm"
                title="Hide Navigation"
              >
                ⬇️ <span className="font-medium">Hide</span>
              </button>
            </>
          ) : (
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="text-black font-black italic text-sm">MK</span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Items (একই আছে) */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          <SidebarItem 
            active={currentView === 'feed'} 
            icon={<Home />} 
            label="Feed" 
            onClick={() => setCurrentView('feed')}
            isMini={isSidebarMini}
          />
          <SidebarItem 
            active={currentView === 'ask'} 
            icon={<MessageSquarePlus />} 
            label="Ask Question" 
            onClick={() => setCurrentView('ask')}
            isMini={isSidebarMini}
          />
          <SidebarItem 
            active={currentView === 'quiz'} 
            icon={<LayoutGrid />} 
            label="Quizzes" 
            onClick={() => setCurrentView('quiz')}
            isMini={isSidebarMini}
          />
          <SidebarItem 
            active={currentView === 'leaderboard'} 
            icon={<Trophy />} 
            label="Leaderboard" 
            onClick={() => setCurrentView('leaderboard')}
            isMini={isSidebarMini}
          />
          <SidebarItem 
            active={currentView === 'profile'} 
            icon={<UserIcon />} 
            label="Profile" 
            onClick={() => setCurrentView('profile')}
            isMini={isSidebarMini}
          />
          <SidebarItem 
            active={currentView === 'notifications'} 
            icon={<Bell />} 
            label="Notifications" 
            onClick={() => setCurrentView('notifications')}
            isMini={isSidebarMini}
          />
        </div>

        {/* Sidebar Footer (একই আছে) */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsSidebarMini(!isSidebarMini)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
          >
            {isSidebarMini ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!isSidebarMini && <span className="font-medium">Minimize</span>}
          </button>
        </div>
      </div>
    </div>

    {/* ✅ Show Nav Button (when hidden) */}
    {isNavHidden && (
      <button 
        onClick={() => setIsNavHidden(false)}
        className="fixed right-8 bottom-8 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center shadow-2xl hover:shadow-[0_0_25px_rgba(255,69,0,0.5)] transition-all duration-300 animate-pulse-slow"
        title="Show Navigation"
      >
        ⬆️
      </button>
    )}

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col relative z-10 max-w-md mx-auto w-full">
      {/* Top Header */}
      <header className="px-5 py-4 flex items-center justify-between bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div>
          <h1 className="font-extrabold text-xl text-white">
            {currentView === 'feed' && 'Feed'}
            {currentView === 'ask' && 'Ask Question'}
            {currentView === 'quiz' && 'Quizzes'}
            {currentView === 'leaderboard' && 'Leaderboard'}
            {currentView === 'profile' && 'Profile'}
            {currentView === 'notifications' && 'Notifications'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full bg-white/10 text-slate-300 border border-white/10 shadow-sm">
            <MessageCircle size={20} />
          </button>
          {notifications.filter(n => !n.isRead && n.userId === user?.id).length > 0 && (
            <div className="relative">
              <Bell size={20} className="text-orange-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">
                {notifications.filter(n => !n.isRead && n.userId === user?.id).length}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {renderView()}
      </main>
    </div>

    {/* Glass Notification Popup */}
    {activeNotification && (
      <div className="fixed top-20 right-4 z-[100] w-72 animate-slide-in pointer-events-auto">
        <div className="glass-morphism p-4 rounded-2xl flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${activeNotification.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500'}`} />
          <p className="text-sm font-medium text-white">{activeNotification.message}</p>
        </div>
      </div>
    )}
  </div>
);
};

export default App;