import React, { useState, useEffect, useRef } from 'react';
import { db } from './services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, increment, setDoc } from 'firebase/firestore';
import { AppView, Question, User, Target, Notification } from './types';
import { 
  Home, 
  MessageSquarePlus, 
  Trophy, 
  LayoutGrid, 
  User as UserIcon, 
  MessageCircle, 
  Bell, 
  ChevronUp, 
  ChevronDown,
  Menu 
} from 'lucide-react';
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

// Bottom Navigation Item Component
const BottomNavItem: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-2 flex-1 min-w-0 transition-all duration-300 ${
      active ? 'text-orange-400' : 'text-[#94a3b8] hover:text-white'
    }`}
  >
    <div className={`p-2 rounded-full transition-all ${active ? 'bg-orange-500/20' : ''}`}>
      {React.isValidElement(icon) ? 
        React.cloneElement(icon as React.ReactElement<any>, { 
          size: 22, 
          strokeWidth: active ? 2.5 : 2 
        }) : icon
      }
    </div>
    <span className="text-xs font-medium whitespace-nowrap truncate">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [isBottomNavHidden, setIsBottomNavHidden] = useState(false);
  
  // Swipe gesture tracking
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  
  // Minimum swipe distance (vertical for up/down swipe)
  const minSwipeDistance = 40;

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
      case 'feed':
        return (
          <Feed
            questions={questions.filter(q => !q.isPrivate)}
            onRate={() => { }}
            onLike={toggleLike}
            onAddComment={addComment}
            onPostPublic={handlePostPublic}
            currentUserId={user.id}
            onAskClick={() => setCurrentView('ask')}
            user={user}
          />
        );
      case 'ask':
        return (
          <AskQuestion
            user={user}
            questions={questions.filter(q => q.isPrivate || (isAdmin && q.target === Target.TEACHER))}
            onAsk={addQuestion}
            isAdmin={isAdmin}
            onReply={adminReply}
            onLogoutAdmin={() => { setIsAdmin(false); setCurrentView('feed'); }}
          />
        );
      case 'quiz':
        return <QuizList onPointsEarned={handleQuizPoints} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile user={user} onAdminLogin={() => setIsAdmin(true)} isAdmin={isAdmin} onLogout={handleLogout} />;
      case 'notifications':
        return (
          <Notifications
            notifications={notifications.filter(n => n.userId === user.id)}
            onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
            onClearAll={() => setNotifications(prev => prev.filter(n => n.userId !== user.id))}
            onNavigateToQuestion={() => setCurrentView('ask')}
          />
        );
      default:
        return null;
    }
  };

  // Swipe gesture handlers for vertical swipe (up/down)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    // Up swipe hides, down swipe shows (if hidden)
    if (isUpSwipe && !isBottomNavHidden) {
      setIsBottomNavHidden(true);
    } else if (isDownSwipe && isBottomNavHidden) {
      setIsBottomNavHidden(false);
    }
  };

  if (showSplash) return <SplashScreen />;
  if (!isLoggedIn) return <AuthPortal onAuthSuccess={handleAuthSuccess} existingUsers={registry} />;

  const navItems: { view: AppView; icon: React.ReactNode; label: string }[] = [
    { view: 'feed', icon: <Home />, label: 'Feed' },
    { view: 'ask', icon: <MessageSquarePlus />, label: 'Ask' },
    { view: 'quiz', icon: <LayoutGrid />, label: 'Quizzes' },
    { view: 'leaderboard', icon: <Trophy />, label: 'Leaderboard' },
    { view: 'profile', icon: <UserIcon />, label: 'Profile' },
    { view: 'notifications', icon: <Bell />, label: 'Alerts' },
  ];

  return (
    <div className="flex flex-col h-screen cosmic-bg overflow-hidden relative">
      {/* Animated Cosmic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* ... তোমার existing background code ... */}
      </div>

      {/* ✅ Main Content Area */}
      <div className={`flex-1 flex flex-col relative z-10 overflow-y-auto transition-all duration-300 ${
        isBottomNavHidden ? 'pb-4' : 'pb-24'
      }`}>
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
        <main className="flex-1 p-4">
          {renderView()}
        </main>
      </div>

      {/* ✅ GLASS BOTTOM NAVIGATION BAR */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-out ${
          isBottomNavHidden ? 'translate-y-full' : 'translate-y-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Indicator */}
        <div className="flex justify-center mb-1">
          <div className="w-12 h-1.5 bg-white/40 rounded-full"></div>
        </div>

        {/* Glass Navigation Bar */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border-t border-white/20 shadow-2xl pt-3 pb-5 px-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="text-xs text-white/70">
              {isBottomNavHidden ? 'Navigation hidden' : 'Swipe ↑ to hide'}
            </div>
            <button
              onClick={() => setIsBottomNavHidden(!isBottomNavHidden)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label={isBottomNavHidden ? 'Show navigation' : 'Hide navigation'}
            >
              {isBottomNavHidden ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-1">
            {navItems.map((item) => (
              <BottomNavItem
                key={item.view}
                active={currentView === item.view}
                icon={item.icon}
                label={item.label}
                onClick={() => {
                  setCurrentView(item.view);
                  // Optional: Auto-hide after selection
                  // setIsBottomNavHidden(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ✅ FLOATING SHOW BUTTON (when bottom nav is hidden) */}
      {isBottomNavHidden && (
        <button
          onClick={() => setIsBottomNavHidden(false)}
          className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500/90 to-pink-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 border border-white/20 group animate-pulse"
          title="Show Navigation"
        >
          <Menu size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute -top-8 bg-black/80 backdrop-blur-sm text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Swipe ↓ or click to show
          </div>
        </button>
      )}

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