
import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, LogIn, Lock, User as UserIcon, ShieldCheck, Sparkles, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';

interface AuthPortalProps {
  onAuthSuccess: (user: User) => void;
  existingUsers: User[];
}

const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthSuccess, existingUsers }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = () => {
    setError('');
    if (!password.trim() || (mode === 'register' && !name.trim())) {
      setError('Please fill in all fields');
      return;
    }

    setIsProcessing(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      if (mode === 'register') {
        const userExists = existingUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (userExists) {
          setError('Name already registered. Try logging in!');
          setIsProcessing(false);
          return;
        }

        const newUser: User = {
          id: `user_${Date.now()}`,
          name: name.trim(),
          password: password.trim(),
          points: 100,
          level: 1,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        onAuthSuccess(newUser);
      } else {
        const foundUser = existingUsers.find(
          u => u.name.toLowerCase() === name.toLowerCase() && u.password === password
        );
        if (foundUser) {
          onAuthSuccess(foundUser);
        } else {
          setError('Invalid credentials. Please try again.');
          setIsProcessing(false);
        }
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-sm bg-white rounded-[48px] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Background Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center mb-6 shadow-xl">
             <ShieldCheck className="text-white w-8 h-8" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'register' ? 'Join the Lab' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              MK-way Intelligence Registry
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <UserIcon size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                placeholder="Access Key (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>

            {error && (
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-in shake">
                {error}
              </p>
            )}

            <button 
              onClick={handleAuth}
              disabled={isProcessing}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'register' ? 'Initialize Quest' : 'Authenticate'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <button 
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setError('');
              }}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              {mode === 'register' ? 'Already have a key? Log In' : 'Need a new key? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
