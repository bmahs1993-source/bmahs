
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolData } from '../types';

interface LoginProps {
  setIsAdmin: (val: boolean) => void;
  schoolData: SchoolData;
  updateSchoolData: (newData: Partial<SchoolData>) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAdmin, schoolData, updateSchoolData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  
  // Reset fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === schoolData.adminUsername && password === schoolData.adminPassword) {
      setIsAdmin(true);
      localStorage.setItem('admin_session', 'active');
      navigate('/admin');
    } else {
      setError('Wrong ID or password! Try again.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (resetCode !== schoolData.adminResetCode) {
      setError('Invalid Security Reset Code!');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Success - update the school data
    updateSchoolData({
      adminPassword: newPassword
    });

    setResetSuccess(true);
    setTimeout(() => {
      setIsResetMode(false);
      setResetSuccess(false);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50/30 dark:bg-emerald-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] p-10 md:p-16 border border-slate-100 dark:border-slate-800 relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Header Section with Circular Logo */}
        <div className="text-center mb-16 space-y-6">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-heading/20 dark:bg-white/5 rounded-full blur-2xl transform scale-150"></div>
                <div className="w-32 h-32 bg-heading rounded-full flex items-center justify-center p-1.5 shadow-2xl border-4 border-white dark:border-slate-800 relative z-10 overflow-hidden">
                    <img 
                      src={schoolData.logoUrl} 
                      className={`w-full h-full rounded-full ${schoolData.logoFit === 'cover' ? 'object-cover' : 'object-contain bg-white dark:bg-slate-800'}`} 
                      alt="Logo" 
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                  {isResetMode ? 'Password Reset' : 'Office Access'}
                </h2>
                <p className="text-[10px] font-black text-slate-900 dark:text-white opacity-80 uppercase tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed">
                  {schoolData.schoolName}
                </p>
            </div>
        </div>
        
        {!isResetMode ? (
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-5">User ID / Username</label>
              <div className="relative">
                  <input 
                  type="text" 
                  className="w-full p-6 bg-slate-50/80 dark:bg-slate-950/50 rounded-[35px] border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-heading/5 outline-none transition-all font-black text-slate-700 dark:text-white shadow-inner"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin ID"
                  required
                  />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-5">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Secure Password</label>
                <button 
                  type="button" 
                  onClick={() => { setIsResetMode(true); setError(''); }}
                  className="text-[10px] font-black text-heading dark:text-accent uppercase tracking-widest hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                  <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full p-6 pr-16 bg-slate-50/80 dark:bg-slate-950/50 rounded-[35px] border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-heading/5 outline-none transition-all font-black text-slate-700 dark:text-white shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-heading dark:hover:text-accent transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3 3m18 18l-6.876-6.876" /></svg>
                    )}
                  </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-5 rounded-[25px] font-black text-[11px] text-center border border-red-100 dark:border-red-900/50 animate-bounce uppercase tracking-widest">
                  {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-heading text-white py-6 rounded-[35px] font-black text-sm shadow-[0_20px_40px_-10px_rgba(0,64,113,0.3)] hover:translate-y-[-2px] active:scale-95 transition-all uppercase tracking-[0.2em]"
            >
              Authenticate Access
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-8">
            {resetSuccess ? (
              <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl border border-emerald-100">✓</div>
                <h4 className="text-2xl font-black text-emerald-600 uppercase tracking-tighter">Security Cleared</h4>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Applying new credentials...</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-5">Security Reset Code</label>
                  <input 
                    type="text" 
                    className="w-full p-6 bg-slate-50/80 dark:bg-slate-950/50 rounded-[35px] border border-transparent focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-black text-amber-600 shadow-inner"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-5">New Password</label>
                  <input 
                    type="password" 
                    className="w-full p-6 bg-slate-50/80 dark:bg-slate-950/50 rounded-[35px] border border-transparent focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-black text-slate-700 dark:text-white shadow-inner"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-5">Confirm Password</label>
                  <input 
                    type="password" 
                    className="w-full p-6 bg-slate-50/80 dark:bg-slate-950/50 rounded-[35px] border border-transparent focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-black text-slate-700 dark:text-white shadow-inner"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-5 rounded-[25px] font-black text-[11px] text-center border border-red-100 dark:border-red-900/50 uppercase tracking-widest">
                      {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsResetMode(false); setError(''); }}
                    className="w-1/3 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[25px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-grow bg-amber-500 text-white py-5 rounded-[30px] font-black text-sm shadow-xl hover:bg-amber-600 transition-all uppercase tracking-widest"
                  >
                    Set New Password
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        <div className="mt-16 text-center border-t border-slate-100 dark:border-slate-800 pt-8 opacity-40">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
              Institutional Digital Environment<br/>
              Super User Entry Only
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
