/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  Megaphone,
  Key,
  Database,
  Bot,
  UserCheck,
  Award,
  Clock,
  Printer,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  Star,
  SearchX,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
  Contact,
  QrCode,
  CalendarCheck2,
  Layers,
  BadgeDollarSign,
  Wallet,
  CreditCard,
  ShieldAlert,
  KeyRound,
  Activity,
  Settings,
  Search,
  ShieldCheck,
  Building2,
  Bell,
  CheckCheck,
  Trash2,
} from 'lucide-react';

// Import local components
import Dashboard from './components/Dashboard';
import StudentsList from './components/StudentsList';
import ParentsList from './components/ParentsList';
import ClassesManager from './components/ClassesManager';
import AttendanceTracker from './components/AttendanceTracker';
import SalariesManager from "./components/SalariesManager";
import FeesTracker from './components/FeesTracker';
import NotificationsCenter from './components/NotificationsCenter';
import SystemRoles from './components/SystemRoles';
import SystemAuditLogs from './components/SystemAuditLogs';
import LoginScreen from './components/LoginScreen';
import SettingsManager from './components/SettingsManager';
import StudentBarcodes from './components/StudentBarcodes';
import ExamsAndAssignments from './components/ExamsAndAssignments';
import PrivacyPolicy from './components/PrivacyPolicy';
import ThemeToggle from './components/ThemeToggle';
import InstallPWAButton from './components/InstallPWAButton';
import { initFirebaseSync } from './utils/firebaseSync';
import { AdminNotification } from './types';

import { motion, AnimatePresence } from 'motion/react';

import { samsDb, saveToStorage, getActiveSystem, setActiveSystem, SystemContext } from './utils/db';
import { checkFeeDueDatesBackgroundService } from './utils/feeReminderService';

type TabType = 'dashboard' | 'students' | 'parents' | 'barcodes' | 'classes' | 'attendance' | 'fees' | 'notifications' | 'roles' | 'audit' | 'settings' | 'exams' | 'salaries' | 'privacy';

interface NavSubItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isFinance?: boolean;
  roles: string[];
}

interface NavCategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isFinance?: boolean;
  roles: string[];
  subItems?: NavSubItem[];
}

