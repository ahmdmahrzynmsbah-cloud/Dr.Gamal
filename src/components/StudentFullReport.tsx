import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Attendance, ExamGrade, Exam, AssignmentGrade, Assignment, FeePayment, ClassRoom } from '../types';
import { samsDb } from '../utils/db';
import { X, Printer, Download, User, Calendar, BookOpen, CreditCard, CheckCircle, AlertCircle, Award, Target, Hash, Phone, Clock, Coins, Check, MessageSquare, Copy, ExternalLink, Send, FileText, Share2, FileDown, Loader2, ChevronDown, ChevronUp, CheckCircle2, GraduationCap } from 'lucide-react';
import { useSamsDbSync } from '../hooks/useSamsDbSync';
import { calculateStudentSubscription, isStudentEnrolledInCalendarMonth, formatShortDateArabic } from '../utils/subscriptionUtils';
import { formatEgyptianPhoneForWhatsApp } from '../utils/feeReminderService';
import { generateStudentReportPdf, downloadPdfBlob, GeneratedPdfResult } from '../utils/pdfGenerator';

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
  
  // Resolve actual system name (filter out generic legacy placeholders)
  const savedHeader = typeof window !== 'undefined' ? localStorage.getItem('sams_custom_header_title_v2') : null;
  const isInvalidHeader = !savedHeader || savedHeader.includes('المنصة التعليمية') || savedHeader.includes('منصة الإدارة') || savedHeader.includes('المنصة');
  const printHeaderTitle = isAlsafa 
    ? 'سيستم الصفا للمواد الشرعية' 
    : (isInvalidHeader ? 'الدكتور في اللغة العربية' : savedHeader);

  if (typeof window !== 'undefined' && isInvalidHeader && savedHeader) {
    try { localStorage.setItem('sams_custom_header_title_v2', printHeaderTitle); } catch (e) {}
  }

  const savedSubtitle = typeof window !== 'undefined' ? localStorage.getItem('sams_custom_header_subtitle_v2') : null;
  const isInvalidSubtitle = !savedSubtitle || savedSubtitle.includes('بوابة التحكم') || savedSubtitle.includes('الحصص الأكاديمية');
  const printHeaderSubtitle = isAlsafa 
    ? (isInvalidSubtitle ? 'المنظومة الأكاديمية للمواد الشرعية والعلوم الإسلامية' : savedSubtitle)
    : (isInvalidSubtitle ? 'التقرير الأكاديمي الشامل وكشف المتابعة المطبوع' : savedSubtitle);

  if (typeof window !== 'undefined' && isInvalidSubtitle && savedSubtitle) {
    try { localStorage.setItem('sams_custom_header_subtitle_v2', printHeaderSubtitle); } catch (e) {}
  }

  const printHeaderContact = localStorage.getItem('sams_custom_header_contact_v2') || '';
  const printHeaderLogo = localStorage.getItem('sams_custom_app_logo_v2') || '';
  const [logoImgError, setLogoImgError] = useState(false);

  const attPresent = attendance.filter(a => a.status === 'present').length;
  const attAbsent = attendance.filter(a => a.status === 'absent').length;
  const attExcused = attendance.filter(a => a.status === 'excused').length;
  const totalAtt = attendance.length;
  const attRate = totalAtt > 0 ? Math.round(((attPresent + attExcused) / totalAtt) * 100) : 0;

  const totalFeesPaid = fees.reduce((sum, f) => sum + f.amount, 0);

  // WhatsApp & PDF Report Dispatch States
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppPhone, setWhatsAppPhone] = useState(student.parent_phone || student.phone || '');
  const [whatsAppText, setWhatsAppText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState<GeneratedPdfResult | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [showTextDetails, setShowTextDetails] = useState(false);

  const generateReportMessage = () => {
    const centerTitle = printHeaderTitle;
    const signature = `#${printHeaderTitle.replace(/\s+/g, '_')}`;

    const todayStr = new Date().toLocaleDateString('ar-EG');
    const currentMonthName = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

    // 1. Attendance stats
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const excusedCount = attendance.filter(a => a.status === 'excused').length;
    const totalCount = attendance.length;
    const attendancePercentage = totalCount > 0 ? Math.round(((presentCount + excusedCount) / totalCount) * 100) : 0;

    // 2. Financial calculation
    const subOverview = calculateStudentSubscription(student, fees, 250);
    const remainingText = subOverview.totalRemainingDebt > 0
      ? `المبلغ المتبقي المستحق: ${subOverview.totalRemainingDebt} ج.م`
      : 'تم سداد كافة المستحقات بالكامل';

    // 3. Exam summary
    let examsSummary = '';
    if (examGrades.length > 0) {
      const recentExams = examGrades.slice(0, 5);
      examsSummary = recentExams.map(eg => {
        const examDate = new Date(eg.exam.date).toLocaleDateString('ar-EG');
        if (eg.absent) {
          return `• ${eg.exam.name} (${examDate}): غائب عن الامتحان`;
        }
        return `• ${eg.exam.name} (${examDate}): ${eg.score} من ${eg.exam.max_score} درجة`;
      }).join('\n');
    } else {
      examsSummary = '• لا توجد امتحانات مسجلة حتى الآن.';
    }

    // 4. Assignments summary
    let assignmentsSummary = '';
    if (assignmentGrades.length > 0) {
      const completedCount = assignmentGrades.filter(a => a.completed).length;
      const rate = Math.round((completedCount / assignmentGrades.length) * 100);
      const recentAssignments = assignmentGrades.slice(0, 4);
      assignmentsSummary = `نسبة إنجاز الواجبات: ${rate}%\n` + recentAssignments.map(ag => {
        const statusText = ag.completed ? 'تم التسليم' : 'لم يسلم';
        return `• ${ag.assignment.title}: ${statusText}`;
      }).join('\n');
    } else {
      assignmentsSummary = '• لا توجد واجبات مسجلة.';
    }

    return `السلام عليكم ورحمة الله وبركاته
السيد ولي أمر الطالب/ة: *${student.name}* (${student.parent_name || 'المحترم'})

تحية طيبة وبعد من إدارة *${centerTitle}*

التقرير الأكاديمي الشامل وكشف المتابعة:
• اسم الطالب: ${student.name}
• رقم القيد: ${student.registration_id}
• المجموعة: ${classInfo ? `${classInfo.name} (${classInfo.education_type || 'عام'})` : student.class_id || '-'}
• السنة الدراسية: ${student.grade_level}
• تاريخ إصدار التقرير: ${todayStr}

----------------------------------
1. سجل الحضور والغياب (لشهر ${currentMonthName}):
• نسبة الحضور: ${attendancePercentage}%
• عدد أيام الحضور: ${presentCount} يوم
• عدد أيام الغياب: ${absentCount} يوم
• عدد أيام الاستئذان: ${excusedCount} يوم

----------------------------------
2. الموقف المالي والاشتراكات:
• إجمالي المسدد: ${subOverview.totalPaid} ج.م
• ${remainingText}
• دورة الاشتراك الحالية: ${subOverview.currentCycle.label} (${subOverview.currentCycle.periodLabel})

----------------------------------
3. نتائج الامتحانات:
${examsSummary}

----------------------------------
4. التكليفات والواجبات المنزلية:
${assignmentsSummary}

----------------------------------
شاكرين لكم حسن تعاونكم ومتابعتكم المستمرة لمستوى الطالب.

${signature}`;
  };

  // Ensure high-resolution PDF is generated and ready
  const ensurePdfGenerated = async (force = false): Promise<GeneratedPdfResult | null> => {
    if (pdfResult && !force) return pdfResult;
    setIsGeneratingPdf(true);
    setPdfError('');
    try {
      const res = await generateStudentReportPdf(student);
      setPdfResult(res);
      return res;
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      setPdfError(err?.message || 'تعذر توليد ملف الـ PDF تلقائياً.');
      return null;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenWhatsAppModal = () => {
    const text = generateReportMessage();
    setWhatsAppText(text);
    setWhatsAppPhone(student.parent_phone || student.phone || '');
    setPhoneError('');
    setSendSuccessMsg('');
    setPdfError('');
    setCopiedSuccess(false);
    setShowWhatsAppModal(true);
    // Pre-generate PDF in background for immediate readiness
    ensurePdfGenerated();
  };

  const handleCopyMessage = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(whatsAppText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = whatsAppText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (err) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  // 1. Direct PDF Download
  const handleDownloadPdfOnly = async () => {
    setPdfError('');
    const res = await ensurePdfGenerated();
    if (res) {
      downloadPdfBlob(res.blob, res.filename);
      setSendSuccessMsg(`تم تنزيل ملف (${res.filename}) على جهازك بنجاح.`);
    }
  };

  // 2. Send / Share PDF via WhatsApp
  const handleSendPdfToWhatsApp = async () => {
    const rawPhone = whatsAppPhone.trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (!rawPhone || rawPhone === 'لا يوجد' || rawPhone === 'غير متوفر' || digitsOnly.length < 8) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح لولي الأمر (11 رقم).');
      return;
    }
    setPhoneError('');

    const res = await ensurePdfGenerated();
    if (!res) {
      setPhoneError('تعذر تجهيز ملف الـ PDF. يرجى المحاولة ثانية.');
      return;
    }

    const cleanPhone = formatEgyptianPhoneForWhatsApp(rawPhone);
    const cleanStudentName = (student.name || 'طالب').trim();
    const introText = `السلام عليكم ورحمة الله وبركاته،\nالسيد ولي أمر الطالب/ة: *${cleanStudentName}*\nمرفق لسيادتكم: *تقرير الطالب ${cleanStudentName}* (ملف PDF رسمي معتمد) الصادر بتاريخ ${new Date().toLocaleDateString('ar-EG')}.\n\n#${printHeaderTitle.replace(/\s+/g, '_')}`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(introText)}`;

    // Log notification in system
    samsDb.addNotification({
      title: `إرسال تقرير PDF: ${student.name}`,
      message: `تم تجهيز ملف التقرير PDF وإرساله لولي الأمر على الرقم (${rawPhone}).`,
      category: 'sms',
      recipient_type: 'specific',
      recipient_id: student.id
    }, { silent: true });

    // Try native Web Share with file first (works on mobile phones with WhatsApp installed)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [res.file] })) {
      try {
        await navigator.share({
          files: [res.file],
          title: `تقرير الطالب: ${student.name}`,
          text: introText
        });
        setSendSuccessMsg('تمت مشاركة ملف التقرير PDF بنجاح.');
        return;
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return; // user cancelled share modal
        }
      }
    }

    // Fallback for desktop & browsers without native file sharing:
    // 1. Download the PDF directly so it's ready in the user's downloads folder
    downloadPdfBlob(res.blob, res.filename);

    // 2. Open WhatsApp Web / App with the parent's chat
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setSendSuccessMsg(`تم تنزيل ملف التقرير (${res.filename}) على جهازك وفتح محادثة ولي الأمر على واتساب بنجاح! يمكنك إرفاق ملف الـ PDF مباشرة.`);
  };

  // 3. Direct Native Share Sheet (For Mobile Phones)
  const handleShareNative = async () => {
    setPhoneError('');
    setPdfError('');
    const res = await ensurePdfGenerated();
    if (!res) {
      setPhoneError('تعذر تجهيز ملف الـ PDF.');
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [res.file] })) {
          await navigator.share({
            files: [res.file],
            title: `تقرير الطالب: ${student.name}`,
            text: `مرفق تقرير الطالب ${student.name} - ملف PDF رسمي`
          });
          setSendSuccessMsg('تمت مشاركة الملف بنجاح.');
          return;
        } else {
          await navigator.share({
            title: `تقرير الطالب: ${student.name}`,
            text: whatsAppText || `تقرير الطالب ${student.name}`
          });
          return;
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }

    // Fallback: download
    downloadPdfBlob(res.blob, res.filename);
    setSendSuccessMsg(`تم تنزيل ملف (${res.filename}) على هاتفك.`);
  };

  // 4. Fallback: Send summary text message only
  const handleSendTextOnly = () => {
    const rawPhone = whatsAppPhone.trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (!rawPhone || rawPhone === 'لا يوجد' || rawPhone === 'غير متوفر' || digitsOnly.length < 8) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح لولي الأمر (11 رقم).');
      return;
    }
    setPhoneError('');
    const cleanPhone = formatEgyptianPhoneForWhatsApp(rawPhone);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppText)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setSendSuccessMsg('تم فتح محادثة واتساب بنجاح.');
  };

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
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            type="button"
            onClick={handleOpenWhatsAppModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
            title="إرسال التقرير كـ PDF لولي الأمر عبر واتساب"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>إرسال التقرير PDF (واتساب)</span>
          </button>

          <button 
            type="button"
            onClick={handleDownloadPdfOnly}
            disabled={isGeneratingPdf}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#0D5C8C] hover:bg-[#0a486e] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            title="تحميل ملف التقرير كـ PDF"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <FileDown className="w-4 h-4 shrink-0" />}
            <span>تحميل PDF</span>
          </button>

          <button 
            type="button"
            onClick={handlePrint} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
            title="طباعة التقرير أو حفظه كـ PDF عبر المتصفح"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>طباعة / معاينة</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div id="printable-group-roster" className="flex-1 p-3 sm:p-5 space-y-6 print:space-y-0 bg-slate-100/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100">
          
          {/* =========================================================
              PAGE 1: ACADEMIC PERFORMANCE, ATTENDANCE, EXAMS & ASSIGNMENTS
              ========================================================= */}
          <div className="report-page report-page-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 print:p-0 print:border-none print:shadow-none space-y-4 print:space-y-3.5 flex flex-col justify-between">
            
            <div>
              {/* Official Printable Header */}
              <div className="border-b-2 border-slate-300 dark:border-slate-700 pb-2.5 mb-3 flex justify-between items-center print-avoid-break">
                <div className="flex items-center gap-3">
                  {printHeaderLogo && (printHeaderLogo.startsWith('data:image') || printHeaderLogo.startsWith('http') || printHeaderLogo.startsWith('/')) && !logoImgError ? (
                    <img 
                      src={printHeaderLogo} 
                      alt="شعار السنتر" 
                      onError={() => setLogoImgError(true)}
                      className="w-13 h-13 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0" 
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ring-2 ${
                      isAlsafa ? 'bg-emerald-600 text-white ring-emerald-500/20' : 'bg-[#0D5C8C] text-white ring-[#0D5C8C]/20'
                    }`}>
                      {printHeaderLogo && printHeaderLogo.length <= 4 ? (
                        <span className="text-lg font-black font-sans">{printHeaderLogo}</span>
                      ) : isAlsafa ? (
                        <BookOpen className="w-6 h-6" />
                      ) : (
                        <GraduationCap className="w-6 h-6" />
                      )}
                    </div>
                  )}
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 leading-tight">{printHeaderTitle}</h1>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{printHeaderSubtitle}</p>
                    {printHeaderContact && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">{printHeaderContact}</p>}
                  </div>
                </div>

                <div className="text-center px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl shrink-0">
                  <span className="text-xs font-black text-[#0D5C8C] dark:text-sky-400 block">كشف المتابعة والتقييم</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
              
              {/* Section 1: Personal Info & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-2.5 print-section print-avoid-break mb-3">
                {/* Info Card */}
                <div className="md:col-span-1 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2.5 flex items-center gap-2 text-xs">
                    <Hash className="w-3.5 h-3.5 text-[#1A7FAA] dark:text-sky-400" />
                    البيانات الأساسية للطالب
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">اسم الطالب</span><span className="font-bold text-slate-900 dark:text-slate-100">{student.name}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">رقم القيد</span><span className="font-mono font-bold text-[#0D5C8C] dark:text-sky-400">{student.registration_id}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">المجموعة</span><span className="font-bold text-[#1A7FAA] dark:text-sky-400">{classInfo ? `${classInfo.name} (${classInfo.education_type || 'عام'})` : '-'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">السنة الدراسية</span><span className="font-bold text-slate-800 dark:text-slate-200">{student.grade_level}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">تاريخ التسجيل</span><span className="text-slate-700 dark:text-slate-300">{new Date(student.created_at).toLocaleDateString('ar-EG')}</span></div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">ولي الأمر</span>
                      <div className="text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">{student.parent_name || 'غير مدون'}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end text-[11px]"><Phone className="w-2.5 h-2.5"/> {student.parent_phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="md:col-span-2 print:col-span-2 grid grid-cols-2 gap-2 print:gap-2">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 print:bg-emerald-50 border border-emerald-200 dark:border-emerald-800 print:border-emerald-300 rounded-xl p-2.5 print:p-2 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-emerald-900 dark:text-emerald-300 print:text-emerald-950 font-bold text-xs flex items-center gap-1"><Target className="w-3.5 h-3.5"/> نسبة الحضور</h4>
                      <span className="text-lg font-black text-emerald-700 print:text-emerald-800">{attRate}%</span>
                    </div>
                    <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-0.5">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{width: `${attRate}%`}}></div>
                    </div>
                    <div className="flex gap-2.5 mt-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      <span>حاضر: {attPresent}</span>
                      <span>غائب: {attAbsent}</span>
                      <span>مستأذن: {attExcused}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/40 print:bg-amber-50 border border-amber-200 dark:border-amber-800 print:border-amber-300 rounded-xl p-2.5 print:p-2 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-amber-900 dark:text-amber-300 print:text-amber-950 font-bold text-xs flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> إجمالي المدفوعات</h4>
                    </div>
                    <p className="text-lg font-black text-amber-700 print:text-amber-800 font-mono">{totalFeesPaid.toLocaleString()} <span className="text-xs font-sans font-bold">ج.م</span></p>
                    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300">المسدد منذ تاريخ الالتحاق</p>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-950/40 print:bg-indigo-50 border border-indigo-200 dark:border-indigo-800 print:border-indigo-300 rounded-xl p-2.5 print:p-2 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-indigo-900 dark:text-indigo-300 print:text-indigo-950 font-bold text-xs flex items-center gap-1"><Award className="w-3.5 h-3.5"/> الامتحانات</h4>
                    </div>
                    <p className="text-base font-black text-indigo-700 print:text-indigo-800">{examGrades.length} <span className="text-xs font-bold">امتحان</span></p>
                    <p className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300">تم رصد درجاتها وتقييمها</p>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-950/40 print:bg-sky-50 border border-sky-200 dark:border-sky-800 print:border-sky-300 rounded-xl p-2.5 print:p-2 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sky-900 dark:text-sky-300 print:text-sky-950 font-bold text-xs flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> التكليفات والواجبات</h4>
                    </div>
                    <p className="text-base font-black text-sky-700 print:text-sky-800">{assignmentGrades.length} <span className="text-xs font-bold">تكليف</span></p>
                    <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300">نسبة التسليم: {assignmentGrades.length > 0 ? Math.round((assignmentGrades.filter(a => a.completed).length / assignmentGrades.length)*100) : 0}%</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Attendance History */}
              <div className="print-section print-avoid-break mb-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 print:text-black mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1A7FAA] dark:text-sky-400 print:text-[#1A7FAA]" />
                  <span>سجل الحضور والغياب (لشهر {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })})</span>
                </h3>
                {attendance.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 print:grid-cols-6 gap-1.5 print:gap-1.5">
                    {attendance.map(att => (
                      <div key={att.id} className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 ${
                        att.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-950/40 print:bg-emerald-50 border-emerald-300 dark:border-emerald-800 print:border-emerald-400' :
                        att.status === 'absent' ? 'bg-rose-50 dark:bg-rose-950/40 print:bg-rose-50 border-rose-300 dark:border-rose-800 print:border-rose-400' :
                        'bg-amber-50 dark:bg-amber-950/40 print:bg-amber-50 border-amber-300 dark:border-amber-800 print:border-amber-400'
                      }`}>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 print:text-black">{new Date(att.date).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          att.status === 'present' ? 'bg-emerald-200 text-emerald-900 print:bg-emerald-100 print:text-emerald-900' :
                          att.status === 'absent' ? 'bg-rose-200 text-rose-900 print:bg-rose-100 print:text-rose-900' :
                          'bg-amber-200 text-amber-900 print:bg-amber-100 print:text-amber-900'
                        }`}>
                          {att.status === 'present' ? 'حاضر' : att.status === 'absent' ? 'غائب' : 'مستأذن'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic p-2.5 bg-slate-50 dark:bg-slate-900/50 print:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-700">لا توجد سجلات حضور مسجلة لهذا الطالب خلال الشهر الحالي.</p>
                )}
              </div>

              {/* Section 3: Exams & Assignments Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2.5 print-section print-avoid-break">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>سجل نتائج الامتحانات</span>
                  </h3>
                  {examGrades.length > 0 ? (
                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto">
                      {examGrades.slice(0, 5).map(eg => (
                        <div key={eg.id} className="flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs print-avoid-break">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{eg.exam.name}</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">{new Date(eg.exam.date).toLocaleDateString('ar-EG')} • {eg.exam.type}</p>
                          </div>
                          <div className="text-left">
                            {eg.absent ? (
                              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-0.5 rounded">غائب</span>
                            ) : (
                              <p className="font-black text-indigo-700 dark:text-indigo-400 text-xs font-mono">{eg.score} <span className="text-[9px] text-slate-400 font-medium font-sans">/ {eg.exam.max_score}</span></p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">لا توجد درجات امتحانات مسجلة.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>سجل التكليفات والواجبات</span>
                  </h3>
                  {assignmentGrades.length > 0 ? (
                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto">
                      {assignmentGrades.slice(0, 5).map(ag => (
                        <div key={ag.id} className="flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs print-avoid-break">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{ag.assignment.title}</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">الاستلام: {new Date(ag.assignment.due_date).toLocaleDateString('ar-EG')}</p>
                          </div>
                          <div className="text-left">
                            {ag.completed ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                                سلم
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-0.5 rounded">
                                لم يسلم
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">لا توجد تكليفات مسجلة.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Page 1 Bottom Footer Bar */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-3 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 print-avoid-break">
              <span>صفحة (1 من 2) • كشف الأداء والمتابعة الأكاديمية</span>
              <span>{new Date().toLocaleDateString('ar-EG')}</span>
            </div>

          </div>

          {/* =========================================================
              PAGE 2: FINANCIAL STATEMENT, SUBSCRIPTION MAP, RECEIPTS & SIGNATURES
              ========================================================= */}
          <div className="report-page report-page-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 print:p-0 print:border-none print:shadow-none space-y-4 print:space-y-3.5 flex flex-col justify-between">
            
            <div>
              {/* Official Header for Page 2 */}
              <div className="border-b-2 border-slate-300 dark:border-slate-700 pb-2.5 mb-3 flex justify-between items-center print-avoid-break">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                    isAlsafa ? 'bg-emerald-600 text-white' : 'bg-[#0D5C8C] text-white'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 leading-tight">
                      {printHeaderTitle} - كشف الاشتراكات وسجل الموقف المالي
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      بيان تفصيلي بالمبالغ المسددة، خريطة الشهور الدراسية، والاشتراك المالي
                    </p>
                  </div>
                </div>

                <div className="text-left px-3 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl shrink-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block">{student.name}</span>
                  <span className="text-[10px] text-[#0D5C8C] dark:text-sky-400 font-mono font-bold">#{student.registration_id}</span>
                </div>
              </div>

              {/* Section 1 & 2: Financial Overview & 12-Month Matrix */}
              {(() => {
                const subOverview = calculateStudentSubscription(student, fees, 250);
                return (
                  <div className="space-y-3 mb-3">
                    {/* Subscription Summary Banner */}
                    <div className="bg-gradient-to-l from-slate-50 to-sky-50/50 dark:from-slate-900/60 dark:to-sky-950/30 print:bg-slate-50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 print:border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs print-avoid-break">
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
                          دورة الاشتراك الحالية: <span className="font-bold text-slate-800 print:text-black">{subOverview.currentCycle.label}</span> ({subOverview.currentCycle.periodLabel})
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
                            {subOverview.totalRemainingDebt > 0 ? `${subOverview.totalRemainingDebt.toLocaleString()} ج.م` : 'لا يوجد متبقي'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 12-Month Academic Matrix (Starting August 2026 to July 2027) */}
                    <div className="bg-slate-50/70 dark:bg-slate-900/50 print:bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700 print:border-slate-300 print-avoid-break">
                      <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 print:text-black mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0D5C8C]" />
                        <span>خريطة سداد الشهور الأكاديمية (محسوبة وفق تاريخ تسجيل الطالب):</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 print:grid-cols-4 gap-1.5 print:gap-1.5">
                        {[
                          'أغسطس 2026', 'سبتمبر 2026', 'أكتوبر 2026',
                          'نوفمبر 2026', 'ديسمبر 2026', 'يناير 2027', 'فبراير 2027',
                          'مارس 2027', 'أبريل 2027', 'مايو 2027', 'يونيو 2027', 'يوليو 2027'
                        ].map((m, idx) => {
                          const payment = fees.find(f => f.month === m);
                          const isEnrolled = isStudentEnrolledInCalendarMonth(student, m);
                          const isCurrent = m === 'سبتمبر 2026';
                          const isPast = idx < 1; // August

                          if (payment) {
                            return (
                              <div
                                key={m}
                                className="bg-emerald-50 dark:bg-emerald-950/80 print:bg-emerald-50 border border-emerald-300 dark:border-emerald-700 print:border-emerald-400 rounded-lg p-1.5 flex flex-col justify-between shadow-2xs print-avoid-break"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-[10px] text-emerald-950 dark:text-emerald-200 print:text-emerald-950">{m.split(' ')[0]}</span>
                                  <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 flex items-center gap-0.5">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    <span>مدفوع</span>
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[9px] pt-1 border-t border-emerald-200 dark:border-emerald-800 print:border-emerald-300">
                                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 print:text-emerald-950">{payment.amount} ج.م</span>
                                  <span className="text-[8px] text-emerald-600 dark:text-emerald-400 print:text-emerald-700 font-mono">#{payment.receipt_number?.split('-').pop() || 'تم'}</span>
                                </div>
                              </div>
                            );
                          }

                          if (!isEnrolled) {
                            return (
                              <div
                                key={m}
                                className="bg-slate-100/50 dark:bg-slate-800/30 print:bg-slate-100/60 border border-slate-200 dark:border-slate-700/50 print:border-slate-300 rounded-lg p-1.5 flex flex-col justify-between opacity-60 print-avoid-break"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[10px] text-slate-500 print:text-slate-600">{m.split(' ')[0]}</span>
                                  <span className="text-[8px] text-slate-400 print:text-slate-500">غير مسجل</span>
                                </div>
                                <div className="mt-1 text-[8px] text-slate-400 print:text-slate-500 pt-0.5 border-t border-slate-200 print:border-slate-300">
                                  قبل الالتحاق
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
                                className="bg-sky-50 dark:bg-sky-950/80 print:bg-sky-50 border border-sky-300 dark:border-sky-700 print:border-sky-400 rounded-lg p-1.5 flex flex-col justify-between shadow-2xs print-avoid-break"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-[10px] text-sky-950 dark:text-sky-200 print:text-sky-950">{m.split(' ')[0]}</span>
                                  <span className="text-[8px] font-bold text-sky-700 dark:text-sky-300 print:text-sky-800 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{isHalf ? 'نصف شهر' : 'شهر كامل'}</span>
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[9px] pt-1 border-t border-sky-200 dark:border-sky-800 print:border-sky-300 text-sky-800 print:text-sky-900">
                                  <span className="font-bold">{requiredFee} ج.م</span>
                                  <span className="text-[8px]">مستحق</span>
                                </div>
                              </div>
                            );
                          }

                          if (isPast) {
                            return (
                              <div
                                key={m}
                                className="bg-rose-50 dark:bg-rose-950/80 print:bg-rose-50 border border-rose-300 dark:border-rose-800 print:border-rose-400 rounded-lg p-1.5 flex flex-col justify-between shadow-2xs print-avoid-break"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-[10px] text-rose-950 dark:text-rose-200 print:text-rose-950">{m.split(' ')[0]}</span>
                                  <span className="text-[8px] font-bold text-rose-700 dark:text-rose-300 print:text-rose-800 flex items-center gap-0.5">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    <span>متأخر</span>
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[9px] pt-1 border-t border-rose-200 dark:border-rose-800 print:border-rose-300 text-rose-800 print:text-rose-900">
                                  <span className="font-bold">غير مسدد</span>
                                  <span className="text-[8px]">مطلوب التحصيل</span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={m}
                              className="bg-slate-100/60 dark:bg-slate-800/40 print:bg-slate-100 border border-slate-200 dark:border-slate-700/60 print:border-slate-300 rounded-lg p-1.5 flex flex-col justify-between opacity-70 print-avoid-break"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400 print:text-slate-700">{m.split(' ')[0]}</span>
                                <span className="text-[8px] text-slate-400 print:text-slate-500">قادم</span>
                              </div>
                              <div className="mt-1 text-[8px] text-slate-400 print:text-slate-500 pt-0.5 border-t border-slate-200 print:border-slate-300">
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

              {/* Section 3: Detailed Receipts & Payments Table */}
              <div className="print-section print-avoid-break mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>جدول إيصالات وسجل المدفوعات المسجلة</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    عدد الإيصالات: {fees.length}
                  </span>
                </div>

                {fees.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-700 print:border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-right border-collapse text-xs print:text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-[11px]">
                          <th className="px-3 py-1.5 whitespace-nowrap">تاريخ السداد</th>
                          <th className="px-3 py-1.5 whitespace-nowrap">المبلغ</th>
                          <th className="px-3 py-1.5 whitespace-nowrap">البيان / الشهر</th>
                          <th className="px-3 py-1.5 whitespace-nowrap">رقم الإيصال</th>
                          <th className="px-3 py-1.5 whitespace-nowrap">طريقة الدفع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {fees.map(fee => (
                          <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 print-avoid-break">
                            <td className="px-3 py-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">{new Date(fee.payment_date).toLocaleDateString('ar-EG')}</td>
                            <td className="px-3 py-1.5 font-extrabold text-amber-700 dark:text-amber-400 font-mono">{fee.amount} ج.م</td>
                            <td className="px-3 py-1.5 text-slate-800 dark:text-slate-200 font-bold">{fee.month || 'اشتراك شهري'}</td>
                            <td className="px-3 py-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{fee.receipt_number || '-'}</td>
                            <td className="px-3 py-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold">
                                {fee.payment_method === 'cash' ? 'نقدي' : fee.payment_method === 'card' ? 'فيزا' : 'تحويل'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">لا توجد مدفوعات مسجلة.</p>
                )}
              </div>

              {/* Section 4: Official Signatures & Stamp Box */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/70 dark:bg-slate-900/50 print:bg-slate-50 print-avoid-break">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-800 dark:text-slate-200 print:text-black">
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">توقيع ولي الأمر</p>
                    <div className="border-b border-dotted border-slate-400 mx-3 pb-2"></div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">المشرف الأكاديمي</p>
                    <div className="border-b border-dotted border-slate-400 mx-3 pb-2"></div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">خاتم وإدارة المركز</p>
                    <div className="border-b border-dotted border-slate-400 mx-3 pb-2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 Bottom Footer Bar */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-3 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 print-avoid-break">
              <span>صفحة (2 من 2) • الموقف المالي وسجل السداد المعتمد</span>
              <span>{new Date().toLocaleDateString('ar-EG')}</span>
            </div>

          </div>

        </div>

        {/* WhatsApp Send Modal */}
        <AnimatePresence>
          {showWhatsAppModal && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[99999] animate-fade-in print:hidden" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full flex flex-col max-h-[85vh] overflow-hidden text-right"
              >
                {/* Modal Header */}
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>إرسال التقرير لولي الأمر</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          PDF رسمي
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {student.name} · {student.registration_id}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 font-sans text-xs">
                  {/* Success Alert */}
                  {sendSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div className="leading-relaxed">
                        {sendSuccessMsg}
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {pdfError && (
                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[11px] font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pdfError}</span>
                    </div>
                  )}

                  {/* 1. Official PDF Document Preview Card */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2.5 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-red-600/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block truncate" dir="rtl">
                          {pdfResult?.filename || `تقرير الطالب ${student.name}.pdf`}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                          {isGeneratingPdf ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>جاري إعداد الـ PDF...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>ملف ملون جاهز للإرسال</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadPdfOnly}
                        disabled={isGeneratingPdf}
                        className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="تحميل ملف PDF"
                      >
                        {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#0D5C8C]" />}
                        <span className="hidden sm:inline">تحميل</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="طباعة"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        <span className="hidden sm:inline">طباعة</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Recipient Phone */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>رقم واتساب ولي الأمر:</span>
                      </label>
                      <div className="flex items-center gap-1 text-[10px]">
                        {student.parent_phone && (
                          <button
                            type="button"
                            onClick={() => {
                              setWhatsAppPhone(student.parent_phone);
                              setPhoneError('');
                            }}
                            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              whatsAppPhone === student.parent_phone
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ولي الأمر
                          </button>
                        )}
                        {student.phone && student.phone !== student.parent_phone && (
                          <button
                            type="button"
                            onClick={() => {
                              setWhatsAppPhone(student.phone);
                              setPhoneError('');
                            }}
                            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              whatsAppPhone === student.phone
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            الطالب
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="tel"
                      dir="ltr"
                      value={whatsAppPhone}
                      onChange={(e) => {
                        setWhatsAppPhone(e.target.value);
                        setPhoneError('');
                      }}
                      placeholder="01012345678"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-mono text-center tracking-wider"
                    />
                    {phoneError && (
                      <p className="text-[10px] font-bold text-red-600 dark:text-red-400">
                        {phoneError}
                      </p>
                    )}
                  </div>

                  {/* 3. Collapsible Text Summary */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowTextDetails(!showTextDetails)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>عرض نص الرسالة المرفق (اختياري)</span>
                      {showTextDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showTextDetails && (
                      <div className="p-2.5 bg-white dark:bg-slate-800 space-y-1.5 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            نص التقرير:
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyMessage}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            {copiedSuccess ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSuccess ? 'تم النسخ' : 'نسخ النص'}</span>
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={whatsAppText}
                          onChange={(e) => setWhatsAppText(e.target.value)}
                          className="w-full p-2 text-[11px] leading-relaxed bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-sans resize-y"
                          placeholder="نص التقرير..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppModal(false)}
                      className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-colors text-center"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleShareNative}
                      disabled={isGeneratingPdf}
                      className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      title="مشاركة عبر التطبيقات"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>مشاركة</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendPdfToWhatsApp}
                    disabled={isGeneratingPdf}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                        <span>جاري التجهيز...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 shrink-0" />
                        <span>إرسال التقرير PDF لولي الأمر (واتساب)</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}
