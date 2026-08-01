/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Key, User, ShieldCheck, GraduationCap } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (role: 'teacher' | 'secretary', name: string, userId?: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<'teacher' | 'secretary'>('teacher');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Retrieve current branding context if any has been configured
  const sysName = localStorage.getItem('sams_custom_app_name_v2') || 'منصة الإدارة';
  const sysLogo = localStorage.getItem('sams_custom_app_logo_v2') || 'م';

  
  
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = () => {
      const saved = localStorage.getItem('sams_system_users');
      if (saved) {
        setUsers(JSON.parse(saved));
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
  }, []);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedPassword = password.trim();
    const finalName = name.trim();
    
    
    
    const matchedUser = users.find(u => u.name === name && u.password === trimmedPassword) || users.find(u => u.role === role && u.password === trimmedPassword);
    
    if (matchedUser) {
      onLoginSuccess(role, finalName || matchedUser.name, matchedUser.id);
    } else {
      setError('رمز الدخول غير صحيح!');
    }
  };

  
  
  const autofillCredentials = (user: any) => {
    setRole(user.role);
    setName(user.name);
    setPassword(user.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-150 shadow-lg overflow-hidden animate-fade-in">
        
        {/* Banner with customized elegant "الدكتور" branding */}
        <div className="bg-[#0D5C8C] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center">
          {/* Subtle background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

          {/* Normal beautiful academic logo */}
          <div className="relative z-10 flex flex-col items-center animate-scale-up select-none">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#1A7FAA] to-[#F5C453] rounded-full flex items-center justify-center shadow-xl text-white mb-4 ring-4 ring-white/10">
              <GraduationCap className="w-11 h-11 text-white stroke-[1.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">الدكتور</h1>
            <p className="text-xs font-semibold text-[#FCF6BA] mt-2 px-3 py-1 bg-white/10 rounded-full">في اللغة العربية</p>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-slate-800">مرحباً بك، تسجيل الدخول للمنظومة</h2>
            <p className="text-xs text-slate-500">الرجاء اختيار الدور وإدخال رمز المرور لتفعيل الجلسة</p>
          </div>

          
          {/* Quick Choice Tabs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-xl border border-gray-100">
            <button
              type="button"
              onClick={() => { setRole('teacher'); setName(''); setPassword(''); }}
              className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'teacher'
                  ? 'bg-white text-[#0D5C8C] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="truncate max-w-full">المدير الأكاديمي</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('secretary'); setName(''); setPassword(''); }}
              className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'secretary'
                  ? 'bg-white text-[#0D5C8C] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="truncate max-w-full">سكرتيرة</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">اسم المستخدم (اختياري):</label>
              <div className="relative">
                
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0D5C8C] shadow-3xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">رمز الدخول السري المعطى لك:</label>
              <div className="relative">
                
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0D5C8C] shadow-3xs text-left"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-150 text-red-850 rounded-xl text-[11px] font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              تأكيد الدخول وفتح لوحة العمل
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
