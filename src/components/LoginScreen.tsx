import React, { useState, useEffect } from 'react';
import { Sparkles, Key, User, ShieldCheck, GraduationCap, Building2, Layers } from 'lucide-react';
import { setActiveSystem, getActiveSystem, SystemContext } from '../utils/db';
import ThemeToggle from './ThemeToggle';

interface LoginScreenProps {
  onLoginSuccess: (role: 'teacher' | 'secretary', name: string, userId?: string, system?: 'doctor' | 'alsafa') => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function LoginScreen({ onLoginSuccess, isDarkMode = false, onToggleDarkMode }: LoginScreenProps) {
  const [selectedSystem, setSelectedSystem] = useState<'doctor' | 'alsafa'>(getActiveSystem());
  const [role, setRole] = useState<'teacher' | 'secretary'>('teacher');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = () => {
      const storageKey = selectedSystem === 'alsafa' ? 'sams_alsafa_system_users' : 'sams_system_users';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setUsers(JSON.parse(saved));
          return;
        } catch (e) {}
      }
      
      if (selectedSystem === 'alsafa') {
        setUsers([
          { id: 'u-alsafa-1', name: 'مدير سيستم الصفا', role: 'teacher', password: '4444', isDefault: true },
          { id: 'u-alsafa-2', name: 'سكرتارية سيستم الصفا', role: 'secretary', password: '4444', isDefault: true }
        ]);
      } else {
        setUsers([
          { id: 'u-1', name: 'المدير الأكاديمي', role: 'teacher', password: '123', isDefault: true },
          { id: 'u-2', name: 'أ. سارة علي', role: 'secretary', password: '456', isDefault: true }
        ]);
      }
    };
    loadUsers();
    
    window.addEventListener('storage', loadUsers);
    return () => window.removeEventListener('storage', loadUsers);
  }, [selectedSystem]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedPassword = password.trim();
    const finalName = name.trim();
    
    if (selectedSystem === 'alsafa') {
      const matchedUser = users.find(u => (finalName && u.name === finalName && u.password === trimmedPassword)) 
        || users.find(u => u.password === trimmedPassword)
        || (trimmedPassword === '4444' ? { id: 'u-alsafa-admin', name: finalName || 'مدير سيستم الصفا', role: 'teacher' } : null);

      if (matchedUser) {
        setActiveSystem('alsafa');
        onLoginSuccess((matchedUser.role as any) || 'teacher', finalName || matchedUser.name, matchedUser.id || 'u-alsafa-admin', 'alsafa');
      } else {
        setError('رمز الدخول السري لسيستم الصفا غير صحيح!');
      }
      return;
    }

    // Doctor system login
    setActiveSystem('doctor');
    const matchedUser = users.find(u => u.name === name && u.password === trimmedPassword) || users.find(u => u.role === role && u.password === trimmedPassword);
    
    if (matchedUser) {
      onLoginSuccess(role, finalName || matchedUser.name, matchedUser.id, 'doctor');
    } else {
      setError('رمز الدخول غير صحيح!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 shadow-lg overflow-hidden animate-fade-in">
        
        {/* Banner with dynamic branding */}
        <div className="absolute top-4 left-4 z-50">
          {onToggleDarkMode && (
            <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            </div>
          )}
        </div>

        <div className={`p-8 text-center relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-500 ${
          selectedSystem === 'alsafa' 
            ? 'bg-gradient-to-br from-emerald-800 via-teal-900 to-cyan-950' 
            : 'bg-[#0D5C8C]'
        }`}>
          {/* Subtle background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

          {selectedSystem === 'alsafa' ? (
            <div className="relative z-10 flex flex-col items-center animate-scale-up select-none">
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-300 rounded-full flex items-center justify-center shadow-xl text-white mb-4 ring-4 ring-white/15">
                <Building2 className="w-11 h-11 text-white stroke-[1.5]" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-wide">سيستم الصفا</h1>
              <p className="text-xs font-bold text-emerald-100 mt-2 px-3.5 py-1 bg-white/15 rounded-full backdrop-blur-xs border border-white/10 shadow-xs">
                للمواد الشرعية
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center animate-scale-up select-none">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#1A7FAA] to-[#F5C453] rounded-full flex items-center justify-center shadow-xl text-white mb-4 ring-4 ring-white/10">
                <GraduationCap className="w-11 h-11 text-white stroke-[1.5]" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-wide">الدكتور</h1>
              <p className="text-xs font-bold text-[#FCF6BA] mt-2 px-3.5 py-1 bg-white/10 rounded-full border border-white/10 shadow-xs">
                في اللغة العربية
              </p>
            </div>
          )}
        </div>

        {/* Content Form */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {selectedSystem === 'alsafa' ? 'مرحباً بك في سيستم الصفا للمواد الشرعية' : 'مرحباً بك في سيستم الدكتور في اللغة العربية'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedSystem === 'alsafa' 
                ? 'أدخل رمز المرور السري لفتح سجلات وقاعدة بيانات سيستم الصفا' 
                : 'الرجاء اختيار الدور وإدخال رمز المرور لتفعيل الجلسة'}
            </p>
          </div>

          {/* 3 Choices Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { 
                setSelectedSystem('doctor'); 
                setRole('teacher'); 
                setName(''); 
                setPassword(''); 
                setError(''); 
              }}
              className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                selectedSystem === 'doctor' && role === 'teacher'
                  ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-sm ring-1 ring-[#0D5C8C]/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#0D5C8C]" />
              <div className="flex flex-col items-center">
                <span className="truncate max-w-full text-[11px]">المدير الأكاديمي</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { 
                setSelectedSystem('doctor'); 
                setRole('secretary'); 
                setName(''); 
                setPassword(''); 
                setError(''); 
              }}
              className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                selectedSystem === 'doctor' && role === 'secretary'
                  ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-sm ring-1 ring-[#0D5C8C]/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0 text-sky-600" />
              <div className="flex flex-col items-center">
                <span className="truncate max-w-full text-[11px]">سكرتيرة</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { 
                setSelectedSystem('alsafa'); 
                setRole('teacher'); 
                setName('مدير سيستم الصفا'); 
                setPassword(''); 
                setError(''); 
              }}
              className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                selectedSystem === 'alsafa'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${selectedSystem === 'alsafa' ? 'text-amber-300' : 'text-emerald-500'}`} />
              <div className="flex flex-col items-center">
                <span className="truncate max-w-full text-[11px] font-bold">سيستم الصفا</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">اسم المستخدم (اختياري):</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedSystem === 'alsafa' ? 'مدير سيستم الصفا' : 'أدخل اسم المستخدم'}
                  className="w-full pl-3 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#0D5C8C] dark:focus:border-emerald-500 shadow-3xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                رمز الدخول السري:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#0D5C8C] dark:focus:border-emerald-500 shadow-3xs text-left tracking-widest"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/40 border border-red-150 text-red-850 dark:text-red-200 rounded-xl text-[11px] font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedSystem === 'alsafa'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-900/20'
                  : 'bg-[#0D5C8C] hover:bg-[#1A7FAA]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {selectedSystem === 'alsafa' ? 'تأكيد الدخول لسيستم الصفا' : 'تأكيد الدخول وفتح لوحة العمل'}
              </span>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
