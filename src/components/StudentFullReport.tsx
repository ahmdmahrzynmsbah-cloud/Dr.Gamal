import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Student, Attendance, ExamGrade, Exam, AssignmentGrade, Assignment, FeePayment, ClassRoom } from '../types';
import { samsDb } from '../utils/db';
import { X, Printer, Download, User, Calendar, BookOpen, CreditCard, CheckCircle, AlertCircle, Award, Target, Hash, Phone, Clock, Coins, Check } from 'lucide-react';
import { useSamsDbSync } from '../hooks/useSamsDbSync';
import { calculateStudentSubscription, isStudentEnrolledInCalendarMonth, formatShortDateArabic } from '../utils/subscriptionUtils';

interface Props {
  student: Student;
  onClose: () => void;
}

export default function StudentFullReport({ student, onClose }: Props) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [examGrades, setExamGrades] = useState<(ExamGrade & { exam: Exam })[]>([]);
  const [assignmentGrades, setAssignmentGrades] = useState<(AssignmentGrade & { assignment: Assignment })[]>([]);
  const [fees, setFees] = useState<FeePayment[]>([]);
  const [classInfo, setClassInfo] = useState<ClassRoom | null>(null);

  useEffect(() => {
    // Load class info
    const classes = samsDb.getVisibleClasses();
    setClassInfo(classes.find(c => c.id === student.class_id) || null);

    // Load attendance
    const allAtt = samsDb.getAttendance();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    setAttendance(allAtt.filter(a => {
      const attDate = new Date(a.date);
      return a.student_id === student.id && attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Load Exams
    const allExams = samsDb.getExams();
    const allExamGrades = samsDb.getExamGrades();
    const studentExams = allExamGrades
      .filter(eg => eg.student_id === student.id)
      .map(eg => ({
        ...eg,
        exam: allExams.find(e => e.id === eg.exam_id)!
      }))
      .filter(eg => eg.exam)
      .sort((a, b) => new Date(b.exam.date).getTime() - new Date(a.exam.date).getTime());
    setExamGrades(studentExams);

    // Load Assignments
    const allAssignments = samsDb.getAssignments();
    const allAssignmentGrades = samsDb.getAssignmentGrades();
    const studentAssignments = allAssignmentGrades
      .filter(ag => ag.student_id === student.id)
      .map(ag => ({
        ...ag,
        assignment: allAssignments.find(a => a.id === ag.assignment_id)!
      }))
      .filter(ag => ag.assignment)
      .sort((a, b) => new Date(b.assignment.due_date).getTime() - new Date(a.assignment.due_date).getTime());
    setAssignmentGrades(studentAssignments);

    // Load Fees
    const allFees = samsDb.getFees();
    setFees(allFees.filter(f => f.student_id === student.id).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()));
  }, [student.id, student.class_id]);

  const handlePrint = () => {
    window.print();
  };

  const isAlsafa = typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa';
  const printHeaderTitle = isAlsafa ? 'سيستم الصفا للمواد الشرعية' : (localStorage.getItem('sams_custom_header_title_v2') || 'الدكتور في اللغة العربية');
  const printHeaderSubtitle = localStorage.getItem('sams_custom_header_subtitle_v2') || 'التقرير الأكاديمي الشامل وكشف المتابعة المطبوع';
  const printHeaderContact = localStorage.getItem('sams_custom_header_contact_v2') || '';
  const printHeaderLogo = localStorage.getItem('sams_custom_app_logo_v2') || '';

  const attPresent = attendance.filter(a => a.status === 'present').length;
  const attAbsent = attendance.filter(a => a.status === 'absent').length;
  const attExcused = attendance.filter(a => a.status === 'excused').length;
  const totalAtt = attendance.length;
  const attRate = totalAtt > 0 ? Math.round(((attPresent + attExcused) / totalAtt) * 100) : 0;

  const totalFeesPaid = fees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 w-full flex flex-col print:shadow-none print:border-none print:bg-white dark:bg-slate-800 animate-fade-in"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-3xl shrink-0 gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors shadow-sm flex items-center gap-2"
            title="رجوع"
          >
             <X className="w-5 h-5" /><span className="font-bold text-sm">إغلاق التقرير</span>
          </button>
          <div className="w-12 h-12 bg-[#1A7FAA]/10 text-[#1A7FAA] dark:text-sky-400 rounded-xl flex items-center justify-center border border-[#1A7FAA]/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100">التقرير الشامل للطالب</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{student.name} - {student.registration_id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold text-sm transition-colors shadow-md">
            <Printer className="w-4 h-4" />
            طباعة التقرير / PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div id="printable-group-roster" className="flex-1 p-4 sm:p-6 space-y-6 print:p-2 print:space-y-4 bg-white dark:bg-slate-800 print:bg-white text-slate-900 dark:text-slate-100 print:text-black">
          
          {/* Official Printable Header */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-center print-avoid-break">
            <div className="flex items-center gap-3.5">
              {printHeaderLogo ? (
                <img src={printHeaderLogo} alt="شعار السنتر" className="w-14 h-14 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-amber-500/10 border-2 border-amber-600 rounded-xl flex items-center justify-center text-amber-800 dark:text-amber-300 font-extrabold text-xl shrink-0">
                  {printHeaderTitle ? printHeaderTitle.charAt(0) : 'س'}
                </div>
              )}
              <div>
                <h1 className="text-sm sm:text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-50 print:text-black leading-tight">{printHeaderTitle}</h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 print:text-slate-700 font-medium">{printHeaderSubtitle}</p>
                {printHeaderContact && <p className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600 font-sans">{printHeaderContact}</p>}
              </div>
            </div>

            <div className="text-center px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 print:bg-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl shrink-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 print:text-black block">تقرير طالب رسمي</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-700 font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
          
          {/* Section 1: Personal Info & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 print:gap-2.5 print-section print-avoid-break">
            {/* Info Card */}
            <div className="md:col-span-1 print:col-span-1 bg-white dark:bg-slate-800 print:bg-white border border-slate-200 dark:border-slate-700 print:border-slate-300 rounded-2xl p-3.5 sm:p-4 print:p-3 shadow-xs">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 print:text-black border-b border-slate-100 dark:border-slate-700 print:border-slate-200 pb-2 mb-3 flex items-center gap-2 text-xs sm:text-sm">
                <Hash className="w-4 h-4 text-[#1A7FAA] dark:text-sky-400 print:text-[#1A7FAA]" />
                البيانات الأساسية
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-500 print:text-slate-600">اسم الطالب</span><span className="font-bold text-slate-900 print:text-black">{student.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 print:text-slate-600">رقم القيد</span><span className="font-mono font-bold text-[#0D5C8C]">{student.registration_id}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 print:text-slate-600">المجموعة</span><span className="font-bold text-[#1A7FAA] dark:text-sky-400">{classInfo ? `${classInfo.name} (${classInfo.education_type || 'عام'})` : '-'}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 print:text-slate-600">السنة الدراسية</span><span className="font-bold text-slate-800 print:text-black">{student.grade_level}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 print:text-slate-600">تاريخ التسجيل</span><span className="text-slate-700 print:text-slate-800">{new Date(student.created_at).toLocaleDateString('ar-EG')}</span></div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800 print:border-slate-200">
                  <span className="text-slate-500 print:text-slate-600">ولي الأمر</span>
                  <div className="text-left">
                    <span className="font-bold text-slate-800 print:text-black block">{student.parent_name || 'غير مدون'}</span>
                    <span className="font-mono text-slate-500 print:text-slate-600 flex items-center gap-1 justify-end mt-0.5"><Phone className="w-3 h-3"/> {student.parent_phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="md:col-span-2 print:col-span-2 grid grid-cols-2 gap-2.5 print:gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-900/40 print:bg-emerald-50/80 border border-emerald-200 dark:border-emerald-800 print:border-emerald-300 rounded-xl p-3 print:p-2.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-emerald-900 dark:text-emerald-300 print:text-emerald-950 font-bold text-xs flex items-center gap-1.5"><Target className="w-4 h-4"/> نسبة الحضور</h4>
                  <span className="text-lg sm:text-xl font-black text-emerald-700 print:text-emerald-800">{attRate}%</span>
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-1">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{width: `${attRate}%`}}></div>
                </div>
                <div className="flex gap-3 mt-2 text-[10px] font-bold text-emerald-800">
                  <span>حاضر: {attPresent}</span>
                  <span>غائب: {attAbsent}</span>
                  <span>مستأذن: {attExcused}</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/40 print:bg-amber-50/80 border border-amber-200 dark:border-amber-800 print:border-amber-300 rounded-xl p-3 print:p-2.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-amber-900 dark:text-amber-300 print:text-amber-950 font-bold text-xs flex items-center gap-1.5"><CreditCard className="w-4 h-4"/> إجمالي المدفوعات</h4>
                </div>
                <p className="text-lg sm:text-xl font-black text-amber-700 print:text-amber-800 font-mono mt-0.5">{totalFeesPaid} <span className="text-xs font-sans font-bold">ج.م</span></p>
                <p className="text-[10px] font-bold text-amber-800 mt-1">المسدد منذ التسجيل</p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/40 print:bg-indigo-50/80 border border-indigo-200 dark:border-indigo-800 print:border-indigo-300 rounded-xl p-3 print:p-2.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-indigo-900 dark:text-indigo-300 print:text-indigo-950 font-bold text-xs flex items-center gap-1.5"><Award className="w-4 h-4"/> الامتحانات</h4>
                </div>
                <p className="text-base sm:text-lg font-black text-indigo-700 print:text-indigo-800 mt-0.5">{examGrades.length} <span className="text-xs font-bold">امتحان</span></p>
                <p className="text-[10px] font-bold text-indigo-800 mt-1">تم رصد درجاتها</p>
              </div>

              <div className="bg-sky-50 dark:bg-sky-900/40 print:bg-sky-50/80 border border-sky-200 dark:border-sky-800 print:border-sky-300 rounded-xl p-3 print:p-2.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sky-900 dark:text-sky-300 print:text-sky-950 font-bold text-xs flex items-center gap-1.5"><BookOpen className="w-4 h-4"/> التكليفات</h4>
                </div>
                <p className="text-base sm:text-lg font-black text-sky-700 print:text-sky-800 mt-0.5">{assignmentGrades.length} <span className="text-xs font-bold">تكليف</span></p>
                <p className="text-[10px] font-bold text-sky-800 mt-1">نسبة التسليم: {assignmentGrades.length > 0 ? Math.round((assignmentGrades.filter(a => a.completed).length / assignmentGrades.length)*100) : 0}%</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700 print:border-slate-200" />

          {/* Section 2: Attendance History */}
          <div className="print-section print-avoid-break">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 print:text-black mb-2.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1A7FAA] dark:text-sky-400 print:text-[#1A7FAA]" />
              <span>سجل الحضور والغياب (لشهر {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })})</span>
            </h3>
            {attendance.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-6 gap-2 print:gap-1.5">
                {attendance.map(att => (
                  <div key={att.id} className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 print:p-1.5 ${
                    att.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-900/40 print:bg-emerald-50 border-emerald-300 dark:border-emerald-800 print:border-emerald-400' :
                    att.status === 'absent' ? 'bg-rose-50 dark:bg-rose-900/40 print:bg-rose-50 border-rose-300 dark:border-rose-800 print:border-rose-400' :
                    'bg-amber-50 dark:bg-amber-900/40 print:bg-amber-50 border-amber-300 dark:border-amber-800 print:border-amber-400'
                  }`}>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 print:text-black">{new Date(att.date).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      att.status === 'present' ? 'bg-emerald-200 text-emerald-900 print:bg-emerald-100 print:text-emerald-900' :
                      att.status === 'absent' ? 'bg-rose-200 text-rose-900 print:bg-rose-100 print:text-rose-900' :
                      'bg-amber-200 text-amber-900 print:bg-amber-100 print:text-amber-900'
                    }`}>
                      {att.status === 'present' ? 'حاضر ✓' : att.status === 'absent' ? 'غائب ✗' : 'مستأذن'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-900/50 print:bg-slate-100 rounded-xl border border-slate-100 dark:border-slate-700">لا توجد سجلات حضور مسجلة لهذا الطالب.</p>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-700 print:border-slate-200" />

          {/* Section 3: Exams & Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 print-section print-avoid-break">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 print:text-black mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 print:text-indigo-700" />
                <span>سجل الامتحانات</span>
              </h3>
              {examGrades.length > 0 ? (
                <div className="space-y-2">
                  {examGrades.map(eg => (
                    <div key={eg.id} className="flex items-center justify-between p-2.5 print:p-2 bg-white dark:bg-slate-800 print:bg-white border border-slate-200 dark:border-slate-700 print:border-slate-300 rounded-xl shadow-2xs print-avoid-break">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black text-xs">{eg.exam.name}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 print:text-slate-600">{new Date(eg.exam.date).toLocaleDateString('ar-EG')} • {eg.exam.type}</p>
                      </div>
                      <div className="text-left">
                        {eg.absent ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">غائب</span>
                        ) : (
                          <p className="font-black text-indigo-700 print:text-indigo-800 text-sm font-mono">{eg.score} <span className="text-[10px] text-slate-400 font-medium font-sans">/ {eg.exam.max_score}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100">لا توجد درجات امتحانات.</p>
              )}
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 print:text-black mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-600 print:text-sky-700" />
                <span>سجل التكليفات والواجبات</span>
              </h3>
              {assignmentGrades.length > 0 ? (
                <div className="space-y-2">
                  {assignmentGrades.map(ag => (
                    <div key={ag.id} className="flex items-center justify-between p-2.5 print:p-2 bg-white dark:bg-slate-800 print:bg-white border border-slate-200 dark:border-slate-700 print:border-slate-300 rounded-xl shadow-2xs print-avoid-break">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black text-xs">{ag.assignment.title}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 print:text-slate-600">الاستلام: {new Date(ag.assignment.due_date).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-left">
                        {ag.completed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            سلم ✔️
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            لم يسلم ❌
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100">لا توجد تكليفات مسجلة.</p>
              )}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700 print:border-slate-200" />

          {/* Section 4: Fees History & Visual Monthly Cards */}
          <div className="print-section print-avoid-break">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 print:text-black flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600 print:text-amber-700" />
                <span>سجل وبطاقات الاشتراكات الشهرية</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-emerald-50 dark:bg-emerald-950 print:bg-emerald-50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-md font-bold">
                  إجمالي المسدد: {fees.reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Financial Overview Cards */}
            {(() => {
              const subOverview = calculateStudentSubscription(student, fees, 250);
              return (
                <div className="space-y-3 mb-4">
                  {/* Subscription Summary Banner */}
                  <div className="bg-gradient-to-l from-slate-50 to-sky-50/50 dark:from-slate-900/60 dark:to-sky-950/30 print:bg-slate-50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 print:border-slate-300 flex flex-wrap items-center justify-between gap-2.5 text-xs print-avoid-break">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 print:text-black text-xs flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0D5C8C]" />
                          تاريخ بدء الاشتراك: {subOverview.startDateFormatted}
                        </span>
                        <span className="bg-sky-100 text-[#0D5C8C] px-2 py-0.2 rounded-full font-bold text-[10px]">
                          {subOverview.registrationText}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 print:text-slate-600 text-[10px]">
                        الدورة الحالية: <span className="font-bold text-slate-800 print:text-black">{subOverview.currentCycle.label}</span> ({subOverview.currentCycle.periodLabel})
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-white dark:bg-slate-800 print:bg-white border border-slate-200 dark:border-slate-700 print:border-slate-300 px-2.5 py-1 rounded-lg shadow-2xs">
                        <span className="text-[9px] text-slate-500 print:text-slate-600 block">إجمالي المسدد:</span>
                        <span className="font-black font-sans text-emerald-600 print:text-emerald-700 text-xs">
                          {subOverview.totalPaid.toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 print:bg-white border border-slate-200 dark:border-slate-700 print:border-slate-300 px-2.5 py-1 rounded-lg shadow-2xs">
                        <span className="text-[9px] text-slate-500 print:text-slate-600 block">المبلغ المتبقي:</span>
                        <span className={`font-black font-sans text-xs ${
                          subOverview.totalRemainingDebt > 0 ? 'text-rose-600 print:text-rose-700 font-extrabold' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {subOverview.totalRemainingDebt > 0 ? `${subOverview.totalRemainingDebt.toLocaleString()} ج.م` : 'لا يوجد متبقي ✓'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 12-Month Colorful Subscription Cards Grid - Compact & Non-breaking */}
                  <div className="bg-slate-50/70 dark:bg-slate-900/50 print:bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700 print:border-slate-300 print-avoid-break">
                    <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 print:text-black mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0D5C8C]" />
                      <span>خريطة سداد الشهور (محسوبة بدقة وفقاً لتاريخ تسجيل الطالب):</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 print:grid-cols-4 gap-2 print:gap-1.5">
                      {[
                        'يوليو 2026', 'أغسطس 2026', 'سبتمبر 2026', 'أكتوبر 2026',
                        'نوفمبر 2026', 'ديسمبر 2026', 'يناير 2027', 'فبراير 2027',
                        'مارس 2027', 'أبريل 2027', 'مايو 2027', 'يونيو 2027'
                      ].map((m, idx) => {
                        const payment = fees.find(f => f.month === m);
                        const isEnrolled = isStudentEnrolledInCalendarMonth(student, m);
                        const isCurrent = m === 'سبتمبر 2026';
                        const isPast = idx < 2; // July, August

                        if (payment) {
                          return (
                            <div
                              key={m}
                              className="bg-emerald-50 dark:bg-emerald-950/80 print:bg-emerald-50 border border-emerald-300 dark:border-emerald-700 print:border-emerald-400 rounded-lg p-2 flex flex-col justify-between shadow-2xs print-avoid-break"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[11px] text-emerald-950 dark:text-emerald-200 print:text-emerald-950">{m.split(' ')[0]}</span>
                                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 flex items-center gap-0.5">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>مدفوع</span>
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px] pt-1 border-t border-emerald-200 dark:border-emerald-800 print:border-emerald-300">
                                <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 print:text-emerald-950">{payment.amount} ج.م</span>
                                <span className="text-[8px] text-emerald-600 dark:text-emerald-400 print:text-emerald-700 font-mono">#{payment.receipt_number?.split('-').pop() || 'تم'}</span>
                              </div>
                            </div>
                          );
                        }

                        // Not enrolled yet during this calendar month
                        if (!isEnrolled) {
                          return (
                            <div
                              key={m}
                              className="bg-slate-100/50 dark:bg-slate-800/30 print:bg-slate-100/60 border border-slate-200 dark:border-slate-700/50 print:border-slate-300 rounded-lg p-2 flex flex-col justify-between opacity-60 print-avoid-break"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] text-slate-500 print:text-slate-600">{m.split(' ')[0]}</span>
                                <span className="text-[8px] text-slate-400 print:text-slate-500">غير مسجل</span>
                              </div>
                              <div className="mt-1 text-[9px] text-slate-400 print:text-slate-500 pt-1 border-t border-slate-200 print:border-slate-300">
                                قبل التحاق الطالب
                              </div>
                            </div>
                          );
                        }

                        if (isCurrent) {
                          const isNew = subOverview.daysSinceRegistration <= 30;
                          const isHalf = isNew && subOverview.isRegisteredAfterDay7;
                          const requiredFee = isHalf ? subOverview.firstMonthFee : subOverview.monthlyFee;

                          return (
                            <div
                              key={m}
                              className="bg-sky-50 dark:bg-sky-950/80 print:bg-sky-50 border border-sky-300 dark:border-sky-700 print:border-sky-400 rounded-lg p-2 flex flex-col justify-between shadow-2xs print-avoid-break"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[11px] text-sky-950 dark:text-sky-200 print:text-sky-950">{m.split(' ')[0]}</span>
                                <span className="text-[9px] font-bold text-sky-700 dark:text-sky-300 print:text-sky-800 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{isHalf ? 'نصف شهر' : 'شهر كامل'}</span>
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px] pt-1 border-t border-sky-200 dark:border-sky-800 print:border-sky-300 text-sky-800 print:text-sky-900">
                                <span className="font-bold">{requiredFee} ج.م</span>
                                <span className="text-[9px]">يستحق بنهاية الشهر</span>
                              </div>
                            </div>
                          );
                        }

                        if (isPast) {
                          return (
                            <div
                              key={m}
                              className="bg-rose-50 dark:bg-rose-950/80 print:bg-rose-50 border border-rose-300 dark:border-rose-800 print:border-rose-400 rounded-lg p-2 flex flex-col justify-between shadow-2xs print-avoid-break"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[11px] text-rose-950 dark:text-rose-200 print:text-rose-950">{m.split(' ')[0]}</span>
                                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 print:text-rose-800 flex items-center gap-0.5">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>متأخر</span>
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px] pt-1 border-t border-rose-200 dark:border-rose-800 print:border-rose-300 text-rose-800 print:text-rose-900">
                                <span className="font-bold">غير مسدد</span>
                                <span className="text-[9px]">مطلوب التحصيل</span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={m}
                            className="bg-slate-100/60 dark:bg-slate-800/40 print:bg-slate-100 border border-slate-200 dark:border-slate-700/60 print:border-slate-300 rounded-lg p-2 flex flex-col justify-between opacity-70 print-avoid-break"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700">{m.split(' ')[0]}</span>
                              <span className="text-[8px] text-slate-400 print:text-slate-500">قادم</span>
                            </div>
                            <div className="mt-1 text-[9px] text-slate-400 print:text-slate-500 pt-1 border-t border-slate-200 print:border-slate-300">
                              {m.split(' ')[1]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {fees.length > 0 ? (
              <div className="overflow-x-auto max-h-[50vh] print:max-h-none overflow-y-auto border border-slate-200 dark:border-slate-700 print:border-slate-300 rounded-xl shadow-xs mask-edges print-section print-avoid-break">
                
                {/* Mobile View: High-efficiency Cards */}
                <div className="md:hidden print:hidden divide-y divide-slate-100 dark:divide-slate-700/60 bg-white dark:bg-slate-800">
                  {fees.map(fee => (
                    <div key={fee.id} className="p-3 space-y-2 hover:bg-slate-50/60 transition-colors">
                       <div className="flex justify-between items-start">
                         <div className="space-y-1">
                           <span className="font-extrabold text-amber-600 dark:text-amber-400 block">{fee.amount} ج.م</span>
                           <span className="text-[10px] text-slate-500 font-mono block">{new Date(fee.payment_date).toLocaleDateString('ar-EG')}</span>
                         </div>
                         <div className="text-left space-y-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{fee.month || 'اشتراك شهري'}</span>
                            <span className="text-[10px] font-mono text-slate-400 block">#{fee.receipt_number || '-'}</span>
                         </div>
                       </div>
                       <div className="pt-1.5 border-t border-slate-100">
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                            {fee.payment_method === 'cash' ? 'نقدي' : fee.payment_method === 'card' ? 'فيزا' : 'تحويل'}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Desktop and Print Table View */}
                <div className="hidden md:block print:block">
                  <table className="w-full text-xs text-right relative border-collapse print:text-[11px]">
                    <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 dark:text-slate-100 print:text-black font-black border-b-2 border-slate-200 dark:border-slate-700 print:border-slate-400 shadow-xs">
                    <tr>
                      <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 print:text-black whitespace-nowrap">التاريخ</th>
                      <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 print:text-black whitespace-nowrap">المبلغ</th>
                      <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 print:text-black whitespace-nowrap">النوع</th>
                      <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 print:text-black whitespace-nowrap">البيان/الشهر</th>
                      <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 print:text-black whitespace-nowrap">رقم الإيصال</th>
                      <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 print:text-black whitespace-nowrap">طريقة الدفع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                    {fees.map(fee => (
                      <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 print-avoid-break">
                        <td className="px-3 py-1.5 font-mono text-[11px]">{new Date(fee.payment_date).toLocaleDateString('ar-EG')}</td>
                        <td className="px-3 py-1.5 font-extrabold text-amber-700 print:text-amber-800">{fee.amount} ج.م</td>
                        <td className="px-3 py-1.5 text-slate-700 print:text-black">اشتراك الشهر الدراسي</td>
                        <td className="px-3 py-1.5 text-slate-700 print:text-black font-bold">{fee.month || '-'}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-slate-500 print:text-slate-700">{fee.receipt_number || '-'}</td>
                        <td className="px-3 py-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 print:bg-slate-200 text-slate-700 print:text-black rounded text-[10px] font-bold">
                            {fee.payment_method === 'cash' ? 'نقدي' : fee.payment_method === 'card' ? 'فيزا' : 'تحويل'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100">لا توجد مدفوعات مسجلة.</p>
            )}
          </div>

          {/* Official Print Signatures & Footer */}
          <div className="hidden print:flex justify-between items-center border-t-2 border-slate-800 pt-4 mt-6 text-xs font-bold text-slate-800 print-avoid-break" dir="rtl">
            <div>توقيع ولي الأمر: ..............................</div>
            <div>المشرف الأكاديمي: ..............................</div>
            <div>خاتم وإدارة المركز: ..............................</div>
          </div>

        </div>
      </motion.div>
  );
}
