
import React, { useState } from 'react';
import { User } from '../types';
import { Settings, Shield, Award, HelpCircle, LogOut, ChevronRight, ArrowLeft, CheckCircle2, Zap, Star, MessageSquare, BookOpen, Key, ShieldCheck, Lock } from 'lucide-react';

interface ProfileProps {
  user: User;
  onAdminLogin: () => void;
  isAdmin: boolean;
  onLogout: () => void;
}

type ProfileSection = 'main' | 'achievements' | 'privacy' | 'settings' | 'logout' | 'admin_login';

const Profile: React.FC<ProfileProps> = ({ user, onAdminLogin, isAdmin, onLogout }) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>('main');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (password === 'mkmikat') {
      onAdminLogin();
      setActiveSection('main');
      setPassword('');
      setError('');
    } else {
      setError('Invalid Access Key');
      setPassword('');
    }
  };

  const renderBack = () => (
    <button onClick={() => setActiveSection('main')} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-90 transition-all">
      <ArrowLeft className="w-5 h-5 text-slate-600" />
    </button>
  );

  if (activeSection === 'admin_login') return (
    <div className="p-8 h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-slate-900 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl">
        <Lock className="w-10 h-10" />
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Admin Portal</h3>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">Authorized Teacher Access Only</p>
      
      <div className="w-full space-y-6">
        <div className="relative">
          <input 
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
            placeholder="Enter Admin Secret..."
            className={`w-full py-5 px-6 bg-white border rounded-[28px] text-center font-black text-slate-900 focus:outline-none transition-all ${
              error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900'
            }`}
          />
          {error && <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}
        </div>

        <button 
          onClick={handleAdminLogin}
          className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm tracking-widest shadow-xl active:scale-95 transition-all"
        >
          AUTHENTICATE
        </button>

        <button 
          onClick={() => setActiveSection('main')}
          className="w-full py-5 bg-white text-slate-400 rounded-[28px] font-black text-[10px] tracking-widest uppercase"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (activeSection === 'achievements') return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4">
        {renderBack()}
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Milestones</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { icon: <Zap />, label: 'Thunder Bolt', desc: '5 Quizzes in one day', color: 'bg-amber-500' },
          { icon: <Star />, label: 'Rising Star', desc: 'First 100 points', color: 'bg-indigo-600' },
          { icon: <MessageSquare />, label: 'Curiosity Expert', desc: 'Asked 20 questions', color: 'bg-teal-500' },
          { icon: <BookOpen />, label: 'Sage', desc: 'Read 50 AI summaries', color: 'bg-slate-900' },
        ].map((a, i) => (
          <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-100 flex items-center gap-5 elegant-shadow">
            <div className={`w-14 h-14 rounded-2xl ${a.color} text-white flex items-center justify-center shadow-lg shadow-black/5`}>
              {a.icon}
            </div>
            <div>
              <p className="font-extrabold text-slate-900">{a.label}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{a.desc}</p>
            </div>
            <div className="ml-auto">
              <CheckCircle2 className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (activeSection === 'logout') return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white rounded-[48px] p-10 w-full max-w-sm text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <LogOut className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-900 mb-2">Logout?</h3>
        <p className="text-slate-400 font-bold mb-10 text-sm tracking-wide">Ready to pause your MK-way quest?</p>
        <div className="space-y-4">
          <button onClick={onLogout} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm tracking-widest active:scale-95 transition-all">SIGN OUT</button>
          <button onClick={() => setActiveSection('main')} className="w-full py-5 bg-white text-slate-400 rounded-[24px] font-black text-xs tracking-widest active:scale-95 transition-all uppercase">Stay active</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Card */}
      <div className="bg-white rounded-b-[64px] border-b border-slate-100 p-10 text-center elegant-shadow">
        <div className="relative inline-block mb-6">
          <div className="w-32 h-32 rounded-[42px] p-1.5 border-2 border-indigo-100 bg-white rotate-3 shadow-xl">
            <img src={user.avatar} className="w-full h-full object-cover rounded-[36px] -rotate-3" alt="" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border-2 border-white">
            LVL {user.level}
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{user.name}</h2>
        <p className="text-indigo-600 text-xs font-black uppercase tracking-[0.2em] mb-8">MK-way Visionary</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'XP', val: user.points, color: 'text-indigo-600' },
            { label: 'QUISTS', val: '24', color: 'text-amber-500' },
            { label: 'BADGES', val: '12', color: 'text-teal-600' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50/50 rounded-[28px] p-4 border border-slate-100/50">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-8 space-y-4 pb-12">
        <button 
          onClick={() => setActiveSection('admin_login')}
          className={`w-full flex items-center justify-between p-5 rounded-[28px] border transition-all elegant-shadow active:scale-98 group ${isAdmin ? 'bg-red-50 border-red-100' : 'bg-white border-slate-50'}`}
        >
          <div className="flex items-center gap-5">
            <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'} shadow-sm group-hover:scale-110 transition-transform`}>
              {isAdmin ? <ShieldCheck size={20} /> : <Key size={20} />}
            </div>
            <span className={`font-bold ${isAdmin ? 'text-red-600' : 'text-slate-700'}`}>
              {isAdmin ? 'Admin Panel Active' : 'Admin Login'}
            </span>
          </div>
          <ChevronRight className={`w-5 h-5 ${isAdmin ? 'text-red-300' : 'text-slate-200'}`} />
        </button>

        {[
          { id: 'achievements', icon: <Award />, label: 'My Achievements', color: 'text-amber-500', bg: 'bg-amber-50' },
          { id: 'privacy', icon: <Shield />, label: 'Privacy & Security', color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 'settings', icon: <Settings />, label: 'Preferences', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { id: 'help', icon: <HelpCircle />, label: 'Help Center', color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map((m) => (
          <button 
            key={m.id}
            onClick={() => setActiveSection(m.id as ProfileSection)}
            className="w-full flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-50 hover:border-indigo-100 transition-all elegant-shadow active:scale-98 group"
          >
            <div className="flex items-center gap-5">
              <div className={`p-3 rounded-2xl ${m.bg} ${m.color} shadow-sm group-hover:scale-110 transition-transform`}>
                {React.cloneElement(m.icon as React.ReactElement, { size: 20 })}
              </div>
              <span className="font-bold text-slate-700">{m.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>
        ))}

        <button 
          onClick={() => setActiveSection('logout')}
          className="w-full flex items-center gap-5 p-5 bg-red-50/50 border border-red-100/30 rounded-[28px] mt-4 active:scale-98 transition-all"
        >
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <LogOut size={20} />
          </div>
          <span className="font-bold text-red-600">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
