/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClassRoom, Teacher, Subject, CenterScheduleData, Student } from '../types';
import { samsDb, formatScheduleDisplay } from '../utils/db';
import StudentFullReport from './StudentFullReport';
import {
  Plus,
  BookOpen,
  User,
  Maximize2,
  ShieldAlert,
  Check,
  Calendar,
  Trash2,
  CheckCircle,
  Users,
  Eye,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Edit,
  RefreshCw,
  Printer,
  GraduationCap,
  AlertTriangle,
  CreditCard,
  UserPlus,
  Archive,
  RotateCcw,
  FileText,
  X,
  Upload,
  Image as ImageIcon,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSamsDbSync } from '../hooks/useSamsDbSync';

export default function ClassesManager() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddClass, setShowAddClass] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  
  const [classForm, setClassForm] = useState({
    name: '',
    schedule_days: '',
    schedule_time: '',
    day_times: {} as Record<string, string>,
    grade_level: 'الأول الإعدادي',
    education_type: 'عام' as 'عام' | 'أزهر'
  });

  const [unifiedTime, setUnifiedTime] = useState('');

  const [schedule, setSchedule] = useState<CenterScheduleData | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CenterScheduleData | null>(null);

  // Dedicated Group Students View State
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<ClassRoom | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'excellent' | 'warning'>('all');

  // Modals inside Group Students Page
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [targetClassIdForTransfer, setTargetClassIdForTransfer] = useState<string>('');
  const [showGroupWhatsAppModal, setShowGroupWhatsAppModal] = useState(false);
  const [groupWhatsAppMsg, setGroupWhatsAppMsg] = useState('');

  // Print Roster & Archive State
  const [showPrintRosterModal, setShowPrintRosterModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivedStudentToPermanentDelete, setArchivedStudentToPermanentDelete] = useState<Student | null>(null);
  const [archivedSearchTerm, setArchivedSearchTerm] = useState('');
  
  // Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');

  // PDF / Print Customization State
  const [printHeaderTitle, setPrintHeaderTitle] = useState(
    localStorage.getItem('sams_custom_header_title_v2') || 'الدكتور في اللغة العربية'
  );
  const [printHeaderSubtitle, setPrintHeaderSubtitle] = useState(
    localStorage.getItem('sams_custom_header_subtitle_v2') || 'سجل متابعة وكشوفات طلاب المجموعات التعليمية'
  );
  const [printHeaderContact, setPrintHeaderContact] = useState(
    localStorage.getItem('sams_custom_header_contact_v2') || 'هاتف: 01000000000 - الفرع الرئيسي'
  );
  const [printHeaderLogo, setPrintHeaderLogo] = useState(
    localStorage.getItem('sams_custom_app_logo_v2') || ''
  );
  const [printLogoAlign, setPrintLogoAlign] = useState<'right' | 'center' | 'left'>(
    (localStorage.getItem('sams_custom_header_logo_align_v2') as any) || 'right'
  );
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const val = event.target.result as string;
          setPrintHeaderLogo(val);
          localStorage.setItem('sams_custom_app_logo_v2', val);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePrintTitle = (val: string) => {
    setPrintHeaderTitle(val);
    localStorage.setItem('sams_custom_header_title_v2', val);
  };

  const updatePrintSubtitle = (val: string) => {
    setPrintHeaderSubtitle(val);
    localStorage.setItem('sams_custom_header_subtitle_v2', val);
  };

  const updatePrintContact = (val: string) => {
    setPrintHeaderContact(val);
    localStorage.setItem('sams_custom_header_contact_v2', val);
  };

  const updateLogoAlign = (align: 'right' | 'center' | 'left') => {
    setPrintLogoAlign(align);
    localStorage.setItem('sams_custom_header_logo_align_v2', align);
  };

  // Add Student Form State inside Group View
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    phone: '',
    parent_name: '',
    parent_phone: '',
    grade_level: 'الأول الإعدادي',
    birth_date: '2016-01-01',
    status: 'active' as 'active' | 'suspended' | 'archived', national_id: ''
  });

  // Calculate attendance statistics for a student
  const getStudentAttendanceStats = (studentId: string) => {
    const records = samsDb.getAttendance().filter(a => a.student_id === studentId);
    if (records.length === 0) {
      return { total: 0, present: 0, absent: 0, percentage: 100 };
    }
    const total = records.length;
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const percentage = Math.round((present / total) * 100);
    return { total, present, absent, percentage };
  };

  // Calculate fee status for a student
  const getStudentFeeStatus = (studentId: string) => {
    const payments = samsDb.getFees().filter(p => p.student_id === studentId);
    if (payments.length === 0) return { label: 'غير مسدد', isPaid: false, totalAmount: 0 };
    const paidSum = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return { label: `مسدد (${paidSum} ج.م)`, isPaid: true, totalAmount: paidSum };
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (errorText) {
      const timer = setTimeout(() => {
        setErrorText('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorText]);

  useEffect(() => {
    if (successText) {
      const timer = setTimeout(() => {
        setSuccessText('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successText]);

  const confirmDeleteClass = () => {
    if (classToDelete) {
      const res = samsDb.deleteClass(classToDelete.id);
      if (res.success) {
        setSuccessText(`تم حذف المجموعة "${classToDelete.name}" بنجاح!`);
        setClassToDelete(null);
        loadData();
      } else {
        setErrorText(res.error || 'فشل حذف المجموعة.');
        setClassToDelete(null);
      }
    }
  };

  const handleProcessAction = (text: string, onComplete: () => void) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingText(text);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        setProcessingProgress(progress);
        clearInterval(interval);
        
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingProgress(0);
          onComplete();
        }, 400);
      } else {
        setProcessingProgress(progress);
      }
    }, 150);
  };

  useSamsDbSync(() => {
    loadData();
  });

  const loadData = () => {
    setClasses(samsDb.getClasses());
    setStudents(samsDb.getStudents());
    setTeachers(samsDb.getTeachers());
    setSubjects(samsDb.getSubjects());
    setSchedule(samsDb.getCenterSchedule());
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!classForm.name) {
      setErrorText('يرجى تحديد اسم للمجموعة الدراسية.');
      return;
    }
    if (!classForm.schedule_days || classForm.schedule_days.trim() === '') {
      setErrorText('يرجى تحديد أيام المجموعة الدراسية.');
      return;
    }
    const daysArr = classForm.schedule_days.split('، ').filter(Boolean);
    const missingTimes = daysArr.some(day => !classForm.day_times[day] || classForm.day_times[day].trim() === '');
    if (missingTimes) {
      setErrorText('يرجى تحديد وقت المجموعة لكل يوم تم اختياره.');
      return;
    }
    
    if (!classForm.grade_level) {
      setErrorText('يرجى تحديد الصف الدراسي للمجموعة.');
      return;
    }

    const formatTime12 = (rawTime: string) => {
      if (!rawTime) return '--';
      const [h, m] = rawTime.split(':');
      const hInt = parseInt(h, 10);
      const ampm = hInt >= 12 ? 'م' : 'ص';
      let h12 = hInt % 12;
      if (h12 === 0) h12 = 12;
      return `${h12}:${m} ${ampm}`;
    };

    const timeToDaysMap: Record<string, string[]> = {};
    daysArr.forEach(day => {
      const rawTime = classForm.day_times[day] || '';
      const formattedT = formatTime12(rawTime);
      if (!timeToDaysMap[formattedT]) {
        timeToDaysMap[formattedT] = [];
      }
      timeToDaysMap[formattedT].push(day);
    });

    const formattedScheduleTime = Object.entries(timeToDaysMap).map(([t, days]) => {
      return `${days.join(' - ')} (${t})`;
    }).join(' | ');

    const newCls: ClassRoom = {
      id: `c-${Date.now()}`,
      name: classForm.name,
      schedule_days: classForm.schedule_days,
      schedule_time: formattedScheduleTime,
      capacity: 0,
      grade_level: classForm.grade_level,
      education_type: classForm.education_type || 'عام'
    };

    samsDb.addClass(newCls);
    setClassForm({
      name: '',
      schedule_days: '',
      schedule_time: '',
      day_times: {},
      grade_level: 'الأول الإعدادي',
      education_type: 'عام'
    });
    setUnifiedTime('');
    setShowAddClass(false);
    loadData();
  };

  // Dedicated Group Students Full View Render
  if (selectedClassForStudents) {
    const currentClassStudents = students.filter(s => s.class_id === selectedClassForStudents.id);
    
    // Filtered students based on search and filters
    const filteredGroupStudents = currentClassStudents.filter(student => {
      const searchLower = studentSearchTerm.trim().toLowerCase();
      const matchesSearch = !searchLower || (
        student.name.toLowerCase().includes(searchLower) ||
        student.registration_id.toLowerCase().includes(searchLower) ||
        (student.phone && student.phone.includes(searchLower)) ||
        (student.parent_phone && student.parent_phone.includes(searchLower)) ||
        (student.parent_name && student.parent_name.toLowerCase().includes(searchLower))
      );

      const matchesStatus = studentStatusFilter === 'all' || student.status === studentStatusFilter;

      const attStats = getStudentAttendanceStats(student.id);
      let matchesAttendance = true;
      if (attendanceFilter === 'excellent') {
        matchesAttendance = attStats.percentage >= 90;
      } else if (attendanceFilter === 'warning') {
        matchesAttendance = attStats.absent >= 3;
      }

      return matchesSearch && matchesStatus && matchesAttendance;
    });

    const totalStudents = currentClassStudents.length;
    const activeCount = currentClassStudents.filter(s => s.status === 'active').length;
    const warningAbsenceCount = currentClassStudents.filter(s => getStudentAttendanceStats(s.id).absent >= 3).length;
    
    const totalAttRecords = currentClassStudents.reduce((acc, s) => acc + getStudentAttendanceStats(s.id).total, 0);
    const totalPresentRecords = currentClassStudents.reduce((acc, s) => acc + getStudentAttendanceStats(s.id).present, 0);
    const groupAvgAttendance = totalAttRecords > 0 ? Math.round((totalPresentRecords / totalAttRecords) * 100) : 100;


    if (selectedStudentForReport) {
      return (
        <StudentFullReport
          student={selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
        />
      );
    }

    if (showPrintRosterModal) {
      return (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-slate-800 p-6 rounded-3xl" id="print_roster_dedicated_page" dir="rtl">

      {/* Global Processing Progress Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/40 rounded-2xl mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <RefreshCw className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">{processingText}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">يرجى الانتظار، جاري معالجة البيانات...</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
                  <span>{processingProgress}%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 gap-4 no-print">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPrintRosterModal(false)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer ml-2 flex items-center gap-1.5"
                title="رجوع"
              >
                 <ArrowRight className="w-5 h-5" /><span className="font-bold text-sm">رجوع</span>
              </button>
              <div className="p-2.5 bg-amber-100 text-amber-800 dark:text-amber-300 rounded-2xl">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-50 text-lg">معاينة وتصدير كشف المجموعة كـ PDF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">تنسيق طباعة رسمي بكافة بيانات طلاب المجموعة</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHeaderSettings(!showHeaderSettings)}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                  showHeaderSettings
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>تخصيص الشعار والترويسة 🎨</span>
                {showHeaderSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleProcessAction("جاري تجهيز التقرير للطباعة...", () => window.print())}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>طباعة الآن / حفظ كـ PDF</span>
              </button>
            </div>
          </div>
{/* Header & Logo Customization Panel (no-print) */}
                {showHeaderSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 font-sans no-print text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        إعدادات الترويسة وشعار السنتر المطبوع
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">التغييرات تحفظ تلقائياً لكافة التقارير</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Logo Section */}
                      <div className="space-y-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="block font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">1. شعار السنتر (Logo):</label>
                        <div className="flex items-center gap-3">
                          {printHeaderLogo ? (
                            <img src={printHeaderLogo} alt="شعار السنتر" className="w-12 h-12 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50" />
                          ) : (
                            <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-lg flex items-center justify-center font-bold text-amber-800 dark:text-amber-300 text-lg">
                              {printHeaderTitle ? printHeaderTitle.charAt(0) : 'س'}
                            </div>
                          )}
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>رفع شعار من جهازك</span>
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                            {printHeaderLogo && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintHeaderLogo('');
                                  localStorage.removeItem('sams_custom_app_logo_v2');
                                }}
                                className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline text-center"
                              >
                                إزالة الشعار
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Preset logos */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">أو اختر من الشعارات الجاهزة:</span>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const preset = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80';
                                setPrintHeaderLogo(preset);
                                localStorage.setItem('sams_custom_app_logo_v2', preset);
                              }}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700"
                            >
                              🎓 أكاديمي
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const preset = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=120&auto=format&fit=crop&q=80';
                                setPrintHeaderLogo(preset);
                                localStorage.setItem('sams_custom_app_logo_v2', preset);
                              }}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700"
                            >
                              📚 كتب وتفوق
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const preset = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&auto=format&fit=crop&q=80';
                                setPrintHeaderLogo(preset);
                                localStorage.setItem('sams_custom_app_logo_v2', preset);
                              }}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700"
                            >
                              🖋️ قلم وقراءة
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Header Titles */}
                      <div className="space-y-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 md:col-span-2">
                        <label className="block font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">2. النصوص والترويسة المطبوعة:</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">عنوان السنتر الرئيسي:</span>
                            <input
                              type="text"
                              value={printHeaderTitle}
                              onChange={(e) => updatePrintTitle(e.target.value)}
                              placeholder="مثال: سنتر التفوق للتعليم"
                              className="w-full min-w-[200px] max-w-full flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">الوصف أو النص الفرعي:</span>
                            <input
                              type="text"
                              value={printHeaderSubtitle}
                              onChange={(e) => updatePrintSubtitle(e.target.value)}
                              placeholder="مثال: سجل كشوفات المجموعات التعليمية"
                              className="w-full min-w-[200px] max-w-full flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                          <div className="md:col-span-2">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">بيانات التواصل والفرع:</span>
                            <input
                              type="text"
                              value={printHeaderContact}
                              onChange={(e) => updatePrintContact(e.target.value)}
                              placeholder="مثال: هاتف: 01000000000 - الفرع الرئيسي"
                              className="w-full min-w-[200px] max-w-full flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">محاذاة الترويسة:</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => updateLogoAlign('right')}
                                className={`flex-1 py-1.5 rounded-md font-bold text-[10px] border ${
                                  printLogoAlign === 'right' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                يمين
                              </button>
                              <button
                                type="button"
                                onClick={() => updateLogoAlign('center')}
                                className={`flex-1 py-1.5 rounded-md font-bold text-[10px] border ${
                                  printLogoAlign === 'center' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                وسط
                              </button>
                              <button
                                type="button"
                                onClick={() => updateLogoAlign('left')}
                                className={`flex-1 py-1.5 rounded-md font-bold text-[10px] border ${
                                  printLogoAlign === 'left' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                يسار
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PRINTABLE CONTAINER AREA */}
                <div id="printable-group-roster" className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {/* Dynamic Header section */}
                  <div
                    className={`flex items-center justify-between border-b-2 border-slate-800 pb-4 ${
                      printLogoAlign === 'center'
                        ? 'flex-col text-center gap-3'
                        : printLogoAlign === 'left'
                        ? 'flex-row-reverse text-right'
                        : 'flex-row text-right'
                    }`}
                  >
                    <div className={`flex items-center gap-3.5 ${printLogoAlign === 'center' ? 'flex-col text-center' : ''}`}>
                      {printHeaderLogo ? (
                        <img src={printHeaderLogo} alt="شعار السنتر" className="w-16 h-16 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-600 rounded-xl flex items-center justify-center text-amber-800 dark:text-amber-300 font-extrabold text-2xl shrink-0">
                          {printHeaderTitle ? printHeaderTitle.charAt(0) : 'س'}
                        </div>
                      )}
                      <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">{printHeaderTitle || 'سنتر التعليم والتفوق'}</h1>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">{printHeaderSubtitle}</p>
                        {printHeaderContact && <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">{printHeaderContact}</p>}
                      </div>
                    </div>

                    <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 dark:border-slate-600 rounded-xl shrink-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">كشف طلاب رسمي</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>

                  {/* Group details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-sans">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">اسم المجموعة:</span>
                      <strong className="text-slate-900 dark:text-slate-50 font-bold">{selectedClassForStudents.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">الصف الدراسي:</span>
                      <strong className="text-slate-900 dark:text-slate-50 font-bold">{selectedClassForStudents.grade_level}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">المواعيد والجدول:</span>
                      <strong className="text-slate-900 dark:text-slate-50 font-bold">{formatScheduleDisplay(selectedClassForStudents.schedule_time, selectedClassForStudents.schedule_days)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">عدد الطلاب:</span>
                      <strong className="text-amber-700 dark:text-amber-300 font-bold">{filteredGroupStudents.length} طالب</strong>
                    </div>
                  </div>

                  {/* Students table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-extrabold border-b border-slate-300 dark:border-slate-600 dark:border-slate-600">
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-center w-10">#</th>
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 w-24">رقم القيد</th>
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600">اسم الطالب الرباعي</th>
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 w-28">هاتف ولي الأمر</th>
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 w-20 text-center">الحضور %</th>
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 w-24 text-center">الرسوم</th>
                          <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 w-32 text-center">ملاحظات / التوقيع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGroupStudents.map((st, idx) => {
                          const att = getStudentAttendanceStats(st.id);
                          const fee = getStudentFeeStatus(st.id);
                          return (
                            <tr key={st.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-sans">
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-center font-bold text-slate-700 dark:text-slate-200">{idx + 1}</td>
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-mono text-slate-800 dark:text-slate-100 dark:text-slate-100">{st.registration_id}</td>
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-bold text-slate-900 dark:text-slate-50">{st.name}</td>
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-mono text-slate-700 dark:text-slate-200" dir="ltr">{st.parent_phone || st.phone || '-'}</td>
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-center font-bold">{att.percentage}%</td>
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-center text-[11px] font-bold">
                                {fee.isPaid ? 'مسدد' : 'غير مسدد'}
                              </td>
                              <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600"></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer signature */}
                  <div className="pt-6 flex justify-between items-center text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 font-sans">
                    <div>توقيع إشراف السنتر: ....................................</div>
                    <div>اعتماد إدارة اللغة العربية: ....................................</div>
                  </div>
                </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in" id="group_students_dedicated_page">

      {/* Global Processing Progress Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/40 rounded-2xl mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <RefreshCw className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">{processingText}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">يرجى الانتظار، جاري معالجة البيانات...</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
                  <span>{processingProgress}%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Top Navigation & Group Header */}
        <div className="bg-gradient-to-r from-[#0D5C8C] via-[#126b9e] to-[#0A4B73] text-white p-6 rounded-3xl shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedClassForStudents(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shrink-0 border border-white/10"
                title="الرجوع إلى قائمة المجموعات"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرجوع للمجموعات</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                    صفحة طلاب المجموعة المخصصة
                  </span>
                  <span className="text-xs text-sky-200 font-sans">
                    {selectedClassForStudents.grade_level}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold mt-1 flex items-center gap-2">
                  <GraduationCap className="w-7 h-7 text-amber-300" />
                  <span>طلاب مجموعة: {selectedClassForStudents.name}</span>
                </h2>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => {
                  setNewStudentForm({
                    name: '',
                    phone: '',
                    parent_name: '',
                    parent_phone: '',
                    grade_level: selectedClassForStudents.grade_level || 'الأول الإعدادي',
                    birth_date: '2016-01-01',
                    status: 'active',
                    national_id: ''
                  });
                  setShowAddStudentModal(true);
                }}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-1 md:flex-none justify-center"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إضافة طالب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const defaultBroadcastMsg = `السلام عليكم ورحمة الله وبركاته،
أولياء أمور الطلاب الكرام بمجموعة (${selectedClassForStudents.name}) - سنتر اللغة العربية،
تحية طيبة وبعد،

نود إحاطتكم بجدول مواعيد المجموعة (${formatScheduleDisplay(selectedClassForStudents.schedule_time, selectedClassForStudents.schedule_days)}). نرجو التكرم بحث الطلاب على الانضباط والمتابعة المستمرة.

شاكرين لكم حسن التعاون.`;
                  setGroupWhatsAppMsg(defaultBroadcastMsg);
                  setShowGroupWhatsAppModal(true);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-1 md:flex-none justify-center"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current text-white" />
                <span>تنبيه واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintRosterModal(true)}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-1 md:flex-none justify-center"
                title="طباعة كشف طلاب المجموعة وتصديره كـ PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-950" />
                <span>طباعة الكشف</span>
              </button>

              <button
                type="button"
                onClick={() => setShowArchiveModal(true)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] rounded-lg border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer flex-1 md:flex-none justify-center"
                title="عرض الأرشيف والطلاب المؤرشفين"
              >
                <Archive className="w-3.5 h-3.5 text-amber-300" />
                <span>الأرشيف ({samsDb.getArchivedStudents().length})</span>
              </button>
            </div>
          </div>

          {/* Group Metadata Footer */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-white/10 font-sans">
            <div className="flex items-center gap-1.5 text-sky-100">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>المواعيد: <strong>{formatScheduleDisplay(selectedClassForStudents.schedule_time, selectedClassForStudents.schedule_days)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-100">
              <Users className="w-4 h-4 text-emerald-300" />
              <span>إجمالي المقيدين: <strong>{totalStudents} طالب</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-100">
              <CheckCircle className="w-4 h-4 text-sky-300" />
              <span>متوسط نسبة الحضور: <strong>{groupAvgAttendance}%</strong></span>
            </div>
          </div>
        </div>

        {/* Alerts & Messages */}
        {errorText && (
          <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 text-[#C0152A] rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#E8192C] shrink-0" />
            <span className="font-semibold">{errorText}</span>
          </div>
        )}
        {successText && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successText}</span>
          </div>
        )}

        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">إجمالي طلاب المجموعة</div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center justify-between">
              <span>{totalStudents}</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-normal">طالب</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">الطلاب النشطون بالحضور</div>
            <div className="text-2xl font-black text-emerald-600 flex items-center justify-between">
              <span>{activeCount}</span>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">{Math.round((activeCount / (totalStudents || 1)) * 100)}%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">متوسط حضور المجموعة</div>
            <div className="text-2xl font-black text-sky-700 dark:text-sky-300 flex items-center justify-between">
              <span>{groupAvgAttendance}%</span>
              <span className="text-xs bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md font-bold">نسبة انضباط</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">طلاب بإنذار غياب (≥3 غيابات)</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>{warningAbsenceCount}</span>
              {warningAbsenceCount > 0 ? (
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-black animate-pulse">تنبيه ⚠️</span>
              ) : (
                <span className="text-xs bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">لا يوجد ✨</span>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row flex-wrap items-center justify-between gap-4">
          <div className="relative w-full md:w-96 max-w-full min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب، رقم القيد، أو هاتف ولي الأمر..."
              className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 pr-9 pl-3 py-2.5 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>تصفية النتائج:</span>
            </div>

            <select
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value as any)}
              className="text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl focus:outline-hidden focus:border-[#0D5C8C] bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="all">جميع الحالات (نشط وموقوف)</option>
              <option value="active">الطلاب النشطون فقط</option>
              <option value="inactive">الطلاب الموقوفون فقط</option>
            </select>

            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl focus:outline-hidden focus:border-[#0D5C8C] bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="all">جميع معدلات الحضور</option>
              <option value="excellent">انضباط ممتاز (≥90%)</option>
              <option value="warning">إنذار غياب متكرر (≥3 غيابات) ⚠️</option>
            </select>
          </div>
        </div>

        {/* Detailed Student Roster Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0D5C8C]" />
              <span>كشف طلاب المجموعة التفصيلي والبيانات الكاملة ({filteredGroupStudents.length} طالب)</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              رقم القيد، التواصل، نسبة الحضور، المصروفات والتقرير الشامل
            </span>
          </div>

          {filteredGroupStudents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">لا يوجد طلاب مطابقون لمعايير البحث والفلترة بهذه المجموعة.</p>
              <p className="text-slate-400 text-xs font-sans">يمكنك إضافة طالب جديد مباشرة إلى هذه المجموعة باستخدام الزر بالأعلى.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead className="bg-slate-100/70 text-slate-700 dark:text-slate-200 text-xs font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">رقم القيد</th>
                    <th className="p-3.5">اسم الطالب</th>
                    <th className="p-3.5">هاتف الطالب وولي الأمر</th>
                    <th className="p-3.5 text-center">إحصائيات الحضور %</th>
                    <th className="p-3.5 text-center">الموقف المالي والرسوم</th>
                    <th className="p-3.5 text-center">حالة القيد</th>
                    <th className="p-3.5 text-center">العمليات والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700 dark:text-slate-200">
                  {filteredGroupStudents.map((student) => {
                    const attStats = getStudentAttendanceStats(student.id);
                    const feeStats = getStudentFeeStatus(student.id);
                    const parentPhoneClean = (student.parent_phone || student.phone || '').replace(/[^0-9]/g, '');
                    const formattedParentPhone = parentPhoneClean.startsWith('0') ? '2' + parentPhoneClean : parentPhoneClean;

                    return (
                      <tr key={student.id} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Registration ID */}
                        <td className="p-3.5 font-bold font-mono text-[#0D5C8C]">
                          {student.registration_id}
                        </td>

                        {/* Student Name */}
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900 dark:text-slate-50 text-sm flex items-center gap-2">
                            <span>{student.name}</span>
                            {attStats.absent >= 3 && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-700 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                غياب متكرر ({attStats.absent})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                            الصف: {student.grade_level || selectedClassForStudents.grade_level}
                          </div>
                        </td>

                        {/* Phone Contacts */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100 dark:text-slate-100 font-bold">
                              <span>ولي الأمر: {student.parent_name || 'غير مدخل'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono dir-ltr justify-end">
                              {student.parent_phone ? (
                                <a
                                  href={`https://wa.me/${formattedParentPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer"
                                  title="محادثة واتساب ولي الأمر"
                                >
                                  <MessageCircle className="w-3 h-3 fill-current" />
                                  <span>{student.parent_phone}</span>
                                </a>
                              ) : (
                                <span>لا يوجد هاتف</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Attendance Progress */}
                        <td className="p-3.5 text-center min-w-[150px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-600 dark:text-slate-300">حضور: {attStats.present} | غياب: {attStats.absent}</span>
                              <span className={attStats.percentage >= 90 ? 'text-emerald-600 font-black' : attStats.percentage >= 75 ? 'text-amber-600 font-bold' : 'text-rose-600 font-black'}>
                                {attStats.percentage}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  attStats.percentage >= 90 ? 'bg-emerald-500' : attStats.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${attStats.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Fee Status */}
                        <td className="p-3.5 text-center">
                          {feeStats.isPaid ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 text-xs font-bold px-2.5 py-1 rounded-xl">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              {feeStats.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 text-xs font-bold px-2.5 py-1 rounded-xl">
                              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              غير مسدد
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${
                            student.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {student.status === 'active' ? 'نشط بالسنتر' : 'موقوف'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Full Report */}
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForReport(student)}
                              className="p-2 bg-sky-50 dark:bg-sky-900/40 hover:bg-sky-100 text-[#0D5C8C] rounded-xl font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer border border-sky-200"
                              title="عرض كشف وتاريخ الطالب الكامل"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0D5C8C]" />
                              <span>كشف كامل</span>
                            </button>

                            {/* WhatsApp Direct */}
                            {student.parent_phone && (
                              <a
                                href={`https://wa.me/${formattedParentPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب/ة: ${student.name}، تحية طيبة وبعد من سنتر اللغة العربية...`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl transition-transform active:scale-95 cursor-pointer border border-emerald-200 dark:border-emerald-700"
                                title="تواصل مباشر عبر الواتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              </a>
                            )}

                            {/* Transfer Group */}
                            <button
                              type="button"
                              onClick={() => {
                                setTransferStudent(student);
                                setTargetClassIdForTransfer('');
                              }}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-transform active:scale-95 cursor-pointer"
                              title="نقل الطالب إلى مجموعة أخرى"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Student */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(student);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2 bg-amber-50 dark:bg-amber-900/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-xl transition-transform active:scale-95 cursor-pointer border border-amber-200 dark:border-amber-700"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Archive Student */}
                            <button
                              type="button"
                              onClick={() => {
                                samsDb.softDeleteStudent(student.id);
                                loadData();
                                setSuccessText(`تم نقل الطالب (${student.name}) إلى الأرشيف بنجاح.`);
                              }}
                              className="p-2 bg-amber-50 dark:bg-amber-900/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer border border-amber-200 dark:border-amber-700"
                              title="نقل الطالب إلى الأرشيف"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                              <span>أرشفة</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        

        {/* Add Student directly to this Group Modal */}
        <AnimatePresence>
          {showAddStudentModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-5 bg-[#0D5C8C] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-300" />
                    <h3 className="font-extrabold text-base">تسجيل طالب جديد بمجموعة: {selectedClassForStudents.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newStudentForm.name) return;
                    const generatedNationalId = "30" + Math.floor(100000000000 + Math.random() * 900000000000);
                    const res = samsDb.addStudent({
                      name: newStudentForm.name,
                      national_id: generatedNationalId,
                      class_id: selectedClassForStudents.id,
                      grade_level: selectedClassForStudents.grade_level || newStudentForm.grade_level,
                      education_type: selectedClassForStudents.education_type || 'عام',
                      birth_date: newStudentForm.birth_date,
                      phone: newStudentForm.phone,
                      parent_name: newStudentForm.parent_name,
                      parent_phone: newStudentForm.parent_phone,
                      status: newStudentForm.status
                    });
                    if (res.success && res.student) {
                      setSuccessText(`تم إضافة الطالب (${res.student.name}) برقم قيد (${res.student.registration_id}) بنجاح!`);
                      setShowAddStudentModal(false);
                      loadData();
                    } else {
                      setErrorText(res.error || 'حدث خطأ أثناء إضافة الطالب.');
                    }
                  }}
                  className="p-6 space-y-4 text-right"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">اسم الطالب الرباعي *</label>
                    <input
                      type="text"
                      required
                      value={newStudentForm.name}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
                      placeholder="أدخل اسم الطالب..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">هاتف الطالب</label>
                      <input
                        type="text"
                        value={newStudentForm.phone}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                        className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">هاتف ولي الأمر *</label>
                      <input
                        type="text"
                        required
                        value={newStudentForm.parent_phone}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_phone: e.target.value })}
                        className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">اسم ولي الأمر</label>
                    <input
                      type="text"
                      value={newStudentForm.parent_name}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parent_name: e.target.value })}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
                      placeholder="اسم ولي الأمر..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowAddStudentModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      حفظ وإضافة الطالب
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Student Modal */}
        <AnimatePresence>
          {editingStudent && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-white" />
                    <h3 className="font-extrabold text-base">تعديل بيانات الطالب: {editingStudent.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingStudent) return;
                    const res = samsDb.updateStudent(editingStudent);
                    if (res.success) {
                      setSuccessText(`تم تعديل بيانات الطالب (${editingStudent.name}) بنجاح.`);
                      setEditingStudent(null);
                      loadData();
                    } else {
                      setErrorText(res.error || 'فشل تعديل البيانات.');
                    }
                  }}
                  className="p-6 space-y-4 text-right"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">اسم الطالب *</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-amber-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">هاتف الطالب</label>
                      <input
                        type="text"
                        value={editingStudent.phone || ''}
                        onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                        className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">هاتف ولي الأمر</label>
                      <input
                        type="text"
                        value={editingStudent.parent_phone || ''}
                        onChange={(e) => setEditingStudent({ ...editingStudent, parent_phone: e.target.value })}
                        className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">اسم ولي الأمر</label>
                    <input
                      type="text"
                      value={editingStudent.parent_name || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parent_name: e.target.value })}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">حالة الطالب</label>
                    <select
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-amber-600 bg-white dark:bg-slate-800"
                    >
                      <option value="active">نشط بالسنتر</option>
                      <option value="inactive">موقوف</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      حفظ التغييرات
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Transfer Group Modal */}
        <AnimatePresence>
          {transferStudent && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-5 bg-sky-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-white" />
                    <h3 className="font-extrabold text-base">نقل الطالب لـ مجموعة أخرى</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferStudent(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4 text-right">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                    اختر المجموعة الدراسية الجديدة لنقل الطالب <strong className="text-slate-900 dark:text-slate-50 font-extrabold">({transferStudent.name})</strong> إليها:
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">المجموعة الجديدة المستهدفة *</label>
                    <select
                      value={targetClassIdForTransfer}
                      onChange={(e) => setTargetClassIdForTransfer(e.target.value)}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-hidden focus:border-sky-600 bg-white dark:bg-slate-800"
                    >
                      <option value="">-- اختر مجموعة من القائمة --</option>
                      {classes.filter(c => c.id !== selectedClassForStudents.id).map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.grade_level}) - {cls.schedule_days}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTransferStudent(null)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      disabled={!targetClassIdForTransfer}
                      onClick={() => {
                        const updated = { ...transferStudent, class_id: targetClassIdForTransfer };
                        const res = samsDb.updateStudent(updated);
                        if (res.success) {
                          const targetGroup = classes.find(c => c.id === targetClassIdForTransfer);
                          setSuccessText(`تم نقل الطالب (${transferStudent.name}) إلى مجموعة (${targetGroup?.name || ''}) بنجاح.`);
                          setTransferStudent(null);
                          loadData();
                        }
                      }}
                      className="px-5 py-2 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      تأكيد نقل المجموعة
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Broadcast WhatsApp Modal */}
        <AnimatePresence>
          {showGroupWhatsAppModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-5 bg-emerald-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-white fill-current" />
                    <h3 className="font-extrabold text-base">إرسال رسالة واتساب جماعية لأولياء أمور المجموعة</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGroupWhatsAppModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4 text-right">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                    سيتم توجيه الرسالة لأولياء أمور كافة الطلاب بالمجموعة ({currentClassStudents.length} طالب):
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">نص الرسالة الجماعية:</label>
                    <textarea
                      rows={6}
                      value={groupWhatsAppMsg}
                      onChange={(e) => setGroupWhatsAppMsg(e.target.value)}
                      className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-3 rounded-2xl focus:outline-hidden focus:border-emerald-600 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowGroupWhatsAppModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const firstStudentWithPhone = currentClassStudents.find(s => s.parent_phone || s.phone);
                        if (firstStudentWithPhone) {
                          const cleanP = (firstStudentWithPhone.parent_phone || firstStudentWithPhone.phone || '').replace(/[^0-9]/g, '');
                          const formatted = cleanP.startsWith('0') ? '2' + cleanP : cleanP;
                          window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(groupWhatsAppMsg)}`, '_blank');
                          setSuccessText(`تم فتح الواتساب لبدء المراسلة الجماعية لأولياء الأمور.`);
                          setShowGroupWhatsAppModal(false);
                        } else {
                          setErrorText('لا توجد أرقام هواتف مسجلة لأولياء أمور هذه المجموعة.');
                        }
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>فتح محادثات الواتساب 📱</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Archived Students Modal */}
        <AnimatePresence>
          {showArchiveModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-3xl w-full p-6 text-right space-y-5 max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-800 dark:text-amber-300 rounded-2xl">
                      <Archive className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-50 text-base">أرشيف الطلاب المؤرشفين</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">إدارة واستعادة أو حذف بيانات الطلاب الموجودين في الأرشيف</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowArchiveModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={archivedSearchTerm}
                    onChange={(e) => setArchivedSearchTerm(e.target.value)}
                    placeholder="بحث في الطلاب المؤرشفين بالاسم أو رقم القيد..."
                    className="w-full min-w-[200px] max-w-full flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:border-amber-600 font-sans"
                  />
                </div>

                {/* Archived list */}
                <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                  {(() => {
                    const archivedList = samsDb.getArchivedStudents().filter(st => 
                      !archivedSearchTerm || 
                      st.name.includes(archivedSearchTerm) || 
                      st.registration_id.includes(archivedSearchTerm)
                    );

                    if (archivedList.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400 space-y-2">
                          <Archive className="w-10 h-10 mx-auto text-slate-300" />
                          <p className="text-xs font-bold">لا يوجد طلاب في الأرشيف حالياً</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {archivedList.map(st => (
                          <div key={st.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-50 text-xs">{st.name}</span>
                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold">
                                  {st.registration_id}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-3">
                                <span>الصف: {st.grade_level}</span>
                                <span>الهاتف: {st.phone || st.parent_phone || '-'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Restore */}
                              <button
                                type="button"
                                onClick={() => {
                                  samsDb.restoreStudent(st.id);
                                  loadData();
                                  setSuccessText(`تمت استعادة الطالب (${st.name}) بنجاح وإعادته للقائمة النشطة.`);
                                }}
                                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                <span>استعادة الطالب</span>
                              </button>

                              {/* Permanent Delete */}
                              <button
                                type="button"
                                onClick={() => setArchivedStudentToPermanentDelete(st)}
                                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                <span>حذف نهائي</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Permanent Delete Confirmation Modal */}
        <AnimatePresence>
          {archivedStudentToPermanentDelete && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-md w-full p-6 text-right space-y-4"
              >
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm">تأكيد الحذف النهائي من النظام</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">حذف دائم لا يمكن التراجع عنه بأي حال</p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 dark:border-rose-800">
                  هل أنت متأكد تماماً من الحذف النهائي للطالب <strong className="text-rose-700 dark:text-rose-300">"{archivedStudentToPermanentDelete.name}"</strong>؟ سيتم مسح ملفه وكافة سجلاته نهائياً من قاعدة البيانات.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setArchivedStudentToPermanentDelete(null)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleProcessAction("جاري الحذف النهائي...", () => {
                        samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                        setArchivedStudentToPermanentDelete(null);
                        loadData();
                        setSuccessText('تم مسح بيانات الطالب نهائياً من قاعدة البيانات.');
                      });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    تأكيد الحذف النهائي
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div className="space-y-6" id="sams_classes_module">

      {/* Global Processing Progress Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/40 rounded-2xl mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <RefreshCw className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">{processingText}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">يرجى الانتظار، جاري معالجة البيانات...</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
                  <span>{processingProgress}%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
            
            إدارة المجموعات والمقررات والجداول بالسنتر
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تنسيق المجموعات الدراسية وسعتها الاستيعابية ومواعيدها</p>
        </div>
        <button
          onClick={() => {
            setShowAddClass(!showAddClass);
            setErrorText('');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddClass ? 'إغلاق النموذج' : 'تأسيس مجموعة جديدة'}</span>
        </button>
      </div>

      {/* Error text alert */}
      {errorText && (
        <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 text-[#C0152A] rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#E8192C] shrink-0" />
          <span className="font-semibold">{errorText}</span>
        </div>
      )}

      {/* Success text alert */}
      {successText && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successText}</span>
        </div>
      )}

      {/* Initialize classroom form */}
      {showAddClass && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-slide-up">
          <h3 className="font-bold text-[#0D5C8C] text-sm mb-4 border-b border-gray-50 pb-2">تأسيس مجموعة دراسية جديدة</h3>
          <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">اسم المجموعة الدراسية *</label>
              <input
                type="text"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right"
                placeholder="اسم المجموعة"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">أيام المجموعة *</label>
              <div className="flex flex-wrap gap-1.5">
                {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
                  <label key={day} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-[11px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-[#0D5C8C]"
                      checked={(classForm.schedule_days || '').includes(day)}
                      onChange={(e) => {
                        const currentDays = classForm.schedule_days ? classForm.schedule_days.split('، ').filter(Boolean) : [];
                        let updatedDays: string[];
                        const newTimes = { ...classForm.day_times };

                        if (e.target.checked) {
                          updatedDays = [...currentDays, day];
                          if (unifiedTime) {
                            newTimes[day] = unifiedTime;
                          }
                        } else {
                          updatedDays = currentDays.filter(d => d !== day);
                          delete newTimes[day];
                        }

                        setClassForm({ 
                          ...classForm, 
                          schedule_days: updatedDays.join('، '),
                          day_times: newTimes 
                        });
                      }}
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">أوقات المجموعة للأيام المحددة *</label>
              {(() => {
                const selectedDays = classForm.schedule_days ? classForm.schedule_days.split('، ').filter(Boolean) : [];
                if (selectedDays.length === 0) {
                  return (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      الرجاء تحديد أيام المجموعة أولاً...
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    {selectedDays.length >= 1 && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-sky-50/90 dark:bg-sky-950/50 rounded-xl border border-sky-200/80 dark:border-sky-800/60 mb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-200">
                          <Zap className="w-4 h-4 text-[#0D5C8C] dark:text-sky-400 shrink-0" />
                          <span>تحديد موعد موحد لجميع الأيام المحددة:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={unifiedTime}
                            onChange={(e) => {
                              const timeVal = e.target.value;
                              setUnifiedTime(timeVal);
                              if (timeVal) {
                                const newTimes = { ...classForm.day_times };
                                selectedDays.forEach(d => {
                                  newTimes[d] = timeVal;
                                });
                                setClassForm(prev => ({ ...prev, day_times: newTimes }));
                              }
                            }}
                            className="text-xs font-sans border border-sky-300 dark:border-sky-700 px-2.5 py-1 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right bg-white dark:bg-slate-900 font-bold text-sky-900 dark:text-sky-100 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (unifiedTime) {
                                const newTimes = { ...classForm.day_times };
                                selectedDays.forEach(d => {
                                  newTimes[d] = unifiedTime;
                                });
                                setClassForm(prev => ({ ...prev, day_times: newTimes }));
                              }
                            }}
                            className="px-3 py-1 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            تطبيق على الكل
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedDays.map(day => (
                      <div key={day} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="w-16 text-xs font-bold text-slate-700 dark:text-slate-200">{day}</span>
                        <input
                          type="time"
                          value={classForm.day_times?.[day] || ''}
                          onChange={(e) => {
                            setClassForm(prev => ({
                              ...prev,
                              day_times: {
                                ...prev.day_times,
                                [day]: e.target.value
                              }
                            }));
                          }}
                          className="flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right bg-white dark:bg-slate-900"
                          required
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">الصف الدراسي *</label>
              <select
                value={classForm.grade_level}
                onChange={(e) => setClassForm({ ...classForm, grade_level: e.target.value })}
                className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right bg-white dark:bg-slate-800"
                required
              >
                <option value="الأول الإعدادي">الأول الإعدادي</option>
                <option value="الثاني الإعدادي">الثاني الإعدادي</option>
                <option value="الثالث الإعدادي">الثالث الإعدادي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">نوع التعليم *</label>
              <select
                value={classForm.education_type}
                onChange={(e) => setClassForm({ ...classForm, education_type: e.target.value as 'عام' | 'أزهر' })}
                className="w-full min-w-[200px] max-w-full flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right bg-white dark:bg-slate-800 font-bold"
                required
              >
                <option value="عام">عام</option>
                <option value="أزهر">أزهر</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 border-t border-slate-50 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowAddClass(false)}
                className="px-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold shrink-0 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
              >
                تأسيس المجموعة الدراسية
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Class list Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          
          const currentSubjects = subjects.filter(s => s.class_id === cls.id);
          const totalHours = currentSubjects.reduce((sum, item) => sum + item.weekly_hours, 0);

          return (
            <div key={cls.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4" id={`classroom_card_${cls.id}`}>
              
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm">{cls.name}</h3>
                  <button
                    onClick={() => setClassToDelete(cls)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded transition-all cursor-pointer"
                    title="حذف المجموعة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold font-sans">{cls.grade_level}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-sans border ${
                    (cls.education_type || 'عام') === 'أزهر'
                      ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {(cls.education_type || 'عام') === 'أزهر' ? 'أزهر' : 'عام'}
                  </span>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-2.5 text-xs">
                
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    مواعيد المجموعة
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">{cls.schedule_days ? formatScheduleDisplay(cls.schedule_time, cls.schedule_days) : 'ـ لم تحدد بعد ـ'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-sans">
                    <User className="w-4 h-4 text-slate-400" />
                    عدد الطلاب
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">{students.filter(s => s.class_id === cls.id).length} طالب</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-sans">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    المحاضرات والمقررات
                  </span>
                  <span className="font-bold text-[#0D5C8C]">{currentSubjects.length} مقررات ({totalHours} ساعة/أسبوع)</span>
                </div>

              </div>

              {/* Subjects in that group list display */}
              <div className="pt-3 border-t border-slate-50 dark:border-slate-800 space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">قائمة المواد الدراسية النشطة بالمجموعة:</p>
                {currentSubjects.length === 0 ? (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">يتم تدريس المحاضرات الأساسية حالياً.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {currentSubjects.map(sub => (
                      <span key={sub.id} className="text-[10px] bg-[#0D5C8C]/5 text-[#0D5C8C] border border-[#0D5C8C]/10 px-2 py-0.5 rounded font-medium">
                        {sub.name} ({sub.weekly_hours}س)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dedicated Group Students Page Trigger Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassForStudents(cls);
                    setStudentSearchTerm('');
                    setStudentStatusFilter('all');
                    setAttendanceFilter('all');
                  }}
                  className="w-full py-2.5 px-4 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center justify-between gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-200" />
                    <span>عرض طلاب المجموعة</span>
                  </div>
                  <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-lg font-black font-sans">
                    {students.filter(s => s.class_id === cls.id).length} طالب
                  </span>
                </button>
              </div>

            </div>
          );
        })}
      </div>


      {/* Dynamic Week Class Schedule */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm flex items-center gap-2">
            أوقات المحاضرات وجدول التوزيع اليومي الأسبوعي الأساسي للمجموعات بالسنتر
          </h3>
          {!isEditingSchedule ? (
            <button onClick={() => { setIsEditingSchedule(true); setEditingSchedule(schedule ? JSON.parse(JSON.stringify(schedule)) : null); }} className="text-xs bg-[#0D5C8C] text-white px-3 py-1.5 rounded-lg">تعديل الجدول</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditingSchedule(false)} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg">إلغاء</button>
              <button onClick={() => { if (editingSchedule) { samsDb.saveCenterSchedule(editingSchedule); setSchedule(editingSchedule); setIsEditingSchedule(false); } }} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"><Check className="w-3 h-3"/> حفظ</button>
            </div>
          )}
        </div>
        
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          يتكون الأسبوع الدراسي من أيام وفترات يمكن تخصيصها.
        </p>

        {(isEditingSchedule && editingSchedule) || (!isEditingSchedule && schedule) ? (
          <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl mt-2 text-xxs sm:text-xs">
            <table className="min-w-full text-right border-collapse" dir="rtl">
              <thead className="bg-[#0D5C8C] text-white">
                <tr>
                  <th className="p-3 w-32 border-b border-[#0A4B73]">اليوم</th>
                  {(isEditingSchedule ? editingSchedule : schedule)?.periods?.map(period => (
                    <th key={period.id} className="p-2 border-r border-[#0A4B73] border-b">
                      {isEditingSchedule ? (
                        <div className="flex flex-col gap-1 items-start">
                          <input type="text" value={period.name} onChange={(e) => {
                            const newSched = {...editingSchedule} as any;
                            const p = newSched.periods.find((x: any) => x.id === period.id);
                            if (p) p.name = e.target.value;
                            setEditingSchedule(newSched);
                          }} className="text-black px-1 py-0.5 rounded text-xs w-full" placeholder="اسم الفترة" />
                          <input type="text" value={period.time} onChange={(e) => {
                            const newSched = {...editingSchedule} as any;
                            const p = newSched.periods.find((x: any) => x.id === period.id);
                            if (p) p.time = e.target.value;
                            setEditingSchedule(newSched);
                          }} className="text-black px-1 py-0.5 rounded text-[10px] w-full mt-1" placeholder="الوقت" />
                          <label className="flex items-center gap-1 text-[10px] mt-1"><input type="checkbox" checked={period.isBreak} onChange={(e) => {
                            const newSched = {...editingSchedule} as any;
                            const p = newSched.periods.find((x: any) => x.id === period.id);
                            if (p) p.isBreak = e.target.checked;
                            setEditingSchedule(newSched);
                          }} /> استراحة؟</label>
                        </div>
                      ) : (
                        <div className="text-center">{period.name} <br/><span className="text-[10px] opacity-80">({period.time})</span></div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans text-slate-700 dark:text-slate-200">
                {(isEditingSchedule ? editingSchedule : schedule)?.days?.map(day => (
                  <tr key={day.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold bg-slate-50 dark:bg-slate-900/50 border-l border-gray-100 dark:border-gray-700">
                      {isEditingSchedule ? (
                        <input type="text" value={day.name} onChange={(e) => {
                          const newSched = {...editingSchedule} as any;
                          const d = newSched.days.find((x: any) => x.id === day.id);
                          if (d) d.name = e.target.value;
                          setEditingSchedule(newSched);
                        }} className="px-1 py-0.5 border rounded w-full" />
                      ) : (
                        day.name
                      )}
                    </td>
                    {(isEditingSchedule ? editingSchedule : schedule)?.periods?.map(period => {
                      const entryKey = `${day.id}_${period.id}`;
                      const currentSchedule = isEditingSchedule ? editingSchedule : schedule;
                      const currentSubject = currentSchedule?.entries?.[entryKey] || '';
                      
                      return (
                        <td key={period.id} className={`p-3 border-r border-gray-100 ${period.isBreak ? 'bg-slate-50/50 text-slate-400' : ''}`}>
                          {isEditingSchedule && !period.isBreak ? (
                            <div className="flex flex-col gap-1">
                              <input type="text" value={currentSubject.includes('||') ? currentSubject.split('||')[0] : currentSubject} onChange={(e) => {
                                 const newSched = JSON.parse(JSON.stringify(editingSchedule));
                                 if (!newSched.entries) newSched.entries = {};
                                 const grade = currentSubject.includes('||') ? currentSubject.split('||')[1] : '';
                                 newSched.entries[entryKey] = `${e.target.value}||${grade}`;
                                 setEditingSchedule(newSched);
                              }} className="px-2 py-1 border rounded w-full text-xs" placeholder="اسم المجموعة" />
                              <input type="text" value={currentSubject.includes('||') ? currentSubject.split('||')[1] || '' : ''} onChange={(e) => {
                                 const newSched = JSON.parse(JSON.stringify(editingSchedule));
                                 if (!newSched.entries) newSched.entries = {};
                                 const group = currentSubject.includes('||') ? currentSubject.split('||')[0] : currentSubject;
                                 newSched.entries[entryKey] = `${group}||${e.target.value}`;
                                 setEditingSchedule(newSched);
                              }} className="px-2 py-1 border rounded w-full text-[10px]" placeholder="الصف الدراسي" />
                            </div>
                          ) : (
                            <div className="text-center">
                              {period.isBreak ? <span className="text-[10px] italic">فترة استراحة</span> : (
                                currentSubject ? (
                                  <div className="flex flex-col items-center">
                                    <span className="font-bold text-xs">{currentSubject.includes('||') ? currentSubject.split('||')[0] : currentSubject}</span>
                                    {currentSubject.includes('||') && currentSubject.split('||')[1] && (
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1">{currentSubject.split('||')[1]}</span>
                                    )}
                                  </div>
                                ) : <span className="text-slate-300">-</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-5 text-slate-500 dark:text-slate-400 text-xs">جاري تحميل الجدول...</div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {classToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-md w-full p-6 text-right space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">تأكيد حذف المجموعة الدراسية</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">إجراء إداري حساس وغير قابل للتراجع</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans space-y-2 py-2 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <p>هل أنت متأكد من رغبتك في حذف المجموعة: <strong className="text-red-700 dark:text-red-300">"{classToDelete.name}"</strong>؟</p>
                <p className="text-[10px] text-slate-400">ملاحظة: سيقوم النظام بالتحقق أولاً من عدم وجود أي طالب مسجل بهذه المجموعة كإجراء وقائي لمنع فقدان البيانات.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteClass}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  تأكيد الحذف النهائي
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}