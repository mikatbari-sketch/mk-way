import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { User } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const chartData = users.map((user, idx) => ({
    name: user.name,
    points: user.points,
    color: idx === 0 ? '#fb923c' : idx === 1 ? '#94a3b8' : idx === 2 ? '#a8a29e' : '#475569'
  }));

  return (
    <div className="p-4 space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Rankings</h2>
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-orange-100">Top 1%</span>
        </div>
      </div>

      <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Learning Activity</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', background: '#1e293b', color: '#fff' }} />
              <Bar dataKey="points" radius={[8, 8, 8, 8]} barSize={40}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* আগের কোড থেকে আসা স্ট্যাটাস সেকশন যা বাদ পড়ার ঝুঁকি ছিল */}
        <div className="mt-4 flex justify-between items-center px-2">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
            <p className="font-bold text-orange-400">92%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Streak</p>
            <p className="font-bold text-amber-500">12 Days</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Global</p>
            <p className="font-bold text-teal-400">#45</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Weekly Leaderboard</h3>
        {users.map((user, idx) => (
          <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${idx === 0 ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-white/5 border-white/5'}`}>
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {idx === 0 ? <Trophy className="w-6 h-6 text-orange-400" /> : 
                 idx === 1 ? <Medal className="w-6 h-6 text-slate-400" /> :
                 idx === 2 ? <Medal className="w-6 h-6 text-amber-700" /> :
                 <span className="text-sm font-bold text-slate-600">#{idx + 1}</span>}
              </div>
              
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className={`w-10 h-10 rounded-full bg-slate-800 border ${idx === 0 ? 'border-orange-400' : 'border-slate-700'}`} />
                {idx === 0 && (
                  <div className="absolute -top-1.5 -right-1.5 z-10">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-orange-400 blur-[4px] rounded-full animate-pulse"></div>
                      <div className="relative w-4 h-4 bg-gradient-to-br from-orange-600 to-yellow-400 rounded-sm rotate-45 border border-white/50 flex items-center justify-center">
                        <span className="text-[7px] font-black text-black -rotate-45 italic">MK</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className={`font-bold ${idx === 0 ? 'text-orange-100' : 'text-slate-100'}`}>{user.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level {user.level || (20 - idx)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-black text-orange-400">
              <Star className="w-4 h-4 fill-orange-400" />
              {user.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;