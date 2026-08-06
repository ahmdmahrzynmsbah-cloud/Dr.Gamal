/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Exam, Assignment, ExamGrade, AssignmentGrade, Student, ClassRoom, Attendance } from '../types';
import { samsDb } from '../utils/db';
import { 
  Check,
  X,
  Plus,
  Trash2,
  Edit,
  Save,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Award,
  Notebook,
  ListPlus,
  GraduationCap,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Printer,
  Download,
  FileText,
  Eye,
  Bot,
  Loader2,
  Copy,
  Share2,
  AlertTriangle,
  MessageCircle,
  Send,
  Smartphone,
  ExternalLink
, RefreshCw } from 'lucide-react';

export default function ExamsAndAssignments() {
  const [activeSubTab, setActiveSubTab] = useState<'grading' | 'exams' | 'assignments'>('grading');
  
  // Base data lists
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [examGrades, setExamGrades] = useState<ExamGrade[]>([]);
  const [assignmentGrades, setAssignmentGrades] = useState<AssignmentGrade[]>([]);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);

  // WhatsApp Alert Modal State for Absence Warnings
  const [whatsAppModalStudent, setWhatsAppModalStudent] = useState<{
    student: Student;
    count: number;
    dates: string[];
  } | null>(null);
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState<string>('');

  // Selected filters for grading
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [gradingType, setGradingType] = useState<'exam' | 'assignment'>('exam');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [termFilter, setTermFilter] = useState<'first_term' | 'second_term'>('first_term');

  // Input states for Exam creation/editing
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({
    name: '',
    type: 'quiz' as Exam['type'],
    max_score: 20,
    duration_mins: 30,
    date: new Date().toISOString().split('T')[0],
    class_id: '',
    term: 'first_term' as Exam['term']
  });

  // Input states for Assignment creation/editing
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    max_score: 10,
    due_date: new Date().toISOString().split('T')[0],
    class_id: '',
    term: 'first_term' as Assignment['term']
  });

  // Batch grading temp inputs
  // key is student_id, value is object with score, absent/completed, notes
  const [tempGrades, setTempGrades] = useState<Record<string, { score: number; flag: boolean; notes: string }>>({});
  const [isEditingSheet, setIsEditingSheet] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');

  const handleProcessAction = (text: string, onComplete: () => void) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingText(text);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 100) {
        progress = 100;
        setProcessingProgress(progress);
        clearInterval(interval);
        
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingProgress(0);
          setTimeout(() => {
            onComplete();
          }, 150);
        }, 200);
      } else {
        setProcessingProgress(progress);
      }
    }, 80);
  };

  // Search queries for lists
  const [examSearch, setExamSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // Deletion modals state
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

     
  // Notifications feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Load all initial data from Database
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const allClasses = samsDb.getClasses();
    const allStudents = samsDb.getStudents();
    const allExams = samsDb.getExams();
    const allAssignments = samsDb.getAssignments();
    const allExamGrades = samsDb.getExamGrades();
    const allAssignmentGrades = samsDb.getAssignmentGrades();
    const allAttendance = samsDb.getAttendance();

    setClasses(allClasses);
    setStudents(allStudents);
    setExams(allExams);
    setAssignments(allAssignments);
    setExamGrades(allExamGrades);
    setAssignmentGrades(allAssignmentGrades);
    setAttendanceList(allAttendance);

    // Auto set defaults if not set yet
    if (allClasses.length > 0) {
      if (!selectedClassId) setSelectedClassId(allClasses[0].id);
      if (!examForm.class_id) setExamForm(prev => ({ ...prev, class_id: allClasses[0].id }));
      if (!assignmentForm.class_id) setAssignmentForm(prev => ({ ...prev, class_id: allClasses[0].id }));
    }
  };

  // Helper to calculate student monthly absences across attendance & exam records
  const getStudentMonthlyAbsences = (studentId: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const absentDates = new Set<string>();

    // 1. Attendance records for current month
    attendanceList.forEach(att => {
      if (att.student_id === studentId && att.status === 'absent') {
        if (!att.date || att.date.startsWith(currentMonthPrefix)) {
          absentDates.add(att.date || 'تاريخ غياب آخر');
        }
      }
    });

    // 2. Exam absences for current month
    examGrades.forEach(eg => {
      if (eg.student_id === studentId && eg.absent) {
        const exam = exams.find(e => e.id === eg.exam_id);
        if (!exam || !exam.date || exam.date.startsWith(currentMonthPrefix)) {
          absentDates.add(exam ? `${exam.date} (${exam.name})` : 'امتحان غياب');
        }
      }
    });

    return {
      count: absentDates.size,
      dates: Array.from(absentDates)
    };
  };

  // Students in active group who missed 3 or more times this month
  const frequentAbsenceStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const classStudents = students.filter(s => s.class_id === selectedClassId && s.status === 'active');
    return classStudents
      .map(student => {
        const { count, dates } = getStudentMonthlyAbsences(student.id);
        return { student, count, dates };
      })
      .filter(item => item.count >= 3);
  }, [students, selectedClassId, attendanceList, examGrades, exams]);

  // Open WhatsApp Modal for a student
  const handleOpenWhatsAppModal = (student: Student, count: number, dates: string[]) => {
    const currentClass = classes.find(c => c.id === selectedClassId);
    const groupName = currentClass ? currentClass.name : 'المجموعة الدراسية';

    const defaultMsg = `السلام عليكم ورحمة الله وبركاته،
ولي أمر الطالب/ة المحترم: ${student.name}
تحية طيبة وبعد من نظام الدكتور للغة العربية (SAMS)،

نحيط سيادتكم علماً بتكرار غياب الطالب/ة عن الحصص والتقييمات بمجموعة (${groupName}) لأكثر من 3 مرات خلال هذا الشهر (إجمالي الغياب حتى الآن: ${count} مرات).

حرصاً على المستوى الأكاديمي والتحصيل لـ (${student.name}) في مادة اللغة العربية، يرجى التكرم بانتظام الطالب والتواصل مع إدارة المركز.

شاكرين لسيادتكم حسن التعاون.`;

    setCustomWhatsAppMsg(defaultMsg);
    setWhatsAppModalStudent({ student, count, dates });
  };

  // Dispatch WhatsApp web link
  const handleSendWhatsAppDirect = (student: Student, count: number, customText?: string) => {
    const parentPhone = student.parent_phone || student.phone || '';
    if (!parentPhone) {
      setErrorMsg(`عذراً، لم يتم تسجيل رقم هاتف لولي أمر الطالب (${student.name}).`);
      return;
    }

    const cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;

    const currentClass = classes.find(c => c.id === selectedClassId);
    const groupName = currentClass ? currentClass.name : 'المجموعة الدراسية';

    const textToSend = customText || `السلام عليكم ورحمة الله وبركاته،
إلى ولي أمر الطالب/ة: ${student.name}
تحية طيبة وبعد من إدارة المركز،

نود إحاطتكم بتكرار غياب الطالب/ة بمجموعة (${groupName}) لأكثر من 3 مرات في هذا الشهر (إجمالي الغياب: ${count} مرات). يرجى المتابعة لضمان تحصيل المنهج.`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');

    samsDb.addAdminNotification({
      type: 'absence',
      message: `تم توجيه تنبيه واتساب مباشر لولي أمر الطالب (${student.name}) لتكرار الغياب (${count} مرات هذا الشهر).`,
      metadata: { student_id: student.id }
    });

    setSuccessMsg(`تم فتح الواتساب المباشر لولي أمر الطالب (${student.name}).`);
    setWhatsAppModalStudent(null);
  };

  // When changing filters, update default evaluations and load student grading sheets
  const availableEvaluations = useMemo(() => {
    if (gradingType === 'exam') {
      return exams.filter(e => e.class_id === selectedClassId && e.term === termFilter);
    } else {
      return assignments.filter(a => a.class_id === selectedClassId && a.term === termFilter);
    }
  }, [exams, assignments, selectedClassId, gradingType, termFilter]);

  // Handle setting active evaluation ID automatically when the list of available ones changes
  useEffect(() => {
    if (availableEvaluations.length > 0) {
      // Keep selected if still valid, else select first
      const exists = availableEvaluations.some(e => e.id === selectedEvaluationId);
      if (!exists) {
        setSelectedEvaluationId(availableEvaluations[0].id);
      }
    } else {
      setSelectedEvaluationId('');
    }
  }, [availableEvaluations, selectedEvaluationId]);

  // Populate temp grades state when active evaluation or group changes
  useEffect(() => {
    if (!selectedEvaluationId) {
      setTempGrades({});
      setIsEditingSheet(false);
      return;
    }

    const groupStudents = students.filter(s => s.class_id === selectedClassId);
    const initialTemp: Record<string, { score: number; flag: boolean; notes: string }> = {};
    let hasSavedGrades = false;

    if (gradingType === 'exam') {
      groupStudents.forEach(student => {
        const existing = examGrades.find(eg => eg.exam_id === selectedEvaluationId && eg.student_id === student.id);
        if (existing) {
          hasSavedGrades = true;
        }
        initialTemp[student.id] = {
          score: existing ? existing.score : 0,
          flag: existing ? existing.absent : false, // absent status
          notes: existing ? (existing.teacher_notes || '') : ''
        };
      });
    } else {
      groupStudents.forEach(student => {
        const existing = assignmentGrades.find(ag => ag.assignment_id === selectedEvaluationId && ag.student_id === student.id);
        if (existing) {
          hasSavedGrades = true;
        }
        initialTemp[student.id] = {
          score: existing ? existing.score : 0,
          flag: existing ? existing.completed : false, // completed status
          notes: existing ? (existing.teacher_notes || '') : ''
        };
      });
    }

    setTempGrades(initialTemp);
    setIsEditingSheet(!hasSavedGrades);
  }, [selectedEvaluationId, selectedClassId, gradingType, students, examGrades, assignmentGrades]);

  const activeEvaluationObj = useMemo(() => {
    if (gradingType === 'exam') {
      return exams.find(e => e.id === selectedEvaluationId);
    } else {
      return assignments.find(a => a.id === selectedEvaluationId);
    }
  }, [selectedEvaluationId, gradingType, exams, assignments]);

  const getScoreBadge = (score: number, maxScore: number, flag: boolean) => {
    if (gradingType === 'exam' && flag) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          غائب 🔴
        </span>
      );
    }
    if (gradingType === 'assignment' && !flag) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          لم يسلم ❌
        </span>
      );
    }

    const missed = maxScore - score;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    if (missed <= 3 && score > maxScore / 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {score} / {maxScore} (ممتاز ✨)
        </span>
      );
    } else if (percentage <= 50) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {score} / {maxScore} (ضعيف ⚠️)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {score} / {maxScore} (متوسط 👍)
        </span>
      );
    }
  };

  // Create or Update Exam
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!examForm.name.trim()) {
      setErrorMsg('فضلاً، أدخل اسم الامتحان.');
      return;
    }

    if (examForm.max_score <= 0) {
      setErrorMsg('الدرجة العظمى للامتحان يجب أن تكون أكبر من صفر.');
      return;
    }

    const examData: Exam = {
      id: editingExamId || `ex-${Date.now()}`,
      name: examForm.name,
      type: examForm.type,
      max_score: Number(examForm.max_score),
      duration_mins: Number(examForm.duration_mins),
      date: examForm.date,
      class_id: examForm.class_id,
      term: examForm.term
    };

    samsDb.saveExam(examData);
    setSuccessMsg(editingExamId ? 'تم تحديث بيانات الامتحان بنجاح!' : 'تم إضافة الامتحان الجديد بنجاح!');
    setEditingExamId(null);
    setExamForm({
      name: '',
      type: 'quiz',
      max_score: 20,
      duration_mins: 30,
      date: new Date().toISOString().split('T')[0],
      class_id: classes[0]?.id || '',
      term: 'first_term'
    });
    loadAllData();
  };

  // Edit Exam trigger
  const handleEditExamClick = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      name: exam.name,
      type: exam.type,
      max_score: exam.max_score,
      duration_mins: exam.duration_mins,
      date: exam.date,
      class_id: exam.class_id,
      term: exam.term
    });
  };

  // Delete Exam
  const confirmDeleteExam = () => {
    if (examToDelete) {
      samsDb.deleteExam(examToDelete.id);
      
      setSuccessMsg('تم حذف الامتحان وسجل درجاته بنجاح!');
      setExamToDelete(null);
      loadAllData();
    }
  };

  // Create or Update Assignment
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!assignmentForm.title.trim()) {
      setErrorMsg('فضلاً، أدخل عنوان أو صفحات الواجب المطلوبة.');
      return;
    }

    if (assignmentForm.max_score <= 0) {
      setErrorMsg('الدرجة القصوى للواجب يجب أن تكون أكبر من صفر.');
      return;
    }

    const assignmentData: Assignment = {
      id: editingAssignmentId || `as-${Date.now()}`,
      title: assignmentForm.title,
      max_score: Number(assignmentForm.max_score),
      due_date: assignmentForm.due_date,
      class_id: assignmentForm.class_id,
      term: assignmentForm.term
    };

    samsDb.saveAssignment(assignmentData);
    setSuccessMsg(editingAssignmentId ? 'تم تحديث بيانات الواجب بنجاح!' : 'تم إضافة الواجب الدراسي بنجاح!');
    setEditingAssignmentId(null);
    setAssignmentForm({
      title: '',
      max_score: 10,
      due_date: new Date().toISOString().split('T')[0],
      class_id: classes[0]?.id || '',
      term: 'first_term'
    });
    loadAllData();
  };

  // Edit Assignment Trigger
  const handleEditAssignmentClick = (asg: Assignment) => {
    setEditingAssignmentId(asg.id);
    setAssignmentForm({
      title: asg.title,
      max_score: asg.max_score,
      due_date: asg.due_date,
      class_id: asg.class_id,
      term: asg.term
    });
  };

  // Delete Assignment
  const confirmDeleteAssignment = () => {
    if (assignmentToDelete) {
      samsDb.deleteAssignment(assignmentToDelete.id);

      setSuccessMsg('تم حذف الواجب وسجلات الطلاب بنجاح!');
      setAssignmentToDelete(null);
      loadAllData();
    }
  };

  // Save current sheet grades in bulk
  const handleSaveBulkGrades = () => {
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedEvaluationId || !activeEvaluationObj) {
      setErrorMsg('الرجاء اختيار امتحان أو واجب للرصد أولاً.');
      return;
    }

    const maxLimit = activeEvaluationObj.max_score;
    let hasValidationError = false;

    // First validate scores
    const groupStudents = students.filter(s => s.class_id === selectedClassId);
    for (const student of groupStudents) {
      const entry = tempGrades[student.id];
      if (entry) {
        if (!entry.flag && (entry.score < 0 || entry.score > maxLimit)) {
          setErrorMsg(`خطأ: الدرجة المدخلة للطالب (${student.name}) هي ${entry.score} وتتجاوز الحد الأقصى المسموح به لـ (${(activeEvaluationObj as any).name || (activeEvaluationObj as any).title}) وهو ${maxLimit} درجة.`);
          hasValidationError = true;
          break;
        }
      }
    }

    if (hasValidationError) return;

    // Save
    if (gradingType === 'exam') {
      groupStudents.forEach(student => {
        const entry = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
        samsDb.saveExamGrade({
          id: '',
          exam_id: selectedEvaluationId,
          student_id: student.id,
          score: entry.flag ? 0 : Number(entry.score),
          absent: entry.flag,
          teacher_notes: entry.notes
        });
      });
      setSuccessMsg(`تم رصد وحفظ درجات الامتحان (${(activeEvaluationObj as any).name}) لجميع طلاب المجموعة بنجاح!`);
    } else {
      groupStudents.forEach(student => {
        const entry = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
        samsDb.saveAssignmentGrade({
          id: '',
          assignment_id: selectedEvaluationId,
          student_id: student.id,
          score: entry.flag ? Number(entry.score) : 0, // if completed/flag, take score, else 0
          completed: entry.flag, // completed status
          teacher_notes: entry.notes
        });
      });
      setSuccessMsg(`تم رصد وحفظ تقييم واجب اليوم (${(activeEvaluationObj as any).title}) لجميع طلاب المجموعة بنجاح!`);
    }

    loadAllData();
    setIsEditingSheet(false);
  };

  // Bulk operation: Set all students to present/completed with full score
  const handleMarkAllPerfect = () => {
    if (!activeEvaluationObj) return;
    const maxVal = activeEvaluationObj.max_score;
    const updated = { ...tempGrades };
    
    Object.keys(updated).forEach(studentId => {
      updated[studentId] = {
        score: maxVal,
        flag: gradingType === 'assignment' ? true : false, // present for exam, completed for assignment
        notes: updated[studentId]?.notes || ''
      };
    });
    setTempGrades(updated);
    setSuccessMsg('تم ملء درجات جميع الطلاب افتراضياً بالدرجة الكاملة وحالة الحضور/التسليم النشطة!');
  };

  // Student list inside the active class
  const activeClassStudents = useMemo(() => {
    return students.filter(s => s.class_id === selectedClassId);
  }, [students, selectedClassId]);

  // Trigger print / export PDF of official student grade report sheet
  const triggerPrintPDF = () => {
    if (!activeEvaluationObj) return;
    setShowPrintModal(true);
  };

  const old_triggerPrintPDF_ignored = () => {
    if (!activeEvaluationObj) return;

    const centerName = 'الدكتور في اللغة العربية';
    const centerPhone = localStorage.getItem('sams_center_phone') || '';
    const centerLogo = localStorage.getItem('sams_center_logo') || '';
    const currentClass = classes.find(c => c.id === selectedClassId);
    const className = currentClass ? `${currentClass.name} (الصف: ${currentClass.grade_level})` : 'المجموعة المحددة';
    const evalTitle = gradingType === 'exam' ? (activeEvaluationObj as Exam).name : (activeEvaluationObj as Assignment).title;
    const maxScore = activeEvaluationObj.max_score;
    const termName = termFilter === 'first_term' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني';
    const evalTypeLabel = gradingType === 'exam'
      ? ({ quiz: 'امتحان حصة', comprehensive: 'امتحان شامل', monthly: 'اختبار شهري', midterm: 'منتصف الفصل', final: 'اختبار نهائي' }[(activeEvaluationObj as Exam).type] || 'اختبار مخصص')
      : 'واجب دراسي يومي';
    const evalDate = gradingType === 'exam' ? (activeEvaluationObj as Exam).date : (activeEvaluationObj as Assignment).due_date;

    const totalStudents = activeClassStudents.length;
    let presentCount = 0;
    let absentCount = 0;
    let totalScoreSum = 0;
    let highestScore = 0;

    const rowsHtml = activeClassStudents.map((student, idx) => {
      const tempObj = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
      const isAbsentOrMissing = gradingType === 'exam' ? tempObj.flag : !tempObj.flag;
      
      if (!isAbsentOrMissing) {
        presentCount++;
        totalScoreSum += tempObj.score;
        if (tempObj.score > highestScore) highestScore = tempObj.score;
      } else {
        absentCount++;
      }

      const pct = maxScore > 0 ? Math.round((tempObj.score / maxScore) * 100) : 0;
      let gradeLabel = 'ضعيف';
      if (!isAbsentOrMissing) {
        if (pct >= 90) gradeLabel = 'ممتاز ✨';
        else if (pct >= 80) gradeLabel = 'جيد جداً 👍';
        else if (pct >= 65) gradeLabel = 'جيد';
        else if (pct >= 50) gradeLabel = 'مقبول';
      } else {
        gradeLabel = gradingType === 'exam' ? 'غائب 🔴' : 'لم يسلم ❌';
      }

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; text-align: center;">
          <td style="padding: 9px 6px; font-weight: bold; color: #475569;">${idx + 1}</td>
          <td style="padding: 9px 6px; font-family: monospace; font-weight: bold; color: #0d5c8c;">${student.registration_id}</td>
          <td style="padding: 9px 6px; text-align: right; font-weight: bold; color: #0f172a;">${student.name}</td>
          <td style="padding: 9px 6px;">
            ${isAbsentOrMissing 
              ? `<span style="color: #dc2626; font-weight: bold; background: #fef2f2; padding: 2px 8px; border-radius: 4px;">${gradingType === 'exam' ? 'غائب' : 'لم يسلم'}</span>`
              : `<span style="color: #16a34a; font-weight: bold; background: #f0fdf4; padding: 2px 8px; border-radius: 4px;">${gradingType === 'exam' ? 'حاضر' : 'تم التسليم'}</span>`
            }
          </td>
          <td style="padding: 9px 6px; font-weight: bold; font-size: 13px;">
            ${isAbsentOrMissing ? '0' : tempObj.score} <span style="font-size: 11px; color: #64748b;">/ ${maxScore}</span>
          </td>
          <td style="padding: 9px 6px; font-weight: bold; color: ${pct >= 80 ? '#16a34a' : pct >= 50 ? '#0284c7' : '#dc2626'};">
            ${isAbsentOrMissing ? '0%' : pct + '%'}
          </td>
          <td style="padding: 9px 6px; font-weight: bold;">${gradeLabel}</td>
          <td style="padding: 9px 6px; text-align: right; color: #475569; font-size: 11px;">${tempObj.notes || '-'}</td>
        </tr>
      `;
    }).join('');

    const avgScore = presentCount > 0 ? (totalScoreSum / presentCount).toFixed(1) : '0';
    const avgPct = maxScore > 0 && presentCount > 0 ? Math.round((Number(avgScore) / maxScore) * 100) : 0;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>كشف درجات ونتائج الطلاب - ${evalTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 20px;
            direction: rtl;
          }
          @media print {
            body { padding: 8mm; }
            .no-print { display: none !important; }
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0d5c8c;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .header-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .header-logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 6px;
          }
          .header-title h1 {
            font-size: 18px;
            font-weight: 900;
            color: #0d5c8c;
          }
          .header-title p {
            font-size: 11px;
            color: #64748b;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 11px;
          }
          .meta-item { display: flex; flex-direction: column; gap: 2px; }
          .meta-item span.label { color: #64748b; font-size: 10px; }
          .meta-item span.val { font-weight: 800; color: #0f172a; }
          .stats-bar {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 16px;
          }
          .stat-card {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px;
            text-align: center;
          }
          .stat-card .num { font-size: 14px; font-weight: 900; color: #0d5c8c; }
          .stat-card .txt { font-size: 9px; color: #475569; font-weight: 700; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 11px;
          }
          th {
            background: #0d5c8c;
            color: #ffffff;
            padding: 8px 6px;
            font-weight: 800;
            font-size: 11px;
          }
          .footer-signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px dashed #cbd5e1;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
          }
          .sig-box { min-height: 50px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-brand">
            ${centerLogo ? `<img src="${centerLogo}" class="header-logo" />` : ''}
            <div class="header-title">
              <h1>${centerName}</h1>
              <p>كشف نتائج ودرجات الطلاب المعتمد | SAMS System</p>
            </div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 13px; font-weight: 900; color: #0d5c8c;">تقرير النتائج والتقييم الرسمي</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}</div>
            ${centerPhone ? `<div style="font-size: 10px; color: #64748b;">هاتف: ${centerPhone}</div>` : ''}
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><span class="label">اسم الاختبار/الواجب:</span><span class="val">${evalTitle} (${evalTypeLabel})</span></div>
          <div class="meta-item"><span class="label">المجموعة الدراسية:</span><span class="val">${className}</span></div>
          <div class="meta-item"><span class="label">الفصل الدراسي:</span><span class="val">${termName}</span></div>
          <div class="meta-item"><span class="label">تاريخ الإجراء:</span><span class="val">${evalDate}</span></div>
          <div class="meta-item"><span class="label">الدرجة العظمى:</span><span class="val" style="color: #d97706;">${maxScore} درجات</span></div>
          <div class="meta-item"><span class="label">جهة الاعتماد:</span><span class="val">شؤون الطلاب والامتحانات</span></div>
        </div>

        <div class="stats-bar">
          <div class="stat-card">
            <div class="num">${totalStudents}</div>
            <div class="txt">عدد الطلاب الكلي</div>
          </div>
          <div class="stat-card">
            <div class="num" style="color: #16a34a;">${presentCount}</div>
            <div class="txt">${gradingType === 'exam' ? 'عدد الحاضرين' : 'عدد المسلمين'}</div>
          </div>
          <div class="stat-card">
            <div class="num" style="color: #dc2626;">${absentCount}</div>
            <div class="txt">${gradingType === 'exam' ? 'عدد الغائبين' : 'غير المسلمين'}</div>
          </div>
          <div class="stat-card">
            <div class="num" style="color: #d97706;">${avgScore} (${avgPct}%)</div>
            <div class="txt">متوسط درجات المجموعة</div>
          </div>
          <div class="stat-card">
            <div class="num" style="color: #2563eb;">${highestScore} / ${maxScore}</div>
            <div class="txt">أعلى درجة محققة 🏆</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>رقم القيد</th>
              <th style="text-align: right;">اسم الطالب</th>
              <th>الحالة</th>
              <th>الدرجة</th>
              <th>النسبة %</th>
              <th>التقدير</th>
              <th style="text-align: right;">ملاحظات التقييم</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer-signatures" style="display: flex; justify-content: space-around; text-align: center; margin-top: 40px; page-break-inside: avoid;">
          <div class="sig-box">
            <p>توقيع السكرتيرة</p>
            <p style="margin-top: 25px; color: #94a3b8;">التوقيع: ............................</p>
          </div>
          <div class="sig-box">
            <p>اعتماد أستاذ المادة (المدير)</p>
            <p style="margin-top: 25px; color: #94a3b8;">الختم الرسمي: ............................</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=1000,height=800');
    if (printWin) {
      printWin.document.write(printContent);
      printWin.document.close();
    }
  };

  // Exam list search filter
  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const cls = classes.find(c => c.id === e.class_id);
      const clsName = cls ? cls.name : '';
      return (
        e.name.toLowerCase().includes(examSearch.toLowerCase()) ||
        e.type.toLowerCase().includes(examSearch.toLowerCase()) ||
        clsName.toLowerCase().includes(examSearch.toLowerCase())
      );
    });
  }, [exams, examSearch, classes]);

  // Assignment list search filter
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const cls = classes.find(c => c.id === a.class_id);
      const clsName = cls ? cls.name : '';
      return (
        a.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        clsName.toLowerCase().includes(assignmentSearch.toLowerCase())
      );
    });
  }, [assignments, assignmentSearch, classes]);

  if (showPrintModal && activeEvaluationObj) {
    const centerName = 'الدكتور في اللغة العربية';
    const centerPhone = localStorage.getItem('sams_center_phone') || '';
    const centerLogo = localStorage.getItem('sams_center_logo') || '';
    const currentClass = classes.find(c => c.id === selectedClassId);
    const className = currentClass ? `${currentClass.name} (الصف: ${currentClass.grade_level})` : 'المجموعة المحددة';
    
    // cast activeEvaluationObj to any to avoid type errors with name vs title
    const activeEval = activeEvaluationObj as any;
    const evalTitle = gradingType === 'exam' ? activeEval.name : activeEval.title;
    const maxScore = activeEval.max_score || 0;
    const termName = termFilter === 'first_term' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني';
    const evalTypeLabel = gradingType === 'exam'
      ? ({ quiz: 'امتحان حصة', comprehensive: 'امتحان شامل', monthly: 'اختبار شهري', midterm: 'منتصف الفصل', final: 'اختبار نهائي' }[activeEval.type] || 'اختبار مخصص')
      : 'واجب دراسي يومي';
    const evalDate = gradingType === 'exam' ? activeEval.date : activeEval.due_date;

    let presentCount = 0;
    let absentCount = 0;
    let totalScoreSum = 0;
    let highestScore = 0;

    activeClassStudents.forEach(student => {
      const tempObj = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
      const isAbsentOrMissing = gradingType === 'exam' ? tempObj.flag : !tempObj.flag;
      if (!isAbsentOrMissing) {
        presentCount++;
        totalScoreSum += tempObj.score;
        if (tempObj.score > highestScore) highestScore = tempObj.score;
      } else {
        absentCount++;
      }
    });

    const avgScore = presentCount > 0 ? (totalScoreSum / presentCount).toFixed(1) : '0';
    const avgPct = maxScore > 0 && presentCount > 0 ? Math.round((Number(avgScore) / maxScore) * 100) : 0;

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl animate-fade-in" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print border-b border-slate-100 dark:border-slate-700 pb-4 gap-4">
          <button 
            onClick={() => setShowPrintModal(false)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer"
          >
            <X className="w-5 h-5" /> رجوع
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer shadow-md w-full md:w-auto justify-center"
          >
            <Printer className="w-5 h-5" /> طباعة كشف الدرجات / حفظ PDF
          </button>
        </div>

        <div id="printable-group-roster" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-sans p-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#0d5c8c] pb-4 mb-4">
            <div className="flex items-center gap-4">
              {centerLogo && <img src={centerLogo} alt="Logo" className="w-14 h-14 object-contain rounded-lg" />}
              <div>
                <h1 className="text-xl font-black text-[#0d5c8c]">{centerName}</h1>
                {centerPhone && <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">هاتف: {centerPhone}</p>}
              </div>
            </div>
            <div className="text-left bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:bg-transparent print:border-none print:shadow-none">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 dark:text-slate-100">{evalTitle}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{evalTypeLabel} - {termName}</p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-4 text-sm print:bg-transparent">
            <div className="flex flex-col gap-1"><span className="text-slate-500 dark:text-slate-400 text-xs">المجموعة</span><span className="font-black text-slate-900 dark:text-slate-50">{className}</span></div>
            <div className="flex flex-col gap-1"><span className="text-slate-500 dark:text-slate-400 text-xs">تاريخ التقييم</span><span className="font-black text-slate-900 dark:text-slate-50">{evalDate}</span></div>
            <div className="flex flex-col gap-1"><span className="text-slate-500 dark:text-slate-400 text-xs">الدرجة النهائية</span><span className="font-black text-slate-900 dark:text-slate-50">{maxScore} درجة</span></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 dark:border-slate-600 p-3 rounded-xl text-center flex flex-col print:bg-transparent">
              <span className="text-xl font-black text-[#0d5c8c]">{activeClassStudents.length}</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1">إجمالي الطلاب</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 p-3 rounded-xl text-center flex flex-col print:bg-transparent">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{presentCount}</span>
              <span className="text-[10px] font-bold text-emerald-600 mt-1">{gradingType === 'exam' ? 'الحضور' : 'المسلمين'}</span>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-700 p-3 rounded-xl text-center flex flex-col print:bg-transparent">
              <span className="text-xl font-black text-rose-700 dark:text-rose-300">{absentCount}</span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">{gradingType === 'exam' ? 'الغياب' : 'لم يسلم'}</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 p-3 rounded-xl text-center flex flex-col print:bg-transparent">
              <span className="text-xl font-black text-amber-700 dark:text-amber-300">{highestScore}</span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">أعلى درجة</span>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/40 border border-sky-200 p-3 rounded-xl text-center flex flex-col print:bg-transparent">
              <span className="text-xl font-black text-sky-700 dark:text-sky-300">{avgScore} <span className="text-xs">({avgPct}%)</span></span>
              <span className="text-[10px] font-bold text-sky-600 mt-1">متوسط الدرجات</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-[#0d5c8c] text-white print:text-black">
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">م</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">رقم القيد</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-right print:bg-slate-100 dark:bg-slate-800">اسم الطالب</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">الحالة</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">الدرجة</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">النسبة</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">التقدير</th>
                <th className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 print:bg-slate-100 dark:bg-slate-800">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {activeClassStudents.map((student, idx) => {
                const tempObj = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
                const isAbsentOrMissing = gradingType === 'exam' ? tempObj.flag : !tempObj.flag;
                const pct = maxScore > 0 ? Math.round((tempObj.score / maxScore) * 100) : 0;
                let gradeLabel = 'ضعيف';
                if (!isAbsentOrMissing) {
                  if (pct >= 90) gradeLabel = 'ممتاز ✨';
                  else if (pct >= 80) gradeLabel = 'جيد جداً 👍';
                  else if (pct >= 65) gradeLabel = 'جيد';
                  else if (pct >= 50) gradeLabel = 'مقبول';
                } else {
                  gradeLabel = gradingType === 'exam' ? 'غائب 🔴' : 'لم يسلم ❌';
                }

                return (
                  <tr key={student.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-bold text-slate-500 dark:text-slate-400">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-mono font-bold text-[#0d5c8c]">{student.registration_id}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-right font-bold text-slate-900 dark:text-slate-50">{student.name}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600">
                      {isAbsentOrMissing 
                        ? <span className="text-rose-700 dark:text-rose-300 font-bold">{gradingType === 'exam' ? 'غائب' : 'لم يسلم'}</span>
                        : <span className="text-emerald-700 dark:text-emerald-300 font-bold">{gradingType === 'exam' ? 'حاضر' : 'تم التسليم'}</span>
                      }
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-bold">
                      {isAbsentOrMissing ? '0' : tempObj.score} <span className="text-xs text-slate-400">/ {maxScore}</span>
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-bold" style={{ color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#0284c7' : '#dc2626' }}>
                      {isAbsentOrMissing ? '0%' : pct + '%'}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 font-bold">{gradeLabel}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-600 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs">{tempObj.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 mt-12 text-center text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">
            <div>
              <p>توقيع السكرتيرة</p>
              <p className="mt-8 text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-600 dark:border-slate-600 pt-2 mx-12">التوقيع ....................</p>
            </div>
            <div>
              <p>اعتماد أستاذ المادة (المدير)</p>
              <p className="mt-8 text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-600 dark:border-slate-600 pt-2 mx-12">الختم الرسمي ....................</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="sams_exams_assignments_module">

      {/* Global Processing Progress Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 no-print print:hidden"
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

      
      {/* Upper Tab Navigation Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-amber-100 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 fill-current" />
            تطوير شؤون الطلاب والأكاديمية
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2 mt-1.5">
            الامتحانات والواجبات المخصصة
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وإدارة اختبارات الحصة والامتحانات الشاملة، مع رصد ذكي للواجبات وحالة استلامها اليومية لكل مجموعة
          </p>
        </div>

        {/* Navigation sub-tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveSubTab('grading');
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'grading'
                ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100'
            }`}
          >
            <Notebook className="w-4 h-4 text-emerald-500" />
            <span>رصد الدرجات والتسليم</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('exams');
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'exams'
                ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-blue-500" />
            <span>إدارة الامتحانات</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('assignments');
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className={`flex items-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'assignments'
                ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>إدارة الواجبات</span>
          </button>
        </div>
      </div>

      {/* Toast notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 text-[#C0152A] rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#E8192C] shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 1: GRADING SHEET                                  */}
      {/* ========================================================= */}
      {activeSubTab === 'grading' && (
        <div className="space-y-6">
          
          {/* Quick Filters Panel */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Term Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">الفصل الدراسي</label>
              <select
                value={termFilter}
                onChange={(e) => {
                  setTermFilter(e.target.value as any);
                  setSuccessMsg('');
                }}
                className="w-full text-xs font-semibold border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="first_term">الفصل الدراسي الأول</option>
                <option value="second_term">الفصل الدراسي الثاني</option>
              </select>
            </div>

            {/* Class Group Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">المجموعة الدراسية</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSuccessMsg('');
                }}
                className="w-full text-xs font-semibold border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {classes.length === 0 ? (
                  <option value="">لا توجد مجموعات</option>
                ) : (
                  classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (الصف: {c.grade_level})</option>
                  ))
                )}
              </select>
            </div>

            {/* Grading Type Switch */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">تصنيف الرصد الحالي</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setGradingType('exam');
                    setSuccessMsg('');
                  }}
                  className={`py-1.5 text-center text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                    gradingType === 'exam' ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100'
                  }`}
                >
                  الامتحانات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGradingType('assignment');
                    setSuccessMsg('');
                  }}
                  className={`py-1.5 text-center text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                    gradingType === 'assignment' ? 'bg-white dark:bg-slate-800 text-[#0D5C8C] shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100'
                  }`}
                >
                  الواجبات اليومية
                </button>
              </div>
            </div>

            {/* Evaluation Object Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                {gradingType === 'exam' ? 'اختر الامتحان المراد رصده' : 'اختر واجب اليوم المراد رصده'}
              </label>
              <select
                value={selectedEvaluationId}
                onChange={(e) => {
                  setSelectedEvaluationId(e.target.value);
                  setSuccessMsg('');
                }}
                className="w-full text-xs font-black border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-amber-50/50 text-[#0D5C8C]"
              >
                {availableEvaluations.length === 0 ? (
                  <option value="">-- لا يوجد مدخلات متاحة لهذه المجموعة --</option>
                ) : (
                  availableEvaluations.map(item => (
                    <option key={item.id} value={item.id}>
                      {gradingType === 'exam' 
                        ? `${(item as Exam).name} (درجة عظمى: ${(item as Exam).max_score})`
                        : `${(item as Assignment).title} (درجة عظمى: ${(item as Assignment).max_score})`
                      }
                    </option>
                  ))
                )}
              </select>
            </div>

          </div>

          {/* Active Evaluation Banner */}
          {activeEvaluationObj ? (
            <div className="bg-[#0D5C8C]/5 border border-[#0D5C8C]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0D5C8C] text-white rounded-xl">
                  {gradingType === 'exam' ? <Award className="w-5 h-5" /> : <Notebook className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm">
                    {gradingType === 'exam' ? (activeEvaluationObj as Exam).name : (activeEvaluationObj as Assignment).title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                    {gradingType === 'exam' && (
                      <>
                        <span className="bg-blue-100 text-[#0D5C8C] px-2 py-0.5 rounded text-[10px] font-bold">
                          { {quiz: 'امتحان حصة', comprehensive: 'امتحان شامل', monthly: 'اختبار شهري', midterm: 'منتصف الفصل', final: 'اختبار نهائي' }[(activeEvaluationObj as Exam).type] || 'اختبار مخصص'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {(activeEvaluationObj as Exam).duration_mins} دقيقة</span>
                        <span>•</span>
                      </>
                    )}
                    <span>درجة التقييم العظمى: <strong className="text-amber-600 dark:text-amber-400">{(activeEvaluationObj as Exam | Assignment).max_score} درجات</strong></span>
                    <span>•</span>
                    <span>تاريخ الحدث: {gradingType === 'exam' ? (activeEvaluationObj as Exam).date : (activeEvaluationObj as Assignment).due_date}</span>
                  </div>
                </div>
              </div>

              {/* Action utilities */}
              <div className="flex flex-wrap items-center gap-2">
                

                <button
                  type="button"
                  onClick={triggerPrintPDF}
                  className="px-4 py-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>تصدير PDF / طباعة الكشف</span>
                </button>

                {isEditingSheet ? (
                  <button
                    onClick={handleMarkAllPerfect}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>تعبئة الدرجة كاملة للجميع</span>
                  </button>
                ) : (
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    الدرجات معتمدة ومحفوظة
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 p-6 rounded-2xl text-center space-y-3">
              <Info className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">لم تقم بإضافة أي {gradingType === 'exam' ? 'امتحانات' : 'واجبات'} مخصصة لهذه المجموعة حتى الآن.</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
                توجه للتبويبات بالأعلى لإضافة امتحان (امتحان حصة، شامل، إلخ) أو واجب دراسي مخصص لهذه المجموعة، ومن ثم ستظهر لك قائمة الطلاب وتستطيع رصد الدرجات مباشرة.
              </p>
              <button
                onClick={() => setActiveSubTab(gradingType === 'exam' ? 'exams' : 'assignments')}
                className="px-5 py-2.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                إضافة {gradingType === 'exam' ? 'امتحان جديد الآن' : 'واجب دراسي جديد الآن'}
              </button>
            </div>
          )}

          {/* High Absence Frequency Alert Banner for Active Class */}
          {frequentAbsenceStudents.length > 0 && (
            <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-orange-950/30 border-2 border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-right mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-md shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                      🚨 تنبيه انضباط الحضور (تكرار الغياب لأكثر من 3 مرات في الشهر)
                    </h4>
                    <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                      {frequentAbsenceStudents.length} طلاب
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-sans mt-1">
                    تم رصد طلاب يتجاوز غيابهم الحد المسموح به في هذه المجموعة ({frequentAbsenceStudents.map(s => s.student.name).join('، ')}). يمكنك التواصل المباشر مع أولياء أمورهم عبر الواتساب.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const first = frequentAbsenceStudents[0];
                    if (first) {
                      handleOpenWhatsAppModal(first.student, first.count, first.dates);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-white" />
                  <span>إرسال تنبيهات الواتساب لأولياء الأمور 📱</span>
                </button>
              </div>
            </div>
          )}

          {/* Student Grading Grid Table */}
          {activeEvaluationObj && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700 pb-3 gap-3">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <ListPlus className="w-4 h-4 text-[#0D5C8C]" />
                  قائمة كشف طلاب المجموعة للرصد والتقييم
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    العدد الكلي للطلاب: <strong className="text-[#0D5C8C] font-mono text-xs">{activeClassStudents.length}</strong> طالب
                  </span>
                  <button
                    type="button"
                    onClick={triggerPrintPDF}
                    className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-900/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-700 text-amber-900 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>تصدير تقرير PDF</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl shadow-xs">
                <table className="min-w-full text-right relative border-collapse" dir="rtl">
                  <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black border-b-2 border-slate-200 dark:border-slate-700 shadow-xs">
                    <tr>
                      <th className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">رقم القيد</th>
                      <th className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">اسم الطالب وبياناته</th>
                      <th className="p-3 text-center w-[180px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {gradingType === 'exam' ? 'الحضور والغياب' : 'حالة تسليم الواجب'}
                      </th>
                      <th className="p-3 text-center w-[180px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        الدرجة المستحقة (من {activeEvaluationObj.max_score})
                      </th>
                      <th className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">ملاحظات خاصة برصد الطالب</th>
                      <th className="p-3 text-center w-[90px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">النسبة %</th>
                      <th className="p-3 text-center w-[160px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">تنبيهات الغياب (واتساب)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-slate-700 dark:text-slate-200">
                    {activeClassStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          لا توجد سجلات طلاب مضافين لهذه المجموعة بعد.
                        </td>
                      </tr>
                    ) : (
                      activeClassStudents.map(student => {
                        const tempObj = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
                        const scorePercent = activeEvaluationObj.max_score > 0 
                          ? Math.round((tempObj.score / activeEvaluationObj.max_score) * 100) 
                          : 0;
                        const monthlyAbsence = getStudentMonthlyAbsences(student.id);

                        return (
                          <tr key={student.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50/50 transition-all font-sans ${tempObj.flag && gradingType === 'exam' ? 'bg-red-50/30' : ''}`}>
                            <td className="p-3 font-mono font-semibold text-[#0D5C8C]">{student.registration_id}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
                                <span>{student.name}</span>
                                {monthlyAbsence.count >= 3 && (
                                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shrink-0">
                                    <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                    تكرر الغياب ({monthlyAbsence.count} مرات)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                                ولي الأمر: {student.parent_name || 'غير محدد'} ({student.parent_phone || student.phone || 'لا يوجد هاتف'})
                              </div>
                            </td>
                            
                            {/* Flag toggler (Absent for Exams, Completed for Assignments) */}
                            <td className="p-3 text-center">
                              {isEditingSheet ? (
                                gradingType === 'exam' ? (
                                  <div className="flex items-center justify-center gap-1.5" dir="ltr">
                                    <span className={`text-[10px] font-extrabold tracking-tight transition-all duration-150 ${tempObj.flag ? 'text-rose-600' : 'text-slate-400'}`}>
                                      غائب
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTempGrades(prev => ({
                                          ...prev,
                                          [student.id]: {
                                            ...prev[student.id],
                                            flag: !tempObj.flag,
                                            score: !tempObj.flag ? 0 : tempObj.score // reset score if absent checked
                                          }
                                        }));
                                      }}
                                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        tempObj.flag ? 'bg-rose-500' : 'bg-emerald-500'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-800 shadow-xs ring-0 transition duration-200 ease-in-out ${
                                          tempObj.flag ? 'translate-x-0' : 'translate-x-5'
                                        }`}
                                      />
                                    </button>
                                    <span className={`text-[10px] font-extrabold tracking-tight transition-all duration-150 ${!tempObj.flag ? 'text-emerald-600' : 'text-slate-400'}`}>
                                      حاضر
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5" dir="ltr">
                                    <span className={`text-[10px] font-extrabold tracking-tight transition-all duration-150 ${!tempObj.flag ? 'text-amber-600' : 'text-slate-400'}`}>
                                      لم يسلم
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTempGrades(prev => ({
                                          ...prev,
                                          [student.id]: {
                                            ...prev[student.id],
                                            flag: !tempObj.flag,
                                            score: !tempObj.flag ? activeEvaluationObj.max_score : 0 // full score if completed, else 0
                                          }
                                        }));
                                      }}
                                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        tempObj.flag ? 'bg-emerald-500' : 'bg-amber-400'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-800 shadow-xs ring-0 transition duration-200 ease-in-out ${
                                          tempObj.flag ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                    <span className={`text-[10px] font-extrabold tracking-tight transition-all duration-150 ${tempObj.flag ? 'text-emerald-600' : 'text-slate-400'}`}>
                                      سلم
                                    </span>
                                  </div>
                                )
                              ) : (
                                gradingType === 'exam' ? (
                                  tempObj.flag ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800">🔴 غائب</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">🟢 حاضر</span>
                                  )
                                ) : (
                                  tempObj.flag ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">✔️ تم التسليم</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">❌ لم يسلم</span>
                                  )
                                )
                              )}
                            </td>

                            {/* Score Input or Read-Only Colored Badge */}
                            <td className="p-3 text-center">
                              {isEditingSheet ? (
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={activeEvaluationObj.max_score}
                                    disabled={gradingType === 'exam' && tempObj.flag} // disable score if absent
                                    value={tempObj.score === 0 ? '' : tempObj.score}
                                    placeholder="0"
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const rawVal = e.target.value;
                                      const val = rawVal === '' ? 0 : Number(rawVal);
                                      setTempGrades(prev => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          score: val
                                        }
                                      }));
                                    }}
                                    className="w-20 text-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 disabled:bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:text-slate-400 rounded-xl p-2 font-mono font-bold text-sm focus:outline-hidden focus:border-[#0D5C8C] focus:bg-white dark:bg-slate-800"
                                  />
                                  <span className="text-slate-400 font-bold">/ {activeEvaluationObj.max_score}</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  {getScoreBadge(tempObj.score, activeEvaluationObj.max_score, tempObj.flag)}
                                </div>
                              )}
                            </td>

                            {/* Teacher Notes */}
                            <td className="p-3">
                              {isEditingSheet ? (
                                <input
                                  type="text"
                                  placeholder="مثلاً: متميز، يحتاج للمراجعة، غشاش، إلخ..."
                                  value={tempObj.notes}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTempGrades(prev => ({
                                      ...prev,
                                      [student.id]: {
                                        ...prev[student.id],
                                        notes: val
                                      }
                                    }));
                                  }}
                                  className="w-full min-w-[200px] max-w-full flex-1 text-right border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:bg-slate-800 focus:bg-white dark:bg-slate-800 rounded-xl p-2 text-xs focus:outline-hidden focus:border-[#0D5C8C]"
                                  dir="rtl"
                                />
                              ) : (
                                tempObj.notes ? (
                                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{tempObj.notes}</span>
                                ) : (
                                  <span className="text-slate-300 italic text-xs">لا توجد ملاحظات</span>
                                )
                              )}
                            </td>

                            {/* Percentage Label */}
                            <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                              {tempObj.flag && gradingType === 'exam' ? (
                                <span className="text-rose-600 dark:text-rose-400">0%</span>
                              ) : (
                                <span className={scorePercent >= 85 ? 'text-emerald-600' : scorePercent >= 50 ? 'text-blue-600' : 'text-amber-600'}>
                                  {scorePercent}%
                                </span>
                              )}
                            </td>

                            {/* WhatsApp Direct Parent Notification */}
                            <td className="p-3 text-center">
                              {monthlyAbsence.count >= 3 ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsAppModal(student, monthlyAbsence.count, monthlyAbsence.dates)}
                                  className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                  title="إرسال تنبيه واتساب مباشر لولي الأمر بتكرار الغياب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-current text-white" />
                                  <span>واتساب ولي الأمر 📱</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsAppModal(student, monthlyAbsence.count, monthlyAbsence.dates)}
                                  className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
                                  title="تنبيه أو مراسلة ولي الأمر عبر الواتساب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                                  <span>مراسلة ({monthlyAbsence.count})</span>
                                </button>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Save Sheet Action Button */}
              {activeClassStudents.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {isEditingSheet ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4 animate-bounce" />
                        أنت في وضع رصد وتعديل الدرجات حالياً... يرجى الضغط على حفظ واعتماد الكشف لتثبيتها.
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        الدرجات مرصودة ومعتمدة بالكامل في النظام.
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {isEditingSheet ? (
                      <>
                        {/* Cancel button if there are existing grades in DB */}
                        {(gradingType === 'exam' 
                          ? examGrades.some(eg => eg.exam_id === selectedEvaluationId)
                          : assignmentGrades.some(ag => ag.assignment_id === selectedEvaluationId)
                        ) && (
                          <button
                            type="button"
                            onClick={() => {
                              loadAllData();
                              setIsEditingSheet(false);
                            }}
                            className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            إلغاء التعديل
                          </button>
                        )}
                        <button
                          onClick={handleSaveBulkGrades}
                          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>حفظ واعتماد كشف درجات المجموعة بالكامل</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={triggerPrintPDF}
                          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Printer className="w-4 h-4 text-amber-200" />
                          <span>تصدير PDF / طباعة كشف الدرجات</span>
                        </button>
                        <button
                          onClick={() => setIsEditingSheet(true)}
                          className="px-8 py-3.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>تعديل ورصد الدرجات</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: EXAMS MANAGEMENT                               */}
      {/* ========================================================= */}
      {activeSubTab === 'exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create/Edit Exam Form (5 columns) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-blue-500" />
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-xs">
                {editingExamId ? 'تعديل الامتحان المحدد' : 'إنشاء وتجهيز امتحان جديد'}
              </h3>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              
              {/* Exam Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">اسم أو كود الامتحان</label>
                <input
                  type="text"
                  placeholder="مثال: امتحان الحصة الأولى، امتحان البلاغة الشامل"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full min-w-[200px] max-w-full flex-1 text-right border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-hidden focus:border-[#0D5C8C]"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Exam Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">تصنيف الامتحان</label>
                  <select
                    value={examForm.type}
                    onChange={(e) => setExamForm({ ...examForm, type: e.target.value as any })}
                    className="w-full min-w-[200px] max-w-full flex-1 text-right text-xs border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800"
                  >
                    <option value="quiz">امتحان حصة (سريع)</option>
                    <option value="comprehensive">امتحان شامل</option>
                    <option value="monthly">اختبار شهري</option>
                    <option value="midterm">امتحان منتصف الفصل</option>
                    <option value="final">امتحان نهائي للمستوى</option>
                  </select>
                </div>

                {/* Term */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">الفصل الدراسي</label>
                  <select
                    value={examForm.term}
                    onChange={(e) => setExamForm({ ...examForm, term: e.target.value as any })}
                    className="w-full min-w-[200px] max-w-full flex-1 text-right text-xs border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800"
                  >
                    <option value="first_term">الفصل الأول</option>
                    <option value="second_term">الفصل الثاني</option>
                  </select>
                </div>
              </div>

              {/* Class Group */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">موجه لطلاب المجموعة الدراسية</label>
                <select
                  value={examForm.class_id}
                  onChange={(e) => setExamForm({ ...examForm, class_id: e.target.value })}
                  className="w-full min-w-[200px] max-w-full flex-1 text-right text-xs border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (الصف: {c.grade_level})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Max Score */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">درجة الامتحان من كام</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={examForm.max_score}
                    onChange={(e) => setExamForm({ ...examForm, max_score: Number(e.target.value) })}
                    className="w-full text-center border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-xs"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">مدة الامتحان (بالدقائق)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={examForm.duration_mins}
                    onChange={(e) => setExamForm({ ...examForm, duration_mins: Number(e.target.value) })}
                    className="w-full text-center border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {/* Exam Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">تاريخ إجراء الامتحان</label>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="w-full text-center border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingExamId ? 'تحديث وحفظ التعديل' : 'تأكيد إضافة الامتحان'}</span>
                </button>
                {editingExamId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExamId(null);
                      setExamForm({
                        name: '',
                        type: 'quiz',
                        max_score: 20,
                        duration_mins: 30,
                        date: new Date().toISOString().split('T')[0],
                        class_id: classes[0]?.id || '',
                        term: 'first_term'
                      });
                    }}
                    className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Exams Listing (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-3xs flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-full">
                <input
                  type="text"
                  placeholder="ابحث باسم الامتحان، تصنيفه، أو اسم المجموعة..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  className="w-full min-w-[200px] max-w-full flex-1 text-right pr-9 pl-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
                  dir="rtl"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">إجمالي الامتحانات: {exams.length}</span>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
              {filteredExams.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-slate-400 text-xs">
                  لم يتم العثور على أي امتحانات مضافة تتطابق مع البحث.
                </div>
              ) : (
                filteredExams.map(exam => {
                  const cls = classes.find(c => c.id === exam.class_id);
                  const gradedCount = examGrades.filter(g => g.exam_id === exam.id).length;

                  return (
                    <div key={exam.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs hover:border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between gap-4">
                      <div className="space-y-1.5 text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm">{exam.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            exam.type === 'comprehensive' ? 'bg-rose-50 text-[#C0152A] border border-rose-100' : 'bg-blue-50 text-[#0D5C8C] border border-blue-100'
                          }`}>
                            { {quiz: 'امتحان حصة', comprehensive: 'امتحان شامل', monthly: 'اختبار شهري', midterm: 'منتصف الفصل', final: 'اختبار نهائي' }[exam.type] || 'امتحان مخصص'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          <span className="font-bold text-[#0D5C8C]">{cls ? cls.name : 'بدون مجموعة'}</span>
                          <span>•</span>
                          <span>الدرجة من: <strong className="text-amber-600 dark:text-amber-400">{exam.max_score}</strong></span>
                          <span>•</span>
                          <span>المدة: <strong>{exam.duration_mins} د</strong></span>
                          <span>•</span>
                          <span>التاريخ: {exam.date}</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          تم رصد درجات ({gradedCount}) طلاب لهذه المادة.
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedClassId(exam.class_id);
                            setGradingType('exam');
                            setSelectedEvaluationId(exam.id);
                            setActiveSubTab('grading');
                            setTimeout(() => {
                              triggerPrintPDF();
                            }, 100);
                          }}
                          className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 rounded-lg border border-amber-200 dark:border-amber-700 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                          title="تصدير كشف PDF / طباعة"
                        >
                          <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="hidden sm:inline">طباعة PDF</span>
                        </button>
                        <button
                          onClick={() => handleEditExamClick(exam)}
                          className="p-2 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-all cursor-pointer"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExamToDelete(exam)}
                          className="p-2 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg border border-slate-100 dark:border-slate-700 transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: ASSIGNMENTS MANAGEMENT                         */}
      {/* ========================================================= */}
      {activeSubTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create/Edit Assignment Form (5 columns) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-xs">
                {editingAssignmentId ? 'تعديل الواجب الدراسي' : 'إضافة واجب يومي جديد'}
              </h3>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              
              {/* Assignment Title / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">موضوع أو صفحات الواجب</label>
                <textarea
                  rows={2}
                  placeholder="مثال: حل صفحة 12 و 13 بكتاب المدرسة، أو واجب شرح اسم الفاعل صـ 40"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full min-w-[200px] max-w-full flex-1 text-right border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-hidden focus:border-[#0D5C8C] resize-none"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Max Score */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">درجة الواجب (مثلاً من 10)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={assignmentForm.max_score}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, max_score: Number(e.target.value) })}
                    className="w-full text-center border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-xs"
                  />
                </div>

                {/* Term */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">الفصل الدراسي</label>
                  <select
                    value={assignmentForm.term}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, term: e.target.value as any })}
                    className="w-full min-w-[200px] max-w-full flex-1 text-right text-xs border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800"
                  >
                    <option value="first_term">الفصل الدراسي الأول</option>
                    <option value="second_term">الفصل الدراسي الثاني</option>
                  </select>
                </div>
              </div>

              {/* Class Group */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">مخصص لطلاب المجموعة</label>
                <select
                  value={assignmentForm.class_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, class_id: e.target.value })}
                  className="w-full min-w-[200px] max-w-full flex-1 text-right text-xs border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (الصف: {c.grade_level})</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">تاريخ تسليم الواجب المطلوب</label>
                <input
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                  className="w-full text-center border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAssignmentId ? 'حفظ تعديلات الواجب' : 'إضافة ونشر الواجب'}</span>
                </button>
                {editingAssignmentId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAssignmentId(null);
                      setAssignmentForm({
                        title: '',
                        max_score: 10,
                        due_date: new Date().toISOString().split('T')[0],
                        class_id: classes[0]?.id || '',
                        term: 'first_term'
                      });
                    }}
                    className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Assignments Listing (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-3xs flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-full">
                <input
                  type="text"
                  placeholder="ابحث بموضوع الواجب، اسم المجموعة..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="w-full min-w-[200px] max-w-full flex-1 text-right pr-9 pl-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
                  dir="rtl"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">إجمالي الواجبات: {assignments.length}</span>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
              {filteredAssignments.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-slate-400 text-xs">
                  لم يتم إضافة واجبات تتطابق مع البحث الحالي بعد.
                </div>
              ) : (
                filteredAssignments.map(asg => {
                  const cls = classes.find(c => c.id === asg.class_id);
                  const gradedCount = assignmentGrades.filter(g => g.assignment_id === asg.id && g.completed).length;

                  return (
                    <div key={asg.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs hover:border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between gap-4">
                      <div className="space-y-1.5 text-right flex-1">
                        <div>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm block leading-relaxed">{asg.title}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          <span className="font-bold text-[#0D5C8C]">{cls ? cls.name : 'بدون مجموعة'}</span>
                          <span>•</span>
                          <span>الدرجة القصوى: <strong className="text-amber-600 dark:text-amber-400">{asg.max_score}</strong></span>
                          <span>•</span>
                          <span>تاريخ التسليم: <strong>{asg.due_date}</strong></span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          تم تسليم الواجب من قبل ({gradedCount}) طلاب حتى الآن.
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedClassId(asg.class_id);
                            setGradingType('assignment');
                            setSelectedEvaluationId(asg.id);
                            setActiveSubTab('grading');
                            setTimeout(() => {
                              triggerPrintPDF();
                            }, 100);
                          }}
                          className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 rounded-lg border border-amber-200 dark:border-amber-700 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                          title="تصدير كشف PDF / طباعة"
                        >
                          <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="hidden sm:inline">طباعة PDF</span>
                        </button>
                        <button
                          onClick={() => handleEditAssignmentClick(asg)}
                          className="p-2 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-all cursor-pointer"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAssignmentToDelete(asg)}
                          className="p-2 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg border border-slate-100 dark:border-slate-700 transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* Custom Exam Deletion Modal */}
      <AnimatePresence>
        {examToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-md w-full p-6 text-right space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">حذف الامتحان نهائياً</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans font-medium">سيتم إزالة كافة السجلات والدرجات المرتبطة</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans space-y-1.5 py-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p>هل أنت متأكد من رغبتك في حذف الامتحان: <strong className="text-red-700 dark:text-red-300">"{examToDelete.name}"</strong>؟</p>
                <p className="text-[10px] text-slate-400">تحذير: سيؤدي هذا الإجراء لحذف هذا الامتحان وجميع تقارير درجات الطلاب المسجلة له بشكل نهائي.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setExamToDelete(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteExam}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Assignment Deletion Modal */}
      <AnimatePresence>
        {assignmentToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-md w-full p-6 text-right space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">حذف الواجب الدراسي نهائياً</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans font-medium">سيتم إزالة كافة السجلات والتسليمات المرتبطة</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans space-y-1.5 py-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p>هل أنت متأكد من رغبتك في حذف الواجب الدراسي: <strong className="text-red-700 dark:text-red-300">"{assignmentToDelete.title}"</strong>؟</p>
                <p className="text-[10px] text-slate-400">تحذير: سيؤدي هذا الإجراء لحذف الواجب الدراسي وجميع سجلات استلام وتسليم الواجب الخاصة بالطلاب بشكل نهائي.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setAssignmentToDelete(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAssignment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      

      {/* WhatsApp Parent Absence Alert Modal */}
      <AnimatePresence>
        {whatsAppModalStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-700 dark:border-slate-800"
            >
              <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-2xl">
                    <MessageCircle className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">إرسال تنبيه واتساب مباشر لولي الأمر</h3>
                    <p className="text-xs text-emerald-100 font-sans">إخطار رسمي بتكرار غياب الطالب لأكثر من 3 مرات في الشهر</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsAppModalStudent(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-right">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">
                    <span>الطالب/ة: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{whatsAppModalStudent.student.name}</strong></span>
                    <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-full text-[11px] font-black border border-rose-200 dark:border-rose-800">
                      إجمالي الغياب: {whatsAppModalStudent.count} مرات
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-sans flex items-center justify-between">
                    <span>ولي الأمر: {whatsAppModalStudent.student.parent_name || 'غير محدد'}</span>
                    <span className="font-mono dir-ltr text-slate-700 dark:text-slate-200 font-bold">
                      📱 {whatsAppModalStudent.student.parent_phone || whatsAppModalStudent.student.phone || 'لا يوجد هاتف'}
                    </span>
                  </div>
                  {whatsAppModalStudent.dates.length > 0 && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans border-t border-emerald-100 dark:border-emerald-900/50 pt-2 mt-2">
                      <strong>تواريخ الغياب المرصودة هذا الشهر:</strong> {whatsAppModalStudent.dates.join(' | ')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5">
                    نص رسالة التنبيه الموجهة لولي الأمر (قابل للتعديل قبل الإرسال):
                  </label>
                  <textarea
                    rows={6}
                    value={customWhatsAppMsg}
                    onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-sans text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                    dir="rtl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 dark:border-slate-800 justify-end">
                  <button
                    type="button"
                    onClick={() => setWhatsAppModalStudent(null)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppDirect(whatsAppModalStudent.student, whatsAppModalStudent.count, customWhatsAppMsg)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>فتح محادثة الواتساب المباشرة 📱</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
