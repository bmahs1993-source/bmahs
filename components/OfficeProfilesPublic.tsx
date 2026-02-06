
import React, { useState } from 'react';
import { SchoolData } from '../types';

interface OfficeProfilesPublicProps {
  schoolData: SchoolData;
}

const OfficeProfilesPublic: React.FC<OfficeProfilesPublicProps> = ({ schoolData }) => {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('office_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === schoolData.officeAccessUser && password === schoolData.officeAccessPass) {
      setIsAuthorized(true);
      sessionStorage.setItem('office_auth', 'true');
    } else {
      setError('Invalid Access Credentials');
    }
  };

  const categories = [
    { id: 'drive', label: 'Cloud Drive', color: 'bg-emerald-500', icon: '☁️' },
    { id: 'govt_portal', label: 'Govt. Portal', color: 'bg-red-500', icon: '🏛️' },
    { id: 'other', label: 'Other Resource', color: 'bg-heading', icon: '🔗' },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[60px] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
           <div className="text-center mb-10">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Protected Area</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Enter Office Credentials to View Profiles</p>
           </div>
           
           <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Username</label>
                 <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-accent outline-none font-bold shadow-inner"
                  placeholder="Office User"
                  required
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Password</label>
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-accent outline-none font-bold shadow-inner"
                  placeholder="••••••••"
                  required
                 />
              </div>
              
              {error && <p className="text-red-500 text-xs font-black text-center animate-shake">{error}</p>}
              
              <button 
                type="submit" 
                className="w-full py-5 bg-heading text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:-translate-y-1 transition-all"
              >
                Verify Identity
              </button>
           </form>
           
           <p className="mt-10 text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
             Access is limited to authorized school personnel only.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 space-y-16 animate-in fade-in duration-500">
       <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-heading uppercase tracking-tighter">Office Profiles</h1>
          <p className="text-accent font-black text-lg uppercase tracking-[0.3em]">Governance & Digital Portals</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {schoolData.officeProfiles.map(item => {
            const cat = categories.find(c => c.id === item.type);
            return (
              <div key={item.id} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col hover:-translate-y-2 transition-all">
                 <div className="flex-grow space-y-6">
                    <div className={`w-16 h-16 ${cat?.color || 'bg-slate-500'} text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl`}>
                       {cat?.icon || '📂'}
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{item.title}</h3>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat?.label}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-bold italic leading-relaxed">{item.description}</p>
                 </div>
                 <button 
                   onClick={() => item.url && window.open(item.url, '_blank')}
                   className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[25px] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-heading transition-colors flex items-center justify-center gap-2"
                 >
                   Launch Portal ↗
                 </button>
              </div>
            );
          })}

          {schoolData.officeProfiles.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-100 dark:bg-slate-900/30 rounded-[70px] border-4 border-dashed border-slate-200 dark:border-slate-800">
               <p className="text-slate-400 font-black text-xl uppercase tracking-widest opacity-50">No profiles currently listed</p>
            </div>
          )}
       </div>
       
       <div className="flex justify-center">
          <button 
            onClick={() => { sessionStorage.removeItem('office_auth'); setIsAuthorized(false); }}
            className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            Secure Logout
          </button>
       </div>
    </div>
  );
};

export default OfficeProfilesPublic;
