import React, { useState, useEffect, useMemo } from 'react';
import { samsDb } from '../utils/db';
import { Student, ClassRoom } from '../types';
import { Search, Plus, Filter, Edit, Trash2, RefreshCw, ShieldAlert, CheckCircle, Eye, X, BookOpen, CreditCard, Calendar, Phone, User, Users, Archive, RotateCcw, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import StudentFullReport from './StudentFullReport';
import { useSamsDbSync } from '../hooks/useSamsDbSync';

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeLevelFilter, setGradeLevelFilter] = useState('all');
  const [educationTypeFilter, setEducationTypeFilter] = useState('all');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Archive modal states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivedSearchTerm, setArchivedSearchTerm] = useState('');
  const [archivedStudentToPermanentDelete, setArchivedStudentToPermanentDelete] = useState<Student | null>(null);
  
  // Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');

  // Full Report state
  const [showFullReport, setShowFullReport] = useState(false);
  const [showBriefProfile, setShowBriefProfile] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  // Selected Profile for detail card
  const [selectedProfile, setSelectedProfile] = useState<Student | null>(null);

  // Calculate attendance statistics for the selected student
  const getStudentAttendanceStats = (studentId: string) => {
    const records = samsDb.getAttendance().filter(a => a.student_id === studentId);
    if (records.length === 0) {
      return {
        percentage: 100,
        total: 0,
        present: 0,
        absent: 0,
        statusLabel: 'لا توجد سجلات 📂',
        statusColor: 'text-slate-500 dark:text-slate-400',
        bgClass: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
        description: 'لم يتم تسجيل أي حضور أو غياب لهذا الطالب بعد في النظام.'
      };
    }

    const total = records.length;
    const present = records.filter(a => a.status === 'present').length;
    const excused = records.filter(a => a.status === 'excused').length;
    const absent = records.filter(a => a.status === 'absent').length;
    
    const percentage = Math.round((present / total) * 100);

    let statusLabel = 'مستقر';
    let statusColor = 'text-emerald-600';
    let bgClass = 'bg-emerald-50 border-emerald-100 text-emerald-800';
    let description = `نسبة حضور الطالب للشهر الحالي سجلت ${percentage}% مع عدم رصد أي إنذار غياب مسبق.`;

    if (percentage >= 90) {
      statusLabel = 'ممتاز ✨';
      statusColor = 'text-emerald-700';
      bgClass = 'bg-emerald-50 border-emerald-100 text-emerald-800';
      description = `نسبة حضور الطالب ممتازة حيث بلغت ${percentage}% (حضر ${present} من أصل ${total} حصص).`;
    } else if (percentage >= 75) {
      statusLabel = 'مستقر 👍';
      statusColor = 'text-[#0D5C8C]';
      bgClass = 'bg-sky-50 border-sky-100 text-[#0D5C8C]';
      description = `نسبة حضور الطالب مستقرة عند ${percentage}% (حضر ${present} من أصل ${total} حصص).`;
    } else if (percentage >= 50) {
      statusLabel = 'إنذار غياب ⚠️';
      statusColor = 'text-amber-700';
      bgClass = 'bg-amber-50 border-amber-100 text-amber-800';
      description = `انتباه: تراجعت نسبة حضور الطالب إلى ${percentage}% بسبب غيابه المتكرر (${absent} حصص غياب).`;
    } else {
      statusLabel = 'حرج خطير 🚨';
      statusColor = 'text-rose-700';
      bgClass = 'bg-rose-50 border-rose-100 text-rose-800';
      description = `خطر: نسبة الحضور حرجة جداً وتساوي ${percentage}% (تغيب الطالب في ${absent} حصص من أصل ${total}).`;
    }

    return { percentage, total, present, absent, excused, statusLabel, statusColor, bgClass, description };
  };

  // Custom Delete Confirm state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  // Creating/Editing student states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    national_id: '',
    class_id: '',
    grade_level: 'الأول الإعدادي',
    education_type: 'عام' as 'عام' | 'أزهر',
    birth_date: '2015-05-12',
    phone: '',
    parent_name: '',
    parent_phone: '',
    status: 'active' as Student['status']
  });

  useEffect(() => {
    loadData();
    const pendingSearch = localStorage.getItem('sams_global_search');
    if (pendingSearch) {
      setSearchTerm(pendingSearch);
      localStorage.removeItem('sams_global_search');
    }
  }, []);

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
    setStudents(samsDb.getStudents());
    const cl = samsDb.getClasses();
    setClasses(cl);
    const defaultEd = formData.education_type || 'عام';
    const avail = cl.filter(c => (c.education_type || 'عام') === defaultEd);
    if (!formData.class_id && avail.length > 0) {
      setFormData(prev => ({ ...prev, class_id: avail[0].id }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const executeAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || !formData.class_id) {
      setErrorMessage('يرجى ملء جميع الحقول الإلزامية التي تحمل النجمة (*).');
      return;
    }
    
    if (!isEditing) {
      const res = samsDb.addStudent({
        ...formData,
        national_id: formData.national_id || ("30" + Math.floor(100000000000 + Math.random() * 900000000000))
      });
      if (res.success && res.student) {
        setSuccessMessage(`تم تسجيل الطالب بنجاح برقم القيد: ${res.student.registration_id}`);
        const defaultEd = 'عام';
        const avail = classes.filter(c => (c.education_type || 'عام') === defaultEd);
        setFormData({
          name: '',
          national_id: '',
          class_id: avail[0]?.id || '',
          grade_level: 'الأول الإعدادي',
          education_type: 'عام',
          birth_date: '2016-01-01',
          phone: '',
          parent_name: '',
          parent_phone: '',
          status: 'active'
        });
        setShowAddForm(false);
        loadData();
      } else {
        setErrorMessage(res.error || 'حدث خطأ غير متوقع أثناء تسجيل الطالب.');
      }
    } else {
      const existingStudent = students.find(s => s.id === editId);
      const updatedStudent: Student = {
        ...formData,
        national_id: formData.national_id || existingStudent?.national_id || ("30" + Math.floor(100000000000 + Math.random() * 900000000000)),
        id: editId,
        registration_id: existingStudent?.registration_id || '20230000',
        created_at: existingStudent?.created_at || '2023-09-01'
      };
      
      const res = samsDb.updateStudent(updatedStudent);
      if (res.success) {
        setSuccessMessage('تم تعديل وحفظ بيانات الطالب بنجاح.');
        setIsEditing(false);
        setEditId('');
        setShowAddForm(false);
        loadData();
        if (selectedProfile && selectedProfile.id === editId) {
          setSelectedProfile(updatedStudent);
        }
      } else {
        setErrorMessage(res.error || 'فشل التعديل.');
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = (student: Student) => {
    setIsEditing(true);
    setEditId(student.id);
    const studentClass = classes.find(c => c.id === student.class_id);
    const edType = student.education_type || studentClass?.education_type || 'عام';
    setFormData({
      name: student.name,
      national_id: student.national_id || '',
      class_id: student.class_id,
      grade_level: student.grade_level,
      education_type: edType,
      birth_date: student.birth_date,
      phone: student.phone,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      status: student.status
    });
    setShowAddForm(true);
    scrollToTop();
    setErrorMessage('');
  };

  const handleDeleteClick = (student: Student) => {
    handleProcessAction("جاري أرشفة الطالب...", () => {
      samsDb.softDeleteStudent(student.id);
      setSuccessMessage(`تم أرشفة الطالب (${student.name}) بنجاح.`);
      setStudentToDelete(null);
      loadData();
      if (selectedProfile?.id === student.id) {
        setSelectedProfile(null);
      }
    });
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      handleProcessAction("جاري أرشفة الطالب...", () => {
        samsDb.softDeleteStudent(studentToDelete.id);
        setSuccessMessage('تم أرشفة الطالب بنجاح.');
        setStudentToDelete(null);
        loadData();
        if (selectedProfile?.id === studentToDelete.id) {
          setSelectedProfile(null);
        }
      });
    }
  };

  const cancelDelete = () => {
    setStudentToDelete(null);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
      const matchesClass = classFilter === 'all' || s.class_id === classFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesGrade = gradeLevelFilter === 'all' || s.grade_level === gradeLevelFilter;
      const studentClass = classes.find(c => c.id === s.class_id);
      const edType = s.education_type || studentClass?.education_type || 'عام';
      const matchesEducationType = educationTypeFilter === 'all' || edType === educationTypeFilter;
      return matchesSearch && matchesClass && matchesStatus && matchesGrade && matchesEducationType;
    });
  }, [students, classes, searchTerm, classFilter, statusFilter, gradeLevelFilter, educationTypeFilter]);


  if (showArchiveModal) {
    return (
      <div className="space-y-6 animate-fade-in" dir="rtl">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArchiveModal(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-bold text-sm"
            >
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </button>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">أرشيف الطلاب المؤرشفين</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">إدارة واستعادة أو حذف بيانات الطلاب نهائياً</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[70vh]">
          {/* Search */}
          <div className="relative shrink-0 mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              value={archivedSearchTerm}
              onChange={(e) => setArchivedSearchTerm(e.target.value)}
              placeholder="بحث في الطلاب المؤرشفين بالاسم أو رقم القيد..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-600 font-sans transition-colors"
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
                  <div className="text-center py-20 text-slate-400 space-y-3">
                    <Archive className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا يوجد طلاب في الأرشيف حالياً</p>
                  </div>
                );
              }

              return (
                <div className="overflow-auto max-h-[calc(100vh-250px)]">
          <table className="w-full text-sm text-right">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold shadow-sm whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-4 pr-6">م</th>
                        <th className="px-4 py-4 min-w-[200px]">بيانات الطالب</th>
                        <th className="px-4 py-4 min-w-[150px]">الصف الدراسي</th>
                        <th className="px-4 py-4 min-w-[140px]">رقم هاتف الطالب / ولي الأمر</th>
                        <th className="px-4 py-4 text-left pl-6 min-w-[160px]">إجراءات التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
                      {archivedList.map((st, index) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 pr-6 text-xs text-slate-400 font-mono">
                            {(index + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-500 font-bold text-lg">
                                <Archive className="w-5 h-5 opacity-50" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{st.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">#{st.registration_id}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {st.grade_level}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-mono text-xs"><Phone className="w-3.5 h-3.5" /> {st.phone || st.parent_phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-left pl-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  samsDb.restoreStudent(st.id);
                                  loadData();
                                  setSuccessMessage(`تمت استعادة الطالب (${st.name}) بنجاح وإعادته للقائمة النشطة.`);
                                }}
                                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>استعادة</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setArchivedStudentToPermanentDelete(st)}
                                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف نهائي</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Global Processing Progress Overlay and Modals should still be accessible if needed */}
        <AnimatePresence>
          {archivedStudentToPermanentDelete && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-md w-full p-6 text-right space-y-4"
              >
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">تأكيد الحذف النهائي</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">هذا الإجراء لا يمكن التراجع عنه.</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  هل أنت متأكد من رغبتك في الحذف النهائي للطالب <span className="font-bold">({archivedStudentToPermanentDelete?.name})</span>؟ سيتم مسح كافة سجلاته بشكل دائم.
                </p>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setArchivedStudentToPermanentDelete(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (archivedStudentToPermanentDelete) {
                        handleProcessAction("جاري الحذف النهائي...", () => {
                          samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                          setSuccessMessage('تم حذف الطالب نهائياً بنجاح.');
                          setArchivedStudentToPermanentDelete(null);
                          loadData();
                        });
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm shadow-red-200 dark:shadow-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    تأكيد الحذف النهائي 🗑️
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (showFullReport && selectedProfile) {
    return (
      <StudentFullReport
        student={selectedProfile}
        onClose={() => {
          setShowFullReport(false);
          setSelectedProfile(null);
        }}
      />
    );
  }

  return (
    <>

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

      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6" 
      id="sams_students_module"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
            إدارة سجلات الطلاب والقبول والتسجيل
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تسجيل، تعديل، أرشفة الطلاب الجدد وإدارة الملفات السنتر</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="عرض أرشيف الطلاب والملفات الملغاة"
          >
            <Archive className="w-4 h-4 text-white" />
            <span>أرشيف الطلاب ({samsDb.getArchivedStudents().length})</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setIsEditing(false);
              setFormData({
                name: '', national_id: '', class_id: classes[0]?.id || '', grade_level: 'الأول الإعدادي', 
                education_type: 'عام',
                birth_date: '2016-01-01', phone: '', parent_name: '', parent_phone: '', status: 'active'
              });
              setShowAddForm(!showAddForm);
              setErrorMessage('');
            }}
            className="px-4 py-2 bg-[#1A7FAA] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#0D5C8C] transition-all cursor-pointer"
          >
            {showAddForm && !isEditing ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm && !isEditing ? 'إغلاق النموذج' : 'إضافة طالب جديد'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 rounded-xl flex items-center gap-3 text-sm font-bold">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3 text-sm font-bold">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p>{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={executeAddOrUpdate} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 space-y-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 border-b border-gray-100 dark:border-gray-700 pb-3">{isEditing ? 'تعديل بيانات الطالب المحددة' : 'تسجيل قيد طالب جديد'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم الطالب الرباعي <span className="text-rose-500">*</span></label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A7FAA]/30 focus:border-[#1A7FAA] outline-none transition-all" placeholder="الاسم كامل..." />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">هاتف الطالب <span className="text-slate-400 font-normal text-[11px]">(اختياري)</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A7FAA]/30 outline-none" placeholder="01X XXXX XXXX (اختياري)" dir="ltr" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">نوع التعليم <span className="text-rose-500">*</span></label>
                  <select 
                    required 
                    name="education_type" 
                    value={formData.education_type} 
                    onChange={(e) => {
                      const newEd = e.target.value as 'عام' | 'أزهر';
                      const avail = classes.filter(c => (c.education_type || 'عام') === newEd);
                      setFormData(prev => ({
                        ...prev,
                        education_type: newEd,
                        class_id: avail.length > 0 ? avail[0].id : ''
                      }));
                    }} 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                  >
                    <option value="عام">عام</option>
                    <option value="أزهر">أزهر</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">المجموعة المخصصة ({formData.education_type}) <span className="text-rose-500">*</span></label>
                  <select required name="class_id" value={formData.class_id} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none">
                    {classes.filter(c => (c.education_type || 'عام') === (formData.education_type || 'عام')).length === 0 ? (
                      <option value="" disabled>-- لا توجد مجموعات ({formData.education_type}) متاحة --</option>
                    ) : (
                      classes.filter(c => (c.education_type || 'عام') === (formData.education_type || 'عام')).map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.grade_level})</option>
                      ))
                    )}
                  </select>
                  {classes.filter(c => (c.education_type || 'عام') === (formData.education_type || 'عام')).length === 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-sans mt-1">
                      ⚠️ لا توجد مجموعات معرفة لـ "{formData.education_type}". يرجى إضافة مجموعة أزهر/عام أولاً.
                    </p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">الصف الدراسي <span className="text-rose-500">*</span></label>
                  <select required name="grade_level" value={formData.grade_level} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none">
                        <option value="الأول الإعدادي">الأول الإعدادي</option>
                <option value="الثاني الإعدادي">الثاني الإعدادي</option>
                <option value="الثالث الإعدادي">الثالث الإعدادي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">تاريخ الميلاد <span className="text-rose-500">*</span></label>
                  <input required type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">حالة القيد <span className="text-slate-400 font-normal text-[11px]">(اختياري)</span></label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none">
                    <option value="active">مفعل ومنتظم</option>
                    <option value="inactive">مجمد مؤقتاً</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم ولي الأمر <span className="text-rose-500">*</span></label>
                  <input required type="text" name="parent_name" value={formData.parent_name} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="الاسم..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">رقم هاتف ولي الأمر (للطوارئ) <span className="text-rose-500">*</span></label>
                  <input required type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="01X XXXX XXXX" dir="ltr" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl ml-3">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-[#1A7FAA] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#0D5C8C]">
                  {isEditing ? 'حفظ التعديلات المطبقة' : 'حفظ وتسجيل الطالب المذكور'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Tools Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="البحث بالاسم المذكور أو بكود التسجيل..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-w-[200px] max-w-full flex-1 pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7FAA]/30 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
        <div className="flex w-full md:w-auto items-center gap-3 overflow-x-auto no-scrollbar">
          <select value={educationTypeFilter} onChange={e => setEducationTypeFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer font-bold">
            <option value="all">كل أنواع التعليم (عام / أزهر)</option>
            <option value="عام">عام</option>
            <option value="أزهر">أزهر</option>
          </select>
          <select value={gradeLevelFilter} onChange={e => setGradeLevelFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">كل الصفوف الدراسية</option>
            <option value="الأول الإعدادي">الأول الإعدادي</option>
            <option value="الثاني الإعدادي">الثاني الإعدادي</option>
            <option value="الثالث الإعدادي">الثالث الإعدادي</option>
            <option value="الأول الثانوي">الأول الثانوي</option>
            <option value="الثاني الثانوي">الثاني الثانوي</option>
            <option value="الثالث الثانوي">الثالث الثانوي</option>
          </select>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
              <option value="all">كل المجموعات (الكل)</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">كل الحالات (مفعل/غير مفعل)</option>
            <option value="active">المنتظمون فقط (مفعل)</option>
            <option value="inactive">المجمدون فقط (غير مفعل)</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-250px)]">
          <table className="w-full text-sm text-right">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold shadow-sm whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4 pr-6">م</th>
                  <th className="px-4 py-4 min-w-[200px]">بيانات الطالب</th>
                  <th className="px-4 py-4 min-w-[150px]">المجموعة والصف الدراسي</th>
                  <th className="px-4 py-4 min-w-[140px]">رقم ولي الأمر</th>
                  <th className="px-4 py-4 text-left pl-6 min-w-[160px]">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 pr-6 text-xs text-slate-400 font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400 font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm leading-tight">{student.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">#{student.registration_id}</p>
                            {student.status === 'active' ? (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> منتظم</span>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 dark:text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> غير منتظم</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#0D5C8C] text-xs bg-sky-50 dark:bg-sky-900/40 px-2 py-1 rounded-md inline-flex items-center w-fit border border-sky-100 dark:border-sky-800">
                            {classes.find(c => c.id === student.class_id)?.name || '-'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                            (student.education_type || classes.find(c => c.id === student.class_id)?.education_type || 'عام') === 'أزهر'
                              ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {(student.education_type || classes.find(c => c.id === student.class_id)?.education_type || 'عام') === 'أزهر' ? 'أزهر' : 'عام'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 mr-1">{student.grade_level}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-700" dir="ltr">
                        {student.parent_phone}
                      </span>
                    </td>
                    <td className="px-4 py-3 pl-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedProfile(student);
                            setShowBriefProfile(true);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-[#1A7FAA] hover:bg-sky-50 dark:hover:bg-sky-900/40 rounded-lg transition-colors" 
                          title="عرض الملف"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProfile(student);
                            setShowFullReport(true);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition-colors" 
                          title="التقرير الشامل"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditClick(student)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg transition-colors" title="تعديل">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(student)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/40 rounded-lg transition-colors cursor-pointer" title="أرشفة الطالب">
                          <Archive className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p>لا توجد سجلات طلاب مطابقة للشروط الحالية</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      <AnimatePresence>
        {selectedProfile && showBriefProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-5 overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm flex items-center gap-2">
                    الملف الأكاديمي والشخصي
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowBriefProfile(false);
                        setSelectedProfile(null);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-[#1A7FAA]/10 flex items-center justify-center border border-[#1A7FAA]/20 text-[#1A7FAA] dark:text-sky-400 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm leading-tight">{selectedProfile.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">قيد: #{selectedProfile.registration_id}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">المجموعة المقيد بها</span>
                    <span className="font-bold text-[#1A7FAA] dark:text-sky-400 bg-[#1A7FAA]/5 px-2 py-0.5 rounded">{classes.find(c => c.id === selectedProfile.class_id)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between p-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">الصف الدراسي</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedProfile.grade_level}</span>
                  </div>
                  <div className="flex justify-between p-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">تاريخ الميلاد</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">{selectedProfile.birth_date}</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-slate-500 dark:text-slate-400">هاتف ولي الأمر</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300" dir="ltr">{selectedProfile.parent_phone}</span>
                  </div>
                </div>

                {(() => {
                  const stats = getStudentAttendanceStats(selectedProfile.id);
                  return (
                    <div className={`p-3 border rounded-xl space-y-2 text-xs ${stats.bgClass}`}>
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>حضور وانتظام الطالب</span>
                        <span className={`font-extrabold ${stats.statusColor}`}>{stats.statusLabel}</span>
                      </div>
                      <p className={`text-[10px] ${stats.statusColor} opacity-80 leading-relaxed`}>{stats.description}</p>
                    </div>
                  );
                })()}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowBriefProfile(false);
                      setShowFullReport(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#1A7FAA] hover:bg-[#156a8e] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    عرض التقرير الشامل للطالب
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {studentToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden space-y-4"
            >
              <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/40 rounded-2xl">
                  <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">تأكيد أرشفة الطالب</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">نقل سجل الطالب إلى الأرشيف</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-orange-50/50 dark:bg-orange-900/20 p-3.5 rounded-xl border border-orange-100 dark:border-orange-800">
                هل أنت متأكد من رغبتك في أرشفة الطالب <strong className="text-slate-900 dark:text-slate-50">"{studentToDelete.name}"</strong>؟ سيتم نقله إلى الأرشيف ولن يظهر في القوائم النشطة.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  تأكيد الأرشفة 📦
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>




    </motion.div>
    </>
  );
}
