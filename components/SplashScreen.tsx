
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Animated Background Orbs (Gemini Style) */}
        <div className="absolute w-40 h-40 bg-indigo-500 rounded-full gemini-blur opacity-40 mix-blend-multiply filter blur-3xl -top-4 -left-4"></div>
        <div className="absolute w-40 h-40 bg-blue-400 rounded-full gemini-blur opacity-40 mix-blend-multiply filter blur-3xl -bottom-4 -right-4" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-40 h-40 bg-purple-500 rounded-full gemini-blur opacity-40 mix-blend-multiply filter blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '2s' }}></div>
        
        {/* Central Logo Symbol */}
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center shadow-2xl relative overflow-hidden group border border-slate-800">
            {/* Subtle gloss effect instead of heavy color gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
            
            <div className="absolute inset-0 gemini-orbit">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full blur-[1px]"></div>
            </div>
            <span className="relative z-20 text-4xl font-black text-white tracking-tighter italic">MK</span>
          </div>
          
          <div className="mt-8 text-center overflow-hidden">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter animate-in slide-in-from-bottom-4 duration-700">
              MK-way
            </h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.4em] mt-2 animate-in slide-in-from-bottom-2 duration-1000 delay-300">
              The Intelligent Path
            </p>
          </div>
        </div>
      </div>
      
      {/* Loading Progress Bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-black rounded-full animate-[progress_3s_linear_forwards]"></div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