export default function App() {
  // Active system context
  const [activeSystem, setActiveSystemState] = useState<SystemContext>(() => getActiveSystem());

  // Session states
  const [currentUserRole, setCurrentUserRole] = useState<'teacher' | 'secretary' | null>(
    (localStorage.getItem('sams_logged_in_role') as any) || null
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    localStorage.getItem('sams_logged_in_id') || null
  );
  const [currentUserName, setCurrentUserName] = useState(() => {
    const stored = localStorage.getItem('sams_logged_in_name') || '';
    if (stored === 'د. أحمد كمال' || stored === 'أحمد كمال' || stored === 'د أحمد كمال' || stored === 'الدكتور للمواد الشرعية') {
      localStorage.setItem('sams_logged_in_name', 'الدكتور في اللغة العربية');
      return 'الدكتور في اللغة العربية';
    }
    return stored || (getActiveSystem() === 'alsafa' ? 'مدير سيستم الصفا' : 'الدكتور في اللغة العربية');
  });

  // Customized Branding state
  const [customAppName, setCustomAppName] = useState(localStorage.getItem('sams_custom_app_name_v2') || 'منصة الإدارة');
  const [customAppLogo, setCustomAppLogo] = useState(localStorage.getItem('sams_custom_app_logo_v2') || 'م');
  const [customHeaderTitle, setCustomHeaderTitle] = useState(localStorage.getItem('sams_custom_header_title_v2') || (getActiveSystem() === 'alsafa' ? 'سيستم الصفا للمواد الشرعية' : 'الدكتور في اللغة العربية'));
  const [customHeaderSubtitle, setCustomHeaderSubtitle] = useState(localStorage.getItem('sams_custom_header_subtitle_v2') || 'بوابة التحكم الإدارية والحصص الأكاديمية');

  // High-Contrast Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sams_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sams_dark_mode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    initFirebaseSync(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  }, []);

  const [adminNotis, setAdminNotis] = useState<AdminNotification[]>([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [liveToastAlert, setLiveToastAlert] = useState<{ title: string; message: string; visible: boolean } | null>(null);

  useEffect(() => {
    let toastTimer: any = null;
    let lastToastTimestamp = 0;

    const handleNewNotiEvent = (e: Event) => {
      const now = Date.now();
      // Throttle: avoid rapid consecutive toast pops that freeze UI
      if (now - lastToastTimestamp < 2500) {
        return;
      }
      lastToastTimestamp = now;

      const customEvent = e as CustomEvent<{ title: string; message: string }>;
      if (localStorage.getItem('sams_visual_alerts_enabled') !== 'false') {
        const detail = customEvent.detail;
        if (detail && detail.title) {
          if (toastTimer) clearTimeout(toastTimer);
          setLiveToastAlert({ title: detail.title, message: detail.message || '', visible: true });
          toastTimer = setTimeout(() => {
            setLiveToastAlert(prev => prev ? { ...prev, visible: false } : null);
          }, 4000);
        }
      }
    };

    window.addEventListener('sams_notification_created', handleNewNotiEvent);
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
      window.removeEventListener('sams_notification_created', handleNewNotiEvent);
    };
  }, []);

  const notiDropdownRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiDropdownRef.current && !notiDropdownRef.current.contains(event.target as Node)) {
        setShowNotiDropdown(false);
      }
    }
    
    if (showNotiDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotiDropdown]);


  useEffect(() => {
    // 1. Initial cleanup / deduplication of bloated notifications
    samsDb.cleanDeduplicateNotifications();

    // 2. Load cleaned notifications into state
    setAdminNotis(samsDb.getAdminNotifications());

    // 3. Background fee check deferred by 4.5 seconds to ensure instant 0ms app boot
    const bgFeeTimer = setTimeout(() => {
      checkFeeDueDatesBackgroundService(undefined, { isStartup: true });
    }, 4500);
    
    // Real-time notifications update
    const updateNotis = () => {
      setAdminNotis(samsDb.getAdminNotifications());
    };
    
    window.addEventListener('sams_admin_notifications_changed', updateNotis);
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sams_admin_notifications' || e.key === 'sams_alsafa_admin_notifications') {
        updateNotis();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Low-frequency fallback poll
    const interval = setInterval(updateNotis, 60000);
    
    return () => {
      clearTimeout(bgFeeTimer);
      clearInterval(interval);
      window.removeEventListener('sams_admin_notifications_changed', updateNotis);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
  
  const handleMarkNotiRead = React.useCallback((id: string) => {
    samsDb.markAdminNotificationRead(id);
    setAdminNotis(samsDb.getAdminNotifications());
  }, []);
  
  const handleMarkAllRead = React.useCallback(() => {
    samsDb.markAllAdminNotificationsRead();
    setAdminNotis(samsDb.getAdminNotifications());
  }, []);
  
  const displayedNotis = React.useMemo(() => {
    return currentUserRole === 'secretary'
      ? adminNotis.filter(n => !(n.message && n.message.includes('سجلت الإدارة')))
      : adminNotis;
  }, [currentUserRole, adminNotis]);

  const unreadNotisCount = React.useMemo(() => {
    return displayedNotis.filter(n => !n.read).length;
  }, [displayedNotis]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // List matching students and teachers
  const allStudents = useMemo(() => samsDb.getStudents(), [refreshTrigger]);
  const allTeachers = useMemo(() => samsDb.getTeachers(), [refreshTrigger]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { students: [], teachers: [] };
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    const studentsRes = allStudents.filter(s => 
      s.name.toLowerCase().includes(cleanQuery) ||
      s.registration_id.toLowerCase().includes(cleanQuery) ||
      s.phone.toLowerCase().includes(cleanQuery) ||
      (s.parent_phone && s.parent_phone.toLowerCase().includes(cleanQuery)) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(cleanQuery))
    ).slice(0, 5);

    const teachersRes = allTeachers.filter(t => 
      t.name.toLowerCase().includes(cleanQuery) ||
      t.specialization.toLowerCase().includes(cleanQuery) ||
      t.phone.toLowerCase().includes(cleanQuery)
    ).slice(0, 3);

    return { students: studentsRes, teachers: teachersRes };
  }, [searchQuery, allStudents, allTeachers]);

  const forceRefresh = React.useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSettingsSaved = React.useCallback(() => {
    setCustomAppName(localStorage.getItem('sams_custom_app_name_v2') || 'منصة الإدارة');
    setCustomAppLogo(localStorage.getItem('sams_custom_app_logo_v2') || 'م');
    setCustomHeaderTitle(localStorage.getItem('sams_custom_header_title_v2') || 'الدكتور في اللغة العربية');
    setCustomHeaderSubtitle(localStorage.getItem('sams_custom_header_subtitle_v2') || 'بوابة التحكم الإدارية والحصص الأكاديمية');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('sams_logged_in_role');
    localStorage.removeItem('sams_logged_in_name');
    localStorage.removeItem('sams_logged_in_id');
    setCurrentUserRole(null);
    setCurrentUserName('');
    setCurrentUserId(null);
  }, []);

  const handleNavigateToTab = React.useCallback((tab: string) => {
    setActiveTab(tab as TabType);
  }, []);

  const handleToggleDarkMode = React.useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleLoginSuccess = React.useCallback((role: 'teacher' | 'secretary', name: string, userId?: string, system?: 'doctor' | 'alsafa') => {
    const targetSys = system || getActiveSystem();
    setActiveSystem(targetSys);
    setActiveSystemState(targetSys);
    if (userId) localStorage.setItem('sams_logged_in_id', userId);
    setCurrentUserId(userId || null);
    localStorage.setItem('sams_logged_in_role', role);
    localStorage.setItem('sams_logged_in_name', name);
    if (role === 'teacher') {
      samsDb.setCurrentRole('principal'); // full admin
    } else {
      samsDb.setCurrentRole('teacher'); // restricted admin
    }
    setCurrentUserRole(role);
    setCurrentUserName(name);
    if (role === 'secretary') {
      setActiveTab('attendance');
    } else {
      setActiveTab('dashboard');
    }
  }, []);

  const [openNavGroups, setOpenNavGroups] = useState<string[]>([]);

  const getRoleBadge = React.useCallback((role: string) => {
    if (activeSystem === 'alsafa') {
      return { name: 'مدير سيستم الصفا', style: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold' };
    }
    if (currentUserRole === 'secretary') {
      return { name: 'سكرتيرة الإدارة', style: 'bg-sky-50 text-sky-800 border border-sky-200 font-bold' };
    }
    return {
      admin: { name: 'مدير النظام الأعلى', style: 'bg-red-50 text-[#C0152A] border border-[#E8192C]/20' },
      principal: { name: 'مدير السنتر', style: 'bg-[#0D5C8C]/10 text-[#0D5C8C] border border-[#1A7FAA]/20' },
      teacher: { name: 'الإدارة الأكاديمية (مسؤول)', style: 'bg-amber-50 text-amber-805 text-amber-800 border border-amber-200' },
      parent: { name: 'ولي الأمر', style: 'bg-indigo-50 text-indigo-800 border border-indigo-200' },
      student: { name: 'طالب مقيد', style: 'bg-emerald-50 text-emerald-800 border border-emerald-200' }
    }[role] || { name: 'زائر', style: 'bg-gray-50 text-gray-700' };
  }, [activeSystem, currentUserRole]);

  const navCategories: NavCategoryItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'لوحة التحكم والمؤشرات',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['teacher']
    },
    {
      id: 'students_group',
      label: 'شؤون الطلاب',
      icon: <GraduationCap className="w-4 h-4" />,
      roles: ['teacher', 'secretary'],
      subItems: [
        { id: 'students', label: 'إدارة الطلاب', icon: <UserCheck className="w-3.5 h-3.5" />, roles: ['teacher', 'secretary'] },
        { id: 'parents', label: 'إدارة أولياء الأمور', icon: <Contact className="w-3.5 h-3.5" />, roles: ['teacher', 'secretary'] },
        { id: 'barcodes', label: 'باركود وكروت الطلاب', icon: <QrCode className="w-3.5 h-3.5" />, roles: ['teacher', 'secretary'] },
        { id: 'attendance', label: 'الحضور والانتظام اليومي', icon: <CalendarCheck2 className="w-3.5 h-3.5" />, roles: ['teacher', 'secretary'] },
        { id: 'exams', label: 'الامتحانات والواجبات', icon: <Award className="w-3.5 h-3.5" />, roles: ['teacher', 'secretary'] },
      ]
    },
    {
      id: 'classes_group',
      label: 'المجموعات',
      icon: <BookOpen className="w-4 h-4" />,
      roles: ['teacher', 'secretary'],
      subItems: [
        { id: 'classes', label: 'المجموعات', icon: <Layers className="w-3.5 h-3.5" />, roles: ['teacher', 'secretary'] },
      ]
    },
    {
      id: 'finance_group',
      label: 'الحسابات والمالية',
      icon: <BadgeDollarSign className="w-4 h-4 text-amber-300" />,
      isFinance: true,
      roles: ['teacher', 'secretary'],
      subItems: [
        { id: 'salaries', label: 'المرتبات والمصروفات', icon: <Wallet className="w-3.5 h-3.5 text-amber-300" />, isFinance: true, roles: ['teacher'] },
        { id: 'fees', label: 'اشتراكات الشهر والحسابات', icon: <CreditCard className="w-3.5 h-3.5 text-emerald-300" />, isFinance: true, roles: ['teacher', 'secretary'] },
        { id: 'notifications', label: 'بث الرسائل وتواصل الآباء', icon: <Megaphone className="w-3.5 h-3.5 text-sky-300" />, roles: ['teacher', 'secretary'] },
      ]
    },
    {
      id: 'management_group',
      label: 'الإدارة والصلاحيات',
      icon: <ShieldAlert className="w-4 h-4" />,
      roles: ['teacher'],
      subItems: [
        { id: 'roles', label: 'الصلاحيات وتدقيق الأمان', icon: <KeyRound className="w-3.5 h-3.5" />, roles: ['teacher'] },
        { id: 'audit', label: 'سجل المعاملات الحية', icon: <Activity className="w-3.5 h-3.5" />, roles: ['teacher'] },
      ]
    },
    { id: 'privacy', label: 'سياسة الخصوصية', icon: <ShieldCheck className="w-4 h-4" />, roles: ['teacher', 'secretary'] },
    { id: 'settings', label: 'إعدادات المنصة', icon: <Settings className="w-4 h-4" />, roles: ['teacher'] }
  ], []);

  // Flat list for checking permissions
  const fullNavItems = useMemo(() => {
    return navCategories.reduce((acc, cat) => {
      if (cat.subItems) {
        return [...acc, ...cat.subItems];
      }
      return [...acc, cat];
    }, [] as any[]);
  }, [navCategories]);

  const allowedNavItems = useMemo(() => {
    let users: any[] = [];
    try {
      users = samsDb.getSystemUsers();
    } catch (e) {}
    
    const user = users.find(u => u.id === currentUserId);
    if (user && user.permissions && user.permissions.length > 0) {
      return fullNavItems.filter(item => user.permissions.includes(item.id) || item.id === 'privacy');
    }
    return fullNavItems.filter(item => item.roles.includes(currentUserRole || 'teacher'));
  }, [currentUserId, currentUserRole, fullNavItems]);

  const toggleNavGroup = React.useCallback((groupId: string) => {
    setOpenNavGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  }, []);

  // Security tab guard for Secretary role
  const currentTabAllowed = allowedNavItems.some(item => item.id === activeTab);
  if (!currentTabAllowed && allowedNavItems.length > 0) {
    setActiveTab(allowedNavItems[0].id as TabType);
  }

  // If not logged in, force LoginScreen immediately
  if (!currentUserRole) {
    return (
      <LoginScreen
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="h-screen print:h-auto bg-[#F4F6F8] dark:bg-slate-900 print:bg-white dark:bg-slate-800 text-[#1A1A2E] dark:text-white flex overflow-hidden print:overflow-visible font-sans" dir="rtl">
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-45 lg:hidden animate-fade-in"
        />
      )}

      {/* Navigation Sidebar (RTL: right side) */}
      <aside className={` print:hidden 
        fixed lg:static inset-y-0 right-0 ${
          activeSystem === 'alsafa' ? 'bg-[#064e3b] border-emerald-700/30' : 'bg-[#0D5C8C] border-[#1A7FAA]/20'
        } text-white flex flex-col p-0 shadow-lg z-50 lg:z-auto transition-all duration-300 border-l shrink-0 h-full overflow-y-auto no-scrollbar
        ${mobileMenuOpen ? 'translate-x-0 w-72 max-w-[85vw]' : 'translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        
        {/* Logo Brand Header */}
        <div className={`py-5 px-4 border-b shrink-0 select-none flex flex-col items-center justify-center text-center w-full transition-all duration-300 ${
          activeSystem === 'alsafa' ? 'bg-[#043d2e] border-emerald-700/30' : 'bg-[#0a4d75] border-[#1A7FAA]/30'
        } ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
          {activeSystem === 'alsafa' ? (
            <>
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-300 rounded-full flex items-center justify-center shadow-lg text-white mb-3 ring-4 ring-white/15">
                <Building2 className="w-8 h-8 text-white stroke-[1.5]" />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">سيستم الصفا</h1>
              <p className="text-xs font-semibold text-emerald-100 mt-1.5 px-3.5 py-1 bg-white/15 rounded-full select-none backdrop-blur-xs">للمواد الشرعية</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-gradient-to-tr from-[#1A7FAA] to-[#F5C453] rounded-full flex items-center justify-center shadow-lg text-white mb-3 ring-4 ring-white/10">
                <GraduationCap className="w-8 h-8 text-white stroke-[1.5]" />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">الدكتور</h1>
              <p className="text-xs font-semibold text-[#FCF6BA] mt-1.5 px-3 py-1 bg-white/10 rounded-full select-none">في اللغة العربية</p>
            </>
          )}
        </div>

        {isSidebarCollapsed && (
          <div className={`py-5 px-2 border-b shrink-0 select-none flex flex-col items-center justify-center text-center w-full transition-all duration-300 ${
            activeSystem === 'alsafa' ? 'bg-[#043d2e] border-emerald-700/30' : 'bg-[#0a4d75] border-[#1A7FAA]/30'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white ring-2 ring-white/10 ${
              activeSystem === 'alsafa' ? 'bg-gradient-to-tr from-emerald-500 to-teal-300' : 'bg-gradient-to-tr from-[#1A7FAA] to-[#F5C453]'
            }`}>
              {activeSystem === 'alsafa' ? <Building2 className="w-5 h-5 text-white stroke-[1.5]" /> : <GraduationCap className="w-5 h-5 text-white stroke-[1.5]" />}
            </div>
          </div>
        )}

        {/* Mobile close button inside sidebar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1A7FAA]/20 lg:hidden font-sans border-b border-[#1A7FAA]/30 shrink-0">
          <span className="font-bold text-[11px] text-blue-100">القائمة الأساسية</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-blue-100 hover:text-white cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {navCategories.map((category) => {
            if (!category.roles.includes(currentUserRole || 'teacher')) return null;

            if (category.subItems) {
              const isOpen = openNavGroups.includes(category.id);
              const allowedSubItems = category.subItems.filter(sub => sub.roles.includes(currentUserRole || 'teacher'));
              if (allowedSubItems.length === 0) return null;

              const isAnyChildActive = allowedSubItems.some(sub => activeTab === sub.id);

              return (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (isSidebarCollapsed) {
                        setIsSidebarCollapsed(false);
                        if (!openNavGroups.includes(category.id)) {
                          toggleNavGroup(category.id);
                        }
                      } else {
                        toggleNavGroup(category.id);
                      }
                    }}
                    className={`w-full text-right ${isSidebarCollapsed ? 'px-0 justify-center py-3' : 'px-4 py-2.5'} text-xs rounded-xl font-bold flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} transition-all cursor-pointer group ${
                      isAnyChildActive && !isOpen
                        ? 'bg-[#1A7FAA]/35 text-white shadow-xs'
                        : 'text-blue-100 hover:bg-[#1A7FAA]/20 hover:text-white'
                    }`}
                    title={isSidebarCollapsed ? category.label : undefined}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <span className={`text-sm shrink-0 transition-transform ${
                        isAnyChildActive ? 'text-amber-300' : 'text-blue-200 group-hover:text-white'
                      } ${category.isFinance ? 'finance-wobble-hover' : 'group-hover:scale-110'}`}>
                        {category.icon}
                      </span>
                      {!isSidebarCollapsed && <span>{category.label}</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                    )}
                  </button>
                  
                  {isOpen && !isSidebarCollapsed && (
                    <div className="pl-2 pr-4 space-y-1 animate-fade-in mt-1 mr-3 border-r-2 border-white/10">
                      {allowedSubItems.map(subItem => {
                        const isActive = activeTab === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id as TabType);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-right px-3 py-2 text-[11px] rounded-lg font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                              isActive
                                ? 'bg-[#1A7FAA] text-white shadow-xs'
                                : 'text-blue-100/90 hover:bg-[#1A7FAA]/40 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`shrink-0 transition-transform ${
                                  isActive ? 'text-amber-300 scale-110' : 'text-blue-200/90 group-hover:text-white'
                                } ${subItem.isFinance ? 'finance-wobble-hover' : 'group-hover:scale-110'}`}
                              >
                                {subItem.icon}
                              </span>
                              <span className="truncate">{subItem.label}</span>
                            </div>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0 shadow-xs animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Standalone category item
            const isActive = activeTab === category.id;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveTab(category.id as TabType);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right ${isSidebarCollapsed ? 'px-0 justify-center py-3' : 'px-4 py-3'} text-xs rounded-xl font-bold flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#1A7FAA] text-white shadow-xs'
                    : 'text-blue-100 hover:bg-[#1A7FAA]/50 hover:text-white'
                }`}
                title={isSidebarCollapsed ? category.label : undefined}
              >
                <span className={`text-sm shrink-0 transition-transform ${
                  isActive ? 'text-amber-300 scale-110' : 'text-blue-200 group-hover:text-white'
                } ${category.isFinance ? 'finance-wobble-hover' : 'group-hover:scale-110'}`}>
                  {category.icon}
                </span>
                {!isSidebarCollapsed && <span>{category.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom status block - streamlined to maximize space */}
        <div className={`p-4 border-t border-[#1A7FAA]/40 mt-auto shrink-0 bg-[#073c5dd0] backdrop-blur-md ${isSidebarCollapsed ? 'px-2 flex justify-center' : ''}`}>
          <button 
            type="button" 
            onClick={handleLogout}
            className={`w-full py-2.5 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-4'} bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 group shadow-3xs`}
            title={isSidebarCollapsed ? "تسجيل الخروج" : undefined}
          >
            <LogOut className={`w-4 h-4 ${!isSidebarCollapsed ? 'group-hover:-translate-x-1' : ''} transition-transform`} />
            {!isSidebarCollapsed && <span className="font-sans">تسجيل الخروج من النظام</span>}
          </button>
        </div>

      </aside>

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col h-full print:h-auto overflow-hidden print:overflow-visible w-full max-w-full min-w-0">
        
        {/* Upper Main Header inside the content wrapper */}
        <header className="h-16 sm:h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm z-30 print:hidden w-full max-w-full min-w-0 transition-all">
          
          {/* Logo and Branding section */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 ml-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl lg:hidden cursor-pointer transition-colors"
              aria-label="فتح القائمة الجانبية"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Brand Title Badge removed as requested */}

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2.5 ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
              title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
            >
              {isSidebarCollapsed ? <PanelRightOpen className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
            </button>
          </div>

          {/* Sleek Animated Search bar */}
          <div className="hidden md:flex relative z-50 flex-1 justify-center mx-4">
            <motion.div 
              initial={false}
              animate={{ 
                width: isSearchFocused ? '28rem' : '20rem',
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center rounded-xl"
            >
              <motion.div 
                animate={{ 
                  borderColor: isSearchFocused 
                    ? '#1A7FAA' 
                    : (isDarkMode ? '#334155' : '#E2E8F0'),
                  boxShadow: isSearchFocused 
                    ? '0 6px 18px -4px rgba(26, 127, 170, 0.2), 0 0 0 1px #1A7FAA' 
                    : '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full py-0.5 overflow-hidden"
              >
                <motion.span 
                  animate={{ 
                    scale: isSearchFocused ? 1.08 : 1,
                    color: isSearchFocused ? '#1A7FAA' : '#94A3B8'
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute right-3.5 pointer-events-none z-10"
                >
                  <Search className="w-4 h-4" />
                </motion.span>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث السريع عن طالب، معلم، أو رقم قيد..." 
                  className="w-full flex-1 min-w-0 max-w-full bg-transparent border-none border-0 py-2 pr-10 pl-16 text-xs text-slate-800 dark:text-slate-100 outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-right font-sans"
                />
                
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3.5 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute left-3.5 hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded border border-slate-300/40 dark:border-slate-700 pointer-events-none z-10">
                    CTRL K
                  </kbd>
                )}
              </motion.div>
            </motion.div>

            {/* Suggestions Dropdown Card */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 6, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute right-0 left-0 top-full mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden py-3 text-right z-50"
                  dir="rtl"
                >
                  <div className="space-y-4 max-h-[360px] overflow-y-auto no-scrollbar">
                      
                    {/* Students list */}
                    {searchResults.students.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 text-[11px] font-bold text-[#0D5C8C] dark:text-[#38bdf8] bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
                          <span>الطلاب المطابقون ({searchResults.students.length})</span>
                          <span className="text-[9px] text-slate-400 font-normal">اضغط للانتقال</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                          {searchResults.students.map((student) => (
                            <button
                              key={student.id}
                              onClick={() => {
                                localStorage.setItem('sams_global_search', student.name);
                                setActiveTab('students');
                                setSearchQuery('');
                              }}
                              className="w-full px-4 py-2.5 text-right hover:bg-sky-50/70 dark:hover:bg-slate-700/60 transition-all flex items-center justify-between text-xs cursor-pointer group"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0D5C8C] dark:group-hover:text-sky-400 transition-colors">{student.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                                  <span>قيد: {student.registration_id}</span>
                                  <span>•</span>
                                  <span>{student.grade_level}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-[#0D5C8C] dark:text-sky-300 font-semibold bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/40">
                                {student.status === 'active' ? 'نشط' : student.status === 'suspended' ? 'موقوف' : 'مؤجل'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.students.length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs space-y-2 font-sans flex flex-col items-center justify-center">
                        <SearchX className="w-8 h-8 opacity-40 text-slate-400" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">لم نعثر على أي نتائج مطابقة</p>
                        <p className="text-[10px] text-slate-400">تأكد من كتابة الاسم أو رقم القيد بشكل صحيح</p>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info badges, User details */}
          
          {/* Notifications & User Details */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 min-w-0">

            {/* Install PWA Button */}
            <InstallPWAButton />

            {/* Khaled Sakr Style Animated Theme Switcher */}
            <ThemeToggle isDarkMode={isDarkMode} onToggle={handleToggleDarkMode} />

            {/* Notification Bell linking directly to dedicated Notifications Center */}
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 ${
                activeTab === 'notifications'
                  ? 'bg-[#0D5C8C]/10 text-[#0D5C8C] dark:bg-sky-950/50 dark:text-sky-400 ring-2 ring-[#0D5C8C]/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="مركز الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadNotisCount > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-800"></span>
                </span>
              )}
            </button>

            {/* Clock moved to Dashboard & Footer as requested */}
          </div>

        </header>

        {/* Viewport scroll area containing current Tab view */}
        <main className="flex-1 p-3 sm:p-5 md:p-8 pb-24 lg:pb-8 print:p-0 overflow-y-auto print:overflow-visible no-scrollbar w-full space-y-4 sm:space-y-6 md:space-y-8">
          <div key={activeTab} className="w-full mx-auto">
            {activeTab === 'dashboard' && <Dashboard onNavigateToTab={handleNavigateToTab} />}
            {activeTab === 'students' && <StudentsList />}
            {activeTab === 'parents' && <ParentsList />}
            {activeTab === 'barcodes' && <StudentBarcodes />}
            {activeTab === 'classes' && <ClassesManager />}
            {activeTab === 'exams' && <ExamsAndAssignments />}
            {activeTab === 'attendance' && <AttendanceTracker />}
            {activeTab === 'salaries' && <SalariesManager />}
            {activeTab === 'fees' && <FeesTracker />}
            {activeTab === 'notifications' && <NotificationsCenter onNavigateToTab={handleNavigateToTab} />}
            {activeTab === 'roles' && <SystemRoles onRefreshAllData={forceRefresh} />}
            {activeTab === 'audit' && <SystemAuditLogs />}
            {activeTab === 'privacy' && <PrivacyPolicy />}
            {activeTab === 'settings' && (
              <SettingsManager 
                onSettingsSaved={handleSettingsSaved}
                onLogout={handleLogout}
                userRole={currentUserRole}
                userName={currentUserName}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
              />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb friendly, native app feel) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden safe-area-pb" dir="rtl">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-[#0D5C8C] dark:text-sky-400 font-black'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">الرئيسية</span>
          </button>

          {/* 2. Students */}
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'students'
                ? 'text-[#0D5C8C] dark:text-sky-400 font-black'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">الطلاب</span>
          </button>

          {/* 3. Attendance */}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'attendance'
                ? 'text-[#0D5C8C] dark:text-sky-400 font-black'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <CalendarCheck2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">الحضور</span>
          </button>

          {/* 4. Fees */}
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'fees'
                ? 'text-[#0D5C8C] dark:text-sky-400 font-black'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">الحسابات</span>
          </button>

          {/* 5. More Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all font-medium"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">المزيد</span>
          </button>
        </nav>

      </div>

      {/* Mobile Search Modal Overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 p-4 md:hidden flex flex-col"
            dir="rtl"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Modal Search Header */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم طالب، رقم قيد، مرحلة..."
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none text-right font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600 text-xs">
                    
                  </button>
                )}
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold shrink-0"
                >
                  إغلاق
                </button>
              </div>

              {/* Modal Results */}
              <div className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-700/60">
                {searchResults.students.length > 0 ? (
                  searchResults.students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        localStorage.setItem('sams_global_search', student.name);
                        setActiveTab('students');
                        setSearchQuery('');
                        setMobileSearchOpen(false);
                      }}
                      className="w-full p-3 text-right hover:bg-sky-50/70 dark:hover:bg-slate-700/60 transition-all flex items-center justify-between text-xs cursor-pointer rounded-xl"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{student.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                          <span>قيد: #{student.registration_id}</span>
                          <span>•</span>
                          <span>{student.grade_level}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#0D5C8C] dark:text-sky-300 font-semibold bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/40">
                        {student.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </button>
                  ))
                ) : searchQuery ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <SearchX className="w-8 h-8 opacity-40 mx-auto" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">لم نعثر على نتائج</p>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    اكتب اسم الطالب أو رقم القيد في مربع البحث بالأعلى
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Visual Notification Banner (Top Right/Center) */}
      <AnimatePresence>
        {liveToastAlert && liveToastAlert.visible && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-100 max-w-md w-[92%] sm:w-auto bg-slate-900/95 dark:bg-slate-900 border-2 border-amber-400 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3.5"
            dir="rtl"
          >
            <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 space-y-0.5 text-right pr-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-300">إشعار جديد يصل الآن!</span>
                <span className="text-[10px] text-slate-400">تنبيه آلي</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 leading-snug">{liveToastAlert.title}</h4>
              {liveToastAlert.message && (
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">{liveToastAlert.message}</p>
              )}
            </div>
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setLiveToastAlert(prev => prev ? { ...prev, visible: false } : null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer text-xs"
                title="إغلاق الإشعار"
              >
                
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
