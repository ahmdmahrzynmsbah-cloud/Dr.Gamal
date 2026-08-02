/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { samsDb } from '../utils/db';
import { Users, UserCheck, BookOpen, CreditCard, Activity, AlertTriangle, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  onNavigateToTab: (tabId: string) => void;
}

export default function Dashboard({ onNavigateToTab }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const students = samsDb.getStudents();
  const teachers = samsDb.getTeachers();
  const classes = samsDb.getClasses();
  const fees = samsDb.getFees();
  const attendance = samsDb.getAttendance();
  const auditLogs = samsDb.getAuditLogs().slice(0, 5); // top 5 recent actions

  // STAT CALCULATIONS
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const suspendedStudents = students.filter(s => s.status === 'suspended').length;
  
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  // Revenue calc
  const totalRevenue = fees.reduce((sum, f) => sum + f.amount, 0);
  
  // Calculate pending revenue dynamically:
  // If there are no payments recorded in the system yet, the pending and target fees are 0.
  // Once a center registers transactions, we assume active students with no payment have a standard subscription of 350 L.E.
  const activeStudentsList = students.filter(s => s.status === 'active');
  const unpaidStudents = activeStudentsList.filter(s => !fees.some(f => f.student_id === s.id));
let gradeFees = {
    'الصف الأول الإعدادي': 150,
    'الصف الثاني الإعدادي': 150,
    'الصف الثالث الإعدادي': 150,
    'الصف الأول الثانوي': 200,
    'الصف الثاني الثانوي': 250,
    'الصف الثالث الثانوي': 300
  };
  try {
    const saved = localStorage.getItem('sams_grade_monthly_fees');
    if (saved) gradeFees = JSON.parse(saved);
  } catch (e) {}
  
  const pendingRevenue = fees.length === 0 ? 0 : unpaidStudents.reduce((sum, s) => {
    return sum + (gradeFees[s.grade_level] || 250);
  }, 0);
  const targetRevenue = totalRevenue + pendingRevenue;

  // Present rate on last recorded day (e.g. 2026-03-02)
  const lastRecordedDate = attendance.length > 0 ? [...attendance].sort((a, b) => b.date.localeCompare(a.date))[0].date : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const attendanceOnDay = attendance.filter(a => a.date === lastRecordedDate);
  const totalInAttendance = attendanceOnDay.length;
  const presentOnDay = attendanceOnDay.filter(a => a.status === 'present').length;
  const attendanceRate = totalInAttendance > 0 ? Math.round((presentOnDay / totalInAttendance) * 100) : 0;

  // Grade performance counts linked directly to the exams database
  const examsList = samsDb.getExams();
  const examGrades = samsDb.getExamGrades();

  let excellentCount = 0;
  let veryGoodCount = 0;
  let goodCount = 0;
  let passingCount = 0;
  let failingCount = 0;

  examGrades.forEach(g => {
    if (g.absent) {
      failingCount++;
      return;
    }
    const exam = examsList.find(e => e.id === g.exam_id);
    if (exam && exam.max_score > 0) {
      const percentage = (g.score / exam.max_score) * 100;
      if (percentage >= 85) excellentCount++;
      else if (percentage >= 75) veryGoodCount++;
      else if (percentage >= 65) goodCount++;
      else if (percentage >= 50) passingCount++;
      else failingCount++;
    }
  });

  const gradesData = [
    { name: 'ممتاز', العدد: excellentCount, fill: '#10B981' },
    { name: 'جيد جداً', العدد: veryGoodCount, fill: '#1A7FAA' },
    { name: 'جيد', العدد: goodCount, fill: '#3B82F6' },
    { name: 'مقبول', العدد: passingCount, fill: '#F59E0B' },
    { name: 'ضعيف', العدد: failingCount, fill: '#E8192C' }
  ];

  // Financial collection status
  const financialData = [
    { name: 'الرسوم المدفوعة', value: totalRevenue },
    { name: 'الرسوم المتأخرة', value: pendingRevenue }
  ];
  const COLORS = ['#0D5C8C', '#E8192C'];

  return (
    <div className="space-y-6" id="sams_control_dashboard">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">الأداء العام للسنتر</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">نظام منصة الإدارة — قاعدة البيانات المحدثة لحظياً حتى تاريخ اليوم</p>
        </div>
        <div className="flex items-center gap-2.5 bg-[#E8192C]/5 px-4 py-2 rounded-xl text-[#C0152A] text-xs font-semibold border border-[#E8192C]/10 self-start md:self-auto font-sans">
          <Calendar className="w-4 h-4 text-[#C0152A]" />
          <span className="whitespace-nowrap">توقيت النظام:</span>
          <span className="font-bold">
            {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="text-[#C0152A] font-mono tracking-wide font-extrabold bg-[#E8192C]/10 px-2 py-0.5 rounded">
            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* Grid Statistics Cards - 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        
        {/* Total Students Card */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-[#0D5C8C] dark:border-sky-500 border-r-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer" onClick={() => onNavigateToTab('students')} id="stat_students_card">
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold font-sans">إجمالي الطلاب المقيدين</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-[#1A1A2E] dark:text-slate-100">{totalStudents}</span>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-300 font-bold whitespace-nowrap">+{activeStudents} نشط</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-tight">({suspendedStudents} معلق / {totalStudents - activeStudents - suspendedStudents} مؤرشف)</p>
          </div>
          <div className="p-3 bg-[#0D5C8C]/10 dark:bg-sky-500/20 rounded-xl text-[#0D5C8C] dark:text-sky-300 shrink-0">
            <Users className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>

        {/* Attendance Rate Card */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-[#1A7FAA] dark:border-sky-400 border-r-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer" onClick={() => onNavigateToTab('attendance')} id="stat_attendance_card">
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold font-sans">نسبة حضور اليوم</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-[#1A7FAA] dark:text-sky-400">{attendanceRate}%</span>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-300 font-bold">مستقر</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans font-bold">آخر تسجيل: {lastRecordedDate}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>

        {/* Classes Card */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-yellow-400 dark:border-amber-400 border-r-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer" onClick={() => onNavigateToTab('classes')} id="stat_classes_card">
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold font-sans">المجموعات الدراسية</p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 dark:text-amber-300">{totalClasses}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 dark:text-amber-200">مجموعات</span>
            </div>
            <p className="text-[10px] text-[#0D5C8C] dark:text-sky-400 font-black font-sans">تحديث فوري</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-300 shrink-0">
            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>

        {/* Financial Collection Rate Card - Colored alert state */}
        <div className={`p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer ${
          fees.length === 0
            ? 'bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-800/90 border border-slate-400 border-r-4 text-slate-700 dark:text-slate-200'
            : pendingRevenue > 0
            ? 'bg-[#FEF2F2] dark:bg-rose-950/50 border border-[#C0152A] dark:border-rose-500 border-r-4 text-[#C0152A] dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-600 dark:border-emerald-400 border-r-4 text-emerald-800 dark:text-emerald-200'
        }`} onClick={() => onNavigateToTab('fees')} id="stat_revenue_card">
          <div className="space-y-2">
            <p className={`text-xs font-extrabold font-sans ${fees.length === 0 ? 'text-slate-500 dark:text-slate-400' : pendingRevenue > 0 ? 'text-[#C0152A] dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>المتحصلات المالية والرسوم</p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl font-black">{totalRevenue.toLocaleString()}</span>
              <span className="text-sm font-bold">ج.م</span>
            </div>
            <p className="text-[10px] font-bold flex items-center gap-1">
              {fees.length === 0 ? (
                <span className="text-slate-400">لا توجد رسوم مستحقة بعد</span>
              ) : (
                <span>مستحقة: {pendingRevenue.toLocaleString()} ج.م</span>
              )}
            </p>
          </div>
          <div className={`p-3 rounded-xl shrink-0 ${
            fees.length === 0
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              : pendingRevenue > 0
              ? 'bg-red-100/60 dark:bg-rose-900/60 text-[#C0152A] dark:text-rose-200'
              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-200'
          }`}>
            <CreditCard className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>

      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grades Performance Plot (Recharts) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0D5C8C]" />
              توزيع تقديرات الدرجات الأكاديمية للطلاب
            </h3>
            <span className="text-xs text-slate-400">المجموعة الدراسي الأول 2026/2025</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {examGrades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip formatter={(value) => [`${value} طلاب`, 'العدد']} />
                  <Bar dataKey="العدد" radius={[4, 4, 0, 0]}>
                    {gradesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-400 font-sans">
                <div className="text-3xl">📊</div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">لا توجد درجات امتحانات مرصودة حالياً في النظام</p>
                <p className="text-[10px] text-slate-400 max-w-xs">يمكنك رصد علامات الطلاب من تبويب الامتحانات والواجبات لتظهر لك التحليلات وتوزيع المستويات تلقائياً هنا</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Collection Doughnut Chart */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              الحالة المالية وتحصيل الرسوم
            </h3>
            <span className="text-xs text-slate-400">نسب الرسوم السنوية والتحصيلات</span>
          </div>

          <div className="h-44 flex items-center justify-center relative my-4">
            {fees.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ج.م`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center mt-[-8px]">
                  <span className="text-[10px] text-slate-400 font-sans block">نسبة التحصيل</span>
                  <span className="text-lg font-bold text-[#0D5C8C]">
                    {Math.round((totalRevenue / (targetRevenue || 1)) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-4 space-y-1.5 text-slate-400 font-sans">
                <div className="text-3xl">💳</div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">لا توجد رسوم محصلة بعد</p>
                <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto">عند تسجيل سداد اشتراك أو مصروفات لأي طالب، سيظهر لك مؤشر نسب التحصيل فوراً</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-1.5 rounded bg-[#0D5C8C]/5 border-r-4 border-[#0D5C8C]">
              <span className="text-slate-600 dark:text-slate-300">تم تحصيله رقمياً ونقداً</span>
              <span className="font-bold text-[#0D5C8C]">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded bg-red-50 dark:bg-red-900/40 border-r-4 border-[#E8192C]">
              <span className="text-slate-600 dark:text-slate-300">رسوم جارية ومستحقة</span>
              <span className="font-bold text-[#C0152A]">{pendingRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Columns: Recent System Notices (Parent Communication) & Audit Log Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Live Transactional Audit Logs */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm" id="sams_audit_logs_preview">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-gray-50 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-indigo-600" />
              سجل تدقيق وإجراءات قاعدة البيانات الحية (Audit Logs)
            </h3>
            <button onClick={() => onNavigateToTab('roles')} className="text-xs text-[#0D5C8C] hover:underline font-semibold flex items-center">
              عرض المزيد
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {auditLogs.map((log) => {
              const badgeColor = {
                INSERT: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                UPDATE: 'bg-sky-50 text-sky-700 border-sky-100',
                DELETE: 'bg-red-50 text-red-700 border-red-100',
                SOFT_DELETE: 'bg-amber-50 text-amber-700 border-amber-100',
                QUERY: 'bg-gray-50 text-gray-700 border-gray-100'
              }[log.action_type];

              return (
                <div key={log.id} className="p-3 border border-gray-50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50/50 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-800 dark:text-slate-100 dark:text-slate-100 font-medium leading-relaxed">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600 dark:text-slate-300">{log.user_name}</span>
                      <span>•</span>
                      <span>الجدول: {log.table_name}</span>
                      <span>•</span>
                      <span>التوقيت: {log.timestamp}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 border rounded-sm font-semibold uppercase text-[9px] self-start sm:self-auto ${badgeColor}`}>
                    {log.action_type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Level Attendance Absent Alert Notice */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-gray-50 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-[#C0152A]" />
              الحالات الطارئة وتنبيهات الغياب المتكرر
            </h3>
            <span className="text-[10px] bg-[#E8192C]/10 text-[#C0152A] px-2 py-0.5 rounded font-bold animate-pulse">فوري</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-[#E8192C]/5 border border-[#E8192C]/10 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-[#E8192C]/10 rounded-lg text-[#C0152A] shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 dark:text-slate-100">تجاوز نسبة الغياب المسموحة (الطالب عمر السقا)</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  تجاوز الطالب عمر شادي نسبة غياب 25% من الحصص الشهرية لمجموعة الصف الثالث الابتدائي. تم تجميد القيد تلقائياً وإرسال إشعار SMS لولي الأمر.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onNavigateToTab('attendance')} className="text-xxs px-2 py-1 bg-[#0D5C8C] text-white rounded cursor-pointer hover:bg-[#1A7FAA]">تحرير الحضور</button>
                  <button onClick={() => onNavigateToTab('notifications')} className="text-xxs px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">عرض الرسالة</button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-yellow-50 border border-yellow-200/50 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 dark:text-slate-100">مراجعة كشوف الدرجات للمجموعات الدراسية</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  هناك 3 طلاب لم ترصد لهم درجات الاختبار الشهري الخاص بمادة الرياضيات حتى الآن.
                </p>
                <button onClick={() => onNavigateToTab('exams')} className="text-xxs px-2 py-1 bg-amber-600 text-white rounded cursor-pointer hover:bg-amber-700 mt-2">توجه للرصد</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
