import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, ClassRoom, Attendance } from '../types';
import { samsDb } from '../utils/db';
import { CheckCheck, Printer, AlertCircle, Scan, UserCheck, Calendar, RotateCcw, Search, ShieldAlert, Wifi, Check, X } from 'lucide-react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useSamsDbSync } from '../hooks/useSamsDbSync';

const playSuccessBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

const playErrorBuzzer = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export default function AttendanceTracker() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  });
  
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentScans, setRecentScans] = useState<Array<{
    student: Student;
    timestamp: string;
    status: 'success' | 'already_present' | 'wrong_day';
  }>>([]);

  const [scanFeedback, setScanFeedback] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const loadData = () => {
    setStudents(samsDb.getStudents().filter(s => s.status !== 'archived'));
    setClasses(samsDb.getClasses());
    setAttendance(samsDb.getAttendance());
  };

  useEffect(() => {
    loadData();
  }, []);

  useSamsDbSync(() => {
    loadData();
  });

  const handleBarcodeScan = (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode) return;

    // Find student by registration_id
    const student = students.find(s => s.registration_id === cleanCode || s.national_id === cleanCode);
    
    if (!student) {
      playErrorBuzzer();
      setScanFeedback({ type: 'error', msg: `الطالب غير موجود (${cleanCode})` });
      setTimeout(() => setScanFeedback(null), 3000);
      return;
    }

    // Use selectedDate for scanning, so you can scan for past days
    const targetDate = selectedDate;
    
    // Check if already present on target date
    const alreadyPresent = attendance.some(a => 
      a.student_id === student.id && 
      a.date === targetDate && 
      a.status === 'present'
    );

    if (alreadyPresent) {
      playErrorBuzzer();
      setScanFeedback({ type: 'error', msg: `مسجل مسبقاً: ${student.name}` });
      setRecentScans(prev => [{
        student,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        status: 'already_present'
      }, ...prev].slice(0, 50));
      setTimeout(() => setScanFeedback(null), 3000);
      return;
    }

    // Save attendance
    samsDb.saveAttendance(student.id, student.class_id, targetDate, 'present');
    loadData();
    playSuccessBeep();
    
    setScanFeedback({ type: 'success', msg: `حضور: ${student.name}` });
    setRecentScans(prev => [{
      student,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      status: 'success'
    }, ...prev].slice(0, 50));
    
    setTimeout(() => setScanFeedback(null), 3000);
  };

  // Mount the global barcode listener
  const { isScannerDetected } = useBarcodeScanner(handleBarcodeScan);

  // Group Management logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
      const matchesSearch = !searchTerm || s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchTerm]);

  const markUnscannedAsAbsent = () => {
    if (selectedClass === 'all') {
      alert("يرجى اختيار مجموعة محددة أولاً لتسجيل الغياب.");
      return;
    }
    
    const unscanned = filteredStudents.filter(student => {
      const isPresent = attendance.some(a => a.student_id === student.id && a.date === selectedDate && a.status === 'present');
      const isExcused = attendance.some(a => a.student_id === student.id && a.date === selectedDate && a.status === 'excused');
      return !isPresent && !isExcused;
    });

    if (unscanned.length === 0) {
      alert("جميع طلاب هذه المجموعة تم تحضيرهم اليوم.");
      return;
    }

    if (window.confirm(`هل أنت متأكد من تسجيل غياب لـ ${unscanned.length} طالب/طالبة في هذا اليوم؟`)) {
      unscanned.forEach(s => {
        samsDb.saveAttendance(s.id, s.class_id, selectedDate, 'absent');
      });
      loadData();
      alert("تم تسجيل الغياب بنجاح.");
    }
  };

  return (
    <div className="animate-fade-in" dir="rtl"><div className="space-y-6 print:hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Scan className="w-6 h-6 text-[#1A7FAA] dark:text-sky-400" />
            بوابة الحضور والانصراف
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            قارئ الباركود نشط تلقائياً في الخلفية. يمكنك مسح الكروت مباشرة في أي وقت.
          </p>
        </div>
        
        {/* Active Listener Indicator */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border shadow-inner transition-colors ${
          isScannerDetected 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="relative flex h-3 w-3">
            {isScannerDetected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isScannerDetected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isScannerDetected ? 'الماسح متصل وجاهز للاستقبال' : 'في انتظار مسح الكارت...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right side: Real-time scan feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                سجل المسح اللحظي
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                {recentScans.length}
              </span>
            </div>
            
            {/* Feedback Banner */}
            <div className="p-4 bg-slate-900/50 min-h-[90px] flex items-center justify-center border-b border-slate-800/50">
              <AnimatePresence mode="wait">
                {scanFeedback ? (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 shadow-lg border ${
                      scanFeedback.type === 'success' 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    }`}
                  >
                    {scanFeedback.type === 'success' ? <CheckCheck className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                    <span className="font-bold text-sm">{scanFeedback.msg}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 animate-pulse"
                  >
                    <Scan className="w-5 h-5" />
                    في انتظار قراءة الباركود...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {recentScans.map((scan, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${
                  scan.status === 'success' ? 'bg-slate-800/50 border-emerald-500/30' : 'bg-slate-800/30 border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                      scan.status === 'success' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {scan.student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{scan.student.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{scan.student.registration_id}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-mono">{scan.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left side: Group Attendance Management */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col h-[500px]">
          <div className="flex flex-col mb-6 space-y-4">
            <div className="flex justify-between items-start sm:items-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400 shrink-0" />
                مراجعة حضور المجموعات
              </h3>

              {selectedClass !== 'all' && (
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <button
                    onClick={markUnscannedAsAbsent}
                    className="h-9 px-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    غياب الباقي
                  </button>
                  <button
                    onClick={() => {
                      setTimeout(() => window.print(), 100);
                    }}
                    className="h-9 px-3 bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    طباعة كشف المجموعة
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 h-10 px-3 w-full sm:w-auto shrink-0">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 select-none hidden md:inline-block ml-2">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'short' })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer p-0 m-0 w-full sm:w-[110px] outline-hidden text-left"
                  dir="ltr"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 h-10 w-full sm:w-auto focus:border-[#1A7FAA] outline-hidden cursor-pointer shrink-0"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث عن طالب..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 h-10 text-xs focus:border-[#1A7FAA] outline-hidden text-slate-700 dark:text-slate-200 font-bold placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Mobile actions */}
            {selectedClass !== 'all' && (
              <div className="flex sm:hidden items-center gap-2 w-full">
                <button
                  onClick={markUnscannedAsAbsent}
                  className="h-10 flex-1 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  غياب الباقي
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => window.print(), 100);
                  }}
                  className="h-10 flex-1 bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  طباعة الكشف
                </button>
              </div>
            )}
          </div>

          {/* Students Table */}
          <div className="flex-1 overflow-auto border border-slate-100 dark:border-slate-700 rounded-xl">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold sticky top-0 shadow-sm">
                <tr>
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">رقم القيد</th>
                  {selectedClass === 'all' && <th className="px-4 py-3">المجموعة</th>}
                  <th className="px-4 py-3 text-center">حالة اليوم</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? filteredStudents.map(student => {
                  const studentAtt = attendance.find(a => a.student_id === student.id && a.date === selectedDate);
                  const status = studentAtt ? studentAtt.status : 'pending';
                  const classObj = classes.find(c => c.id === student.class_id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">{student.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{student.registration_id}</td>
                      {selectedClass === 'all' && (
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{classObj?.name || '-'}</td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {status === 'present' && <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md text-xs font-bold"><Check className="w-3.5 h-3.5" /> حاضر</span>}
                        {status === 'absent' && <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-md text-xs font-bold"><X className="w-3.5 h-3.5" /> غائب</span>}
                        {status === 'excused' && <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-md text-xs font-bold">مستأذن</span>}
                        {status === 'pending' && <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md text-xs font-bold">لم يُسجل</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { samsDb.saveAttendance(student.id, student.class_id, selectedDate, 'present'); loadData(); }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'}`}
                            title="تعيين حاضر"
                          >
                            حاضر
                          </button>
                          <button
                            onClick={() => { samsDb.saveAttendance(student.id, student.class_id, selectedDate, 'absent'); loadData(); }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === 'absent' ? 'bg-rose-100 text-rose-700' : 'text-slate-500 dark:text-slate-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/40'}`}
                            title="تعيين غائب"
                          >
                            غائب
                          </button>
                          <button
                            onClick={() => { samsDb.saveAttendance(student.id, student.class_id, selectedDate, 'excused'); loadData(); }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === 'excused' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/40'}`}
                            title="تعيين مستأذن"
                          >
                            مستأذن
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      لا يوجد طلاب في هذه المجموعة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


        </div>
      </div>

      </div>{/* PRINTABLE ATTENDANCE SHEET */}
      <div id="printable-attendance-sheet" className="hidden print:block w-full bg-white text-black">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6" dir="rtl">
          <div>
            <h1 className="text-2xl font-black text-slate-900">كشف غياب وحضور المجموعات</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">تاريخ اليوم: {new Date(selectedDate).toLocaleDateString('ar-EG')}</p>
          </div>
          <div className="text-left">
            <div className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-xl border border-slate-300">
              {selectedClass === 'all' ? 'جميع المجموعات' : classes.find(c => c.id === selectedClass)?.name}
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-right border-collapse" dir="rtl">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-800">
              <th className="py-3 px-4 font-bold text-slate-900">اسم الطالب</th>
              <th className="py-3 px-4 font-bold text-slate-900">كود الطالب</th>
              {selectedClass === 'all' && (
                <th className="py-3 px-4 font-bold text-slate-900">المجموعة</th>
              )}
              <th className="py-3 px-4 font-bold text-slate-900 text-center">حالة الحضور</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const studentAtt = attendance.find(a => a.student_id === student.id && a.date === selectedDate);
                const status = studentAtt ? studentAtt.status : 'pending';
                const classObj = classes.find(c => c.id === student.class_id);

                let statusText = 'لم يُسجل';
                if (status === 'present') statusText = 'حاضر';
                if (status === 'absent') statusText = 'غائب';
                if (status === 'excused') statusText = 'مستأذن';

                return (
                  <tr key={student.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">{student.registration_id}</td>
                    {selectedClass === 'all' && (
                      <td className="py-3 px-4 text-slate-700">{classObj?.name || '-'}</td>
                    )}
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {statusText}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={selectedClass === 'all' ? 4 : 3} className="py-8 text-center text-slate-500 font-bold">
                  لا يوجد طلاب في هذه المجموعة
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-12 flex justify-between border-t border-slate-300 pt-4" dir="rtl">
          <div className="text-sm font-bold text-slate-700">توقيع المدرس: ........................</div>
          <div className="text-sm font-bold text-slate-700">توقيع الإدارة: ........................</div>
        </div>
      </div>

    </div>
  );
}
