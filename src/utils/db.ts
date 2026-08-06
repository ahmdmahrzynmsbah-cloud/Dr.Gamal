/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Teacher, ClassRoom, Subject, Grade, Attendance, ClassSchedule, FeePayment, SystemNotification, AuditLog, CenterScheduleData, Exam, Assignment, ExamGrade, AssignmentGrade } from '../types';
import { playNotificationTone, getToneForCategory } from './audioAlerts';
import { syncToFirebase, initFirebaseSync } from './firebaseSync';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_FEES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CENTER_SCHEDULE
} from '../data/initialData';

// KEYS FOR LOCALSTORAGE
const KEYS = {
  STUDENTS: 'sams_v2_students',
  TEACHERS: 'sams_v2_teachers',
  CLASSES: 'sams_v2_classes',
  SUBJECTS: 'sams_v2_subjects',
  GRADES: 'sams_v2_grades',
  ATTENDANCE: 'sams_v2_attendance',
  FEES: 'sams_v2_fees',
  NOTIFICATIONS: 'sams_v2_notifications',
  AUDIT_LOGS: 'sams_v2_audit_logs',
  CURRENT_USER_ROLE: 'sams_v2_current_user_role',
  CENTER_SCHEDULE: 'sams_v2_center_schedule',
  EXAMS: 'sams_v2_exams',
  ASSIGNMENTS: 'sams_v2_assignments',
  EXAM_GRADES: 'sams_v2_exam_grades',
  ASSIGNMENT_GRADES: 'sams_v2_assignment_grades'
};

// LOAD INITIAL DATA OR USE SAVED STATE
function loadFromStorage<T>(key: string, defaultVal: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    const parsed = JSON.parse(data);
    return parsed as T;
  } catch (e) {
    return defaultVal;
  }
}

export function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sams_db_sync', { detail: { key } }));
  }
  syncToFirebase(key, data);
}

// SIMULATE TIME STAMP
function getCurrentTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// AUDIT RECORDER
export function addAuditLog(actionType: 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'QUERY', tableName: string, recordId: string, details: string) {
  const loggedInRole = localStorage.getItem('sams_logged_in_role');
  const loggedInName = localStorage.getItem('sams_logged_in_name');

  const role = loggedInRole || localStorage.getItem(KEYS.CURRENT_USER_ROLE) || 'admin';
  const roleAr = {
    admin: 'مدير النظام الأعلى',
    principal: 'مدير السنتر',
    teacher: 'المدير الأكاديمي',
    secretary: 'السكرتارية',
    parent: 'ولي الأمر',
    student: 'طالب'
  }[role] || 'مدير النظام';

  const user_name = loggedInName || {
    admin: 'م. أشرف ممدوح',
    principal: 'أ. رشا فوزي - المسجل',
    teacher: 'المدير الأكاديمي',
    secretary: 'أ. سارة علي',
    parent: 'أبو أحمد الشافعي',
    student: 'أحمد الشافعي'
  }[role] || 'مستخدم غير معروف';

  const logs = loadFromStorage<AuditLog[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const newLog: AuditLog = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_name,
    user_role: role,
    action_type: actionType,
    table_name: tableName,
    record_id: recordId,
    details,
    timestamp: getCurrentTimestamp()
  };
  logs.unshift(newLog); // newer first
  saveToStorage(KEYS.AUDIT_LOGS, logs);
  return newLog;
}

export function deriveParentName(studentName: string): string {
  const trimmed = (studentName || '').trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return trimmed;

  // Handle compound first names in Arabic (e.g., "عبد الرحمن", "عبد الله", "سيف الدين")
  if (parts.length >= 3) {
    const p0 = parts[0];
    const p1 = parts[1];
    if (['عبد', 'أبو', 'ابو', 'أم', 'ام'].includes(p0)) {
      return parts.slice(2).join(' ');
    }
    if (['الدين', 'الإسلام', 'الاسلام'].includes(p1)) {
      return parts.slice(2).join(' ');
    }
  }

  return parts.slice(1).join(' ');
}

export const samsDb = {
  // SET CURRENT USER ROLE
  getCurrentRole(): 'admin' | 'principal' | 'teacher' | 'parent' | 'student' {
    return loadFromStorage<'admin' | 'principal' | 'teacher' | 'parent' | 'student'>(KEYS.CURRENT_USER_ROLE, 'teacher');
  },
  
  setCurrentRole(role: 'admin' | 'principal' | 'teacher' | 'parent' | 'student') {
    saveToStorage(KEYS.CURRENT_USER_ROLE, role);
    addAuditLog('QUERY', 'users', 'session', `تغيير دور المستخدم الحالي إلى: ${role}`);
  },

  // STUDENTS CRUD
  getStudents(includeArchivedOrSuspended = true): Student[] {
    const students = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    // filter soft deletions
    return students.filter(s => !s.deleted_at);
  },

  addStudent(student: Omit<Student, 'id' | 'registration_id' | 'created_at'>): { success: boolean; error?: string; student?: Student } {
    const students = this.getStudents();

    const parentNameFinal = (student.parent_name && student.parent_name.trim())
      ? student.parent_name.trim()
      : deriveParentName(student.name);

    const regId = String(new Date().getFullYear()) + String(students.length + 10001).substring(1);
    const newStudent: Student = {
      ...student,
      parent_name: parentNameFinal,
      id: `s-${Date.now()}`,
      registration_id: regId,
      created_at: getCurrentTimestamp()
    };

    const allStudents = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    allStudents.push(newStudent);
    saveToStorage(KEYS.STUDENTS, allStudents);

    addAuditLog('INSERT', 'students', newStudent.id, `تسجيل الطالب الجديد: ${newStudent.name} بصف ${newStudent.grade_level}`);
    return { success: true, student: newStudent };
  },

  updateStudent(student: Student): { success: boolean; error?: string } {
    const allStudents = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = allStudents.findIndex(s => s.id === student.id);
    if (idx === -1) {
      return { success: false, error: 'الطالب غير موجود بقاعدة البيانات.' };
    }

    allStudents[idx] = { ...student };
    saveToStorage(KEYS.STUDENTS, allStudents);
    
    addAuditLog('UPDATE', 'students', student.id, `تحديث بيانات الطالب: ${student.name}، حالة القيد: ${student.status}`);
    return { success: true };
  },

  softDeleteStudent(id: string): boolean {
    const allStudents = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = allStudents.findIndex(s => s.id === id);
    if (idx !== -1) {
      const studentName = allStudents[idx].name;
      allStudents[idx].deleted_at = getCurrentTimestamp();
      saveToStorage(KEYS.STUDENTS, allStudents);
      addAuditLog('SOFT_DELETE', 'students', id, `أرشفة الطالب: ${studentName}`);
      return true;
    }
    return false;
  },

  getArchivedStudents(): Student[] {
    const students = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    return students.filter(s => !!s.deleted_at);
  },

  restoreStudent(id: string): boolean {
    const allStudents = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = allStudents.findIndex(s => s.id === id);
    if (idx !== -1) {
      const studentName = allStudents[idx].name;
      delete allStudents[idx].deleted_at;
      saveToStorage(KEYS.STUDENTS, allStudents);
      addAuditLog('UPDATE', 'students', id, `استعادة الطالب من الأرشيف: ${studentName}`);
      return true;
    }
    return false;
  },

  permanentlyDeleteStudent(id: string): boolean {
    const allStudents = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = allStudents.findIndex(s => s.id === id);
    if (idx !== -1) {
      const studentName = allStudents[idx].name;
      allStudents.splice(idx, 1);
      saveToStorage(KEYS.STUDENTS, allStudents);
      addAuditLog('DELETE', 'students', id, `حذف نهائي لبيانات الطالب: ${studentName}`);
      return true;
    }
    return false;
  },

  // TEACHERS CRUD
  getTeachers(): Teacher[] {
    const teachers = loadFromStorage<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
    return teachers.filter(t => !t.deleted_at);
  },

  addTeacher(teacher: Omit<Teacher, 'id' | 'joined_date'>): { success: boolean; error?: string; teacher?: Teacher } {
    if (teacher.national_id.length !== 14) {
      return { success: false, error: 'الرقم القومي للمعلم يجب أن يكون 14 رقماً.' };
    }
    const teachers = this.getTeachers();
    if (teachers.some(t => t.national_id === teacher.national_id)) {
      return { success: false, error: 'المعلم مسجل مسبقاً بنفس الرقم القومي.' };
    }

    const newTeacher: Teacher = {
      ...teacher,
      id: `t-${Date.now()}`,
      joined_date: getCurrentTimestamp().split(' ')[0]
    };

    const allTeachers = loadFromStorage<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
    allTeachers.push(newTeacher);
    saveToStorage(KEYS.TEACHERS, allTeachers);

    addAuditLog('INSERT', 'teachers', newTeacher.id, `تسجيل المعلم الجديد: ${newTeacher.name} - تخصص ${newTeacher.specialization}`);
    return { success: true, teacher: newTeacher };
  },

  updateTeacher(teacher: Teacher): boolean {
    const allTeachers = loadFromStorage<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
    const idx = allTeachers.findIndex(t => t.id === teacher.id);
    if (idx !== -1) {
      allTeachers[idx] = { ...teacher };
      saveToStorage(KEYS.TEACHERS, allTeachers);
      addAuditLog('UPDATE', 'teachers', teacher.id, `تحديث بيانات المعلم: ${teacher.name}`);
      return true;
    }
    return false;
  },

  softDeleteTeacher(id: string): boolean {
    const allTeachers = loadFromStorage<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
    const idx = allTeachers.findIndex(t => t.id === id);
    if (idx !== -1) {
      const name = allTeachers[idx].name;
      allTeachers[idx].deleted_at = getCurrentTimestamp();
      saveToStorage(KEYS.TEACHERS, allTeachers);
      addAuditLog('SOFT_DELETE', 'teachers', id, `حذف المعلم: ${name}`);
      return true;
    }
    return false;
  },

  // CLASSES & SUBJECTS
  getClasses(): ClassRoom[] {
    return loadFromStorage<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
  },

  addClass(cls: ClassRoom) {
    const classes = this.getClasses();
    classes.push(cls);
    saveToStorage(KEYS.CLASSES, classes);
    addAuditLog('INSERT', 'classes', cls.id, `إنشاء مجموعة دراسي جديد: ${cls.name}`);
  },

  deleteClass(id: string): { success: boolean; error?: string } {
    const students = this.getStudents();
    const classStudents = students.filter(s => s.class_id === id);
    if (classStudents.length > 0) {
      return { success: false, error: `لا يمكن حذف هذه المجموعة لوجود عدد (${classStudents.length}) طلاب مقيدين بها حالياً. برجاء نقل الطلاب لمجموعات أخرى أولاً.` };
    }
    const classes = this.getClasses();
    const classObj = classes.find(c => c.id === id);
    const className = classObj ? classObj.name : id;
    const filtered = classes.filter(c => c.id !== id);
    saveToStorage(KEYS.CLASSES, filtered);
    addAuditLog('DELETE', 'classes', id, `حذف المجموعة الدراسية: ${className}`);
    return { success: true };
  },

  updateClass(cls: ClassRoom): { success: boolean; error?: string } {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === cls.id);
    if (idx !== -1) {
      classes[idx] = { ...cls };
      saveToStorage(KEYS.CLASSES, classes);
      addAuditLog('UPDATE', 'classes', cls.id, `تحديث بيانات المجموعة الدراسية: ${cls.name}`);
      return { success: true };
    }
    return { success: false, error: 'المجموعة الدراسية غير موجودة.' };
  },

  saveClasses(classes: ClassRoom[]) {
    saveToStorage(KEYS.CLASSES, classes);
    addAuditLog('UPDATE', 'classes', 'all', 'تحديث إعادة ترتيب المجموعات الدراسية');
  },

  getSubjects(): Subject[] {
    return loadFromStorage<Subject[]>(KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },

  addSubject(sub: Subject) {
    const subjects = this.getSubjects();
    subjects.push(sub);
    saveToStorage(KEYS.SUBJECTS, subjects);
    addAuditLog('INSERT', 'subjects', sub.id, `إضافة مادة: ${sub.name} وتوزيعها أسبوعياً`);
  },

  // GRADES CRUD
  getGrades(): Grade[] {
    return loadFromStorage<Grade[]>(KEYS.GRADES, INITIAL_GRADES);
  },

  saveGrade(grade: Omit<Grade, 'id' | 'total' | 'grade_label' | 'updated_at'>): Grade {
    const total = Number(grade.exam_grade) + Number(grade.class_work);
    let label = 'ضعيف';
    if (total >= 90) label = 'ممتاز';
    else if (total >= 80) label = 'جيد جداً';
    else if (total >= 65) label = 'جيد';
    else if (total >= 50) label = 'مقبول';

    const grades = this.getGrades();
    const existingIdx = grades.findIndex(g => g.student_id === grade.student_id && g.subject_id === grade.subject_id && g.term === grade.term);
    
    const students = this.getStudents();
    const studentObj = students.find(s => s.id === grade.student_id);
    const studentName = studentObj ? studentObj.name : `كود:${grade.student_id}`;

    const subjects = this.getSubjects();
    const subjectObj = subjects.find(sub => sub.id === grade.subject_id);
    const subjectName = subjectObj ? subjectObj.name : `كود:${grade.subject_id}`;

    let resultGrade: Grade;
    if (existingIdx !== -1) {
      grades[existingIdx] = {
        ...grades[existingIdx],
        exam_grade: grade.exam_grade,
        class_work: grade.class_work,
        total,
        grade_label: label,
        teacher_notes: grade.teacher_notes,
        updated_at: getCurrentTimestamp().split(' ')[0]
      };
      resultGrade = grades[existingIdx];
      addAuditLog('UPDATE', 'grades', resultGrade.id, `رصد/تحديث درجة الطالب (${studentName}) لمادة (${subjectName}) - الامتحان: ${grade.exam_grade}، أعمال السنة: ${grade.class_work}، المجموع: ${total} (${label})`);
    } else {
      const newGrade: Grade = {
        ...grade,
        id: `g-${Date.now()}`,
        total,
        grade_label: label,
        updated_at: getCurrentTimestamp().split(' ')[0]
      };
      grades.push(newGrade);
      resultGrade = newGrade;
      addAuditLog('INSERT', 'grades', newGrade.id, `إدخال درجة جديدة للطالب (${studentName}) لمادة (${subjectName}) - الامتحان: ${grade.exam_grade}، أعمال السنة: ${grade.class_work}، المجموع: ${total} (${label})`);
    }

    saveToStorage(KEYS.GRADES, grades);
    return resultGrade;
  },

  // ATTENDANCE
  getAttendance(): Attendance[] {
    return loadFromStorage<Attendance[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  saveAttendance(student_id: string, class_id: string, date: string, status: 'present' | 'absent' | 'excused', notify = false): Attendance {
    const list = this.getAttendance();
    const idx = list.findIndex(a => a.student_id === student_id && a.date === date);
    
    const students = this.getStudents();
    const studentObj = students.find(item => item.id === student_id);
    const studentName = studentObj ? studentObj.name : `كود:${student_id}`;
    const statusAr = status === 'present' ? 'حضور' : status === 'absent' ? 'غياب' : 'غياب بعذر';

    let result: Attendance;
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].notified_parent = list[idx].notified_parent || notify;
      result = list[idx];
      addAuditLog('UPDATE', 'attendance', result.id, `تعديل حالة حضور الطالب (${studentName}) وتعيينها إلى: ${statusAr}`);
    } else {
      const newAtt: Attendance = {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        student_id,
        class_id,
        date,
        status,
        notified_parent: notify
      };
      list.push(newAtt);
      result = newAtt;
      addAuditLog('INSERT', 'attendance', newAtt.id, `تسجيل حضور الطالب (${studentName}) بتاريخ ${date} كـ ${statusAr}`);
    }

    saveToStorage(KEYS.ATTENDANCE, list);

    if (status === 'absent') {
      const loggedInRole = localStorage.getItem('sams_logged_in_role') || 'admin';
      const loggedInName = localStorage.getItem('sams_logged_in_name') || 'مستخدم النظام';
      const roleText = (loggedInRole === 'secretary' || loggedInName.includes('سارة') || loggedInName.includes('سكرتيرة')) ? 'السكرتيرة' : 'الإدارة';
      
      this.addAdminNotification({
        type: 'absence',
        message: `سجلت ${roleText} (${loggedInName}) غياب للطالب/ة (${studentName})`,
        metadata: { student_id, date, actor: loggedInName }
      });
    }

    // If student is absent, create automatic notifications center notice simulating SMS/Email
    if (status === 'absent' && notify) {
      const students = this.getStudents();
      const s = students.find(item => item.id === student_id);
      if (s) {
        this.addNotification({
          title: `إشعار غياب تلقائي: ${s.name}`,
          message: `عزيزي ولي الأمر (${s.parent_name})، نحيطكم علماً بغياب ابنكم اليوم ${date} دون إذن مسبق. الرجاء مراجعة غيابه لتفادي تجاوز النسبة المسموحة.`,
          category: 'sms',
          recipient_type: 'specific',
          recipient_id: student_id
        });
      }
    }

    return result;
  },

  resetClassAttendance(class_id: string, date: string) {
    const list = this.getAttendance();
    const students = this.getStudents().filter(s => s.class_id === class_id);
    const studentIds = students.map(s => s.id);
    
    // Filter out any attendance records for these students on this date
    const filteredList = list.filter(a => !(studentIds.includes(a.student_id) && a.date === date));
    saveToStorage(KEYS.ATTENDANCE, filteredList);
    addAuditLog('DELETE', 'attendance', class_id, `إعادة تعيين وإلغاء تسجيل حضور وغياب جميع طلاب المجموعة (${class_id}) لتاريخ ${date}`);
  },

  // FEES
  getFees(): FeePayment[] {
    return loadFromStorage<FeePayment[]>(KEYS.FEES, INITIAL_FEES);
  },

  addPayment(payment: Omit<FeePayment, 'id' | 'receipt_number'>): FeePayment {
    const list = this.getFees();
    const receipt_number = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPay: FeePayment = {
      ...payment,
      id: `fee-${Date.now()}`,
      receipt_number
    };
    list.push(newPay);
    saveToStorage(KEYS.FEES, list);

    const students = this.getStudents();
    const studentObj = students.find(s => s.id === payment.student_id);
    const studentName = studentObj ? studentObj.name : `كود:${payment.student_id}`;

    const categoryAr = {
      tuition: 'مصروفات دراسية',
      bus: 'اشتراك باص',
      uniform: 'زي مدرسي',
      activities: 'أنشطة وخدمات'
    }[payment.category] || 'رسوم أخرى';

    addAuditLog('INSERT', 'fees', newPay.id, `تسجيل دفعة مالية بقيمة ${payment.amount} ج.م للطالب (${studentName}). بند الدفع: ${categoryAr}، إيصال رقم ${receipt_number}`);
    return newPay;
  },

  deleteFeePayment(id: string): boolean {
    const list = this.getFees();
    const paymentObj = list.find(f => f.id === id);
    const receiptNum = paymentObj ? paymentObj.receipt_number : id;
    const filtered = list.filter(f => f.id !== id);
    saveToStorage(KEYS.FEES, filtered);
    
    const students = this.getStudents();
    const studentObj = paymentObj ? students.find(s => s.id === paymentObj.student_id) : null;
    const studentName = studentObj ? studentObj.name : 'طالب';
    addAuditLog('DELETE', 'fees', id, `حذف وإلغاء إيصال السداد رقم ${receiptNum} للطالب (${studentName})`);
    return true;
  },

  // NOTIFICATIONS
  getNotifications(): SystemNotification[] {
    return loadFromStorage<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(noti: Omit<SystemNotification, 'id' | 'created_at' | 'sent_status'>): SystemNotification {
    const list = this.getNotifications();
    const newNoti: SystemNotification = {
      ...noti,
      id: `not-${Date.now()}`,
      created_at: getCurrentTimestamp(),
      sent_status: 'sent'
    };
    list.unshift(newNoti);
    saveToStorage(KEYS.NOTIFICATIONS, list);
    
    addAuditLog('INSERT', 'notifications', newNoti.id, `إرسال إشعار: (${noti.title}) متوجه إلى ${noti.recipient_type}`);

    // Trigger audio tone & dispatch visual notification event
    if (localStorage.getItem('sams_notification_sound_enabled') !== 'false') {
      playNotificationTone(getToneForCategory(noti.category));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sams_notification_created', {
        detail: { title: noti.title, message: noti.message, category: noti.category }
      }));
    }

    return newNoti;
  },

  // ADMIN NOTIFICATIONS
  getAdminNotifications(): import('../types').AdminNotification[] {
    return loadFromStorage<import('../types').AdminNotification[]>('sams_admin_notifications', []);
  },
  
  addAdminNotification(noti: Omit<import('../types').AdminNotification, 'id' | 'created_at' | 'read'>) {
    const list = this.getAdminNotifications();
    const newNoti: import('../types').AdminNotification = {
      ...noti,
      id: `admin-notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      read: false
    };
    list.unshift(newNoti); // add to top
    saveToStorage('sams_admin_notifications', list);

    // Trigger audio tone & dispatch visual notification event
    if (localStorage.getItem('sams_notification_sound_enabled') !== 'false') {
      playNotificationTone(getToneForCategory(noti.type));
    }
    const notiTitle = noti.type === 'payment_reminder' ? 'تنبيه استحقاق رسوم دراسية' : noti.type === 'absence' ? 'تنبيه غياب طالب' : 'إشعار إداري جديد';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sams_notification_created', {
        detail: { title: notiTitle, message: noti.message, category: noti.type }
      }));
      window.dispatchEvent(new Event('sams_admin_notifications_changed'));
    }

    return newNoti;
  },

  markAdminNotificationRead(id: string) {
    const list = this.getAdminNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      saveToStorage('sams_admin_notifications', list);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('sams_admin_notifications_changed'));
    }
  },
  
  markAllAdminNotificationsRead() {
    const list = this.getAdminNotifications();
    list.forEach(n => n.read = true);
    saveToStorage('sams_admin_notifications', list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('sams_admin_notifications_changed'));
  },


  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    return loadFromStorage<AuditLog[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  getCenterSchedule(): CenterScheduleData {
    return loadFromStorage<CenterScheduleData>(KEYS.CENTER_SCHEDULE, INITIAL_CENTER_SCHEDULE);
  },

  saveCenterSchedule(data: CenterScheduleData) {
    saveToStorage(KEYS.CENTER_SCHEDULE, data);
  },

  // EXAMS CRUD
  getExams(): Exam[] {
    return loadFromStorage<Exam[]>(KEYS.EXAMS, []);
  },
  
  saveExam(exam: Exam) {
    const list = this.getExams();
    const idx = list.findIndex(e => e.id === exam.id);
    if (idx !== -1) {
      list[idx] = exam;
      addAuditLog('UPDATE', 'exams', exam.id, `تعديل بيانات الامتحان: ${exam.name}`);
    } else {
      list.push(exam);
      addAuditLog('INSERT', 'exams', exam.id, `إنشاء امتحان جديد: ${exam.name} - درجة عظمى: ${exam.max_score}، مدته: ${exam.duration_mins} دقيقة`);
    }
    saveToStorage(KEYS.EXAMS, list);
  },
  
  deleteExam(id: string) {
    const list = this.getExams();
    const examObj = list.find(e => e.id === id);
    const examName = examObj ? examObj.name : id;
    const filtered = list.filter(e => e.id !== id);
    saveToStorage(KEYS.EXAMS, filtered);

    // Clean exam grades
    const examGrades = this.getExamGrades().filter(g => g.exam_id !== id);
    saveToStorage(KEYS.EXAM_GRADES, examGrades);

    addAuditLog('DELETE', 'exams', id, `حذف الامتحان: ${examName}`);
  },

  // ASSIGNMENTS CRUD
  getAssignments(): Assignment[] {
    return loadFromStorage<Assignment[]>(KEYS.ASSIGNMENTS, []);
  },
  
  saveAssignment(assignment: Assignment) {
    const list = this.getAssignments();
    const idx = list.findIndex(a => a.id === assignment.id);
    if (idx !== -1) {
      list[idx] = assignment;
      addAuditLog('UPDATE', 'assignments', assignment.id, `تعديل بيانات الواجب: ${assignment.title}`);
    } else {
      list.push(assignment);
      addAuditLog('INSERT', 'assignments', assignment.id, `إنشاء واجب جديد: ${assignment.title} - درجة عظمى: ${assignment.max_score}`);
    }
    saveToStorage(KEYS.ASSIGNMENTS, list);
  },
  
  deleteAssignment(id: string) {
    const list = this.getAssignments();
    const assignObj = list.find(a => a.id === id);
    const title = assignObj ? assignObj.title : id;
    const filtered = list.filter(a => a.id !== id);
    saveToStorage(KEYS.ASSIGNMENTS, filtered);

    // Clean assignment grades
    const assignGrades = this.getAssignmentGrades().filter(g => g.assignment_id !== id);
    saveToStorage(KEYS.ASSIGNMENT_GRADES, assignGrades);

    addAuditLog('DELETE', 'assignments', id, `حذف الواجب: ${title}`);
  },

  // EXAM GRADES
  getExamGrades(): ExamGrade[] {
    return loadFromStorage<ExamGrade[]>(KEYS.EXAM_GRADES, []);
  },
  
  saveExamGrade(grade: Omit<ExamGrade, 'updated_at'>) {
    const list = this.getExamGrades();
    const idx = list.findIndex(g => g.exam_id === grade.exam_id && g.student_id === grade.student_id);
    const updated: ExamGrade = {
      ...grade,
      id: grade.id || (idx !== -1 ? list[idx].id : `eg-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
      updated_at: getCurrentTimestamp().split(' ')[0]
    };
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    saveToStorage(KEYS.EXAM_GRADES, list);
    
    // Log exam score
    const students = this.getStudents();
    const studentName = students.find(s => s.id === grade.student_id)?.name || grade.student_id;
    const exams = this.getExams();
    const examName = exams.find(e => e.id === grade.exam_id)?.name || grade.exam_id;
    addAuditLog('UPDATE', 'exam_grades', updated.id, `رصد درجة الطالب (${studentName}) لـ (${examName}): ${grade.absent ? 'غياب' : grade.score}`);
  },

  // ASSIGNMENT GRADES
  getAssignmentGrades(): AssignmentGrade[] {
    return loadFromStorage<AssignmentGrade[]>(KEYS.ASSIGNMENT_GRADES, []);
  },
  
  saveAssignmentGrade(grade: Omit<AssignmentGrade, 'updated_at'>) {
    const list = this.getAssignmentGrades();
    const idx = list.findIndex(g => g.assignment_id === grade.assignment_id && g.student_id === grade.student_id);
    const updated: AssignmentGrade = {
      ...grade,
      id: grade.id || (idx !== -1 ? list[idx].id : `ag-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
      updated_at: getCurrentTimestamp().split(' ')[0]
    };
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    saveToStorage(KEYS.ASSIGNMENT_GRADES, list);

    // Log assignment score
    const students = this.getStudents();
    const studentName = students.find(s => s.id === grade.student_id)?.name || grade.student_id;
    const assignments = this.getAssignments();
    const assignTitle = assignments.find(a => a.id === grade.assignment_id)?.title || grade.assignment_id;
    addAuditLog('UPDATE', 'assignment_grades', updated.id, `رصد واجب الطالب (${studentName}) لـ (${assignTitle}): ${grade.completed ? `تم التسليم (الدرجة: ${grade.score})` : 'لم يتم التسليم'}`);
  },

  // Merge duplicates
  mergeStudents(keepId: string, deleteIds: string[]) {
    if (!deleteIds.length) return;

    // 1. Update Attendance
    const attendance = loadFromStorage<Attendance[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    let changedAttendance = false;
    attendance.forEach(a => {
      if (deleteIds.includes(a.student_id)) {
        a.student_id = keepId;
        changedAttendance = true;
      }
    });
    if (changedAttendance) saveToStorage(KEYS.ATTENDANCE, attendance);

    // 2. Update Fees
    const fees = loadFromStorage<FeePayment[]>(KEYS.FEES, INITIAL_FEES);
    let changedFees = false;
    fees.forEach(f => {
      if (deleteIds.includes(f.student_id)) {
        f.student_id = keepId;
        changedFees = true;
      }
    });
    if (changedFees) saveToStorage(KEYS.FEES, fees);

    // 3. Update Grades
    const grades = loadFromStorage<Grade[]>(KEYS.GRADES, INITIAL_GRADES);
    let changedGrades = false;
    grades.forEach(g => {
      if (deleteIds.includes(g.student_id)) {
        g.student_id = keepId;
        changedGrades = true;
      }
    });
    if (changedGrades) saveToStorage(KEYS.GRADES, grades);

    // 4. Update Exam Grades
    const examGrades = loadFromStorage<ExamGrade[]>(KEYS.EXAM_GRADES, []);
    let changedExamGrades = false;
    examGrades.forEach(g => {
      if (deleteIds.includes(g.student_id)) {
        g.student_id = keepId;
        changedExamGrades = true;
      }
    });
    if (changedExamGrades) saveToStorage(KEYS.EXAM_GRADES, examGrades);

    // 5. Update Assignment Grades
    const assignmentGrades = loadFromStorage<AssignmentGrade[]>(KEYS.ASSIGNMENT_GRADES, []);
    let changedAssignmentGrades = false;
    assignmentGrades.forEach(g => {
      if (deleteIds.includes(g.student_id)) {
        g.student_id = keepId;
        changedAssignmentGrades = true;
      }
    });
    if (changedAssignmentGrades) saveToStorage(KEYS.ASSIGNMENT_GRADES, assignmentGrades);

    // 6. Delete the old students
    deleteIds.forEach(id => {
      this.permanentlyDeleteStudent(id);
    });

    addAuditLog('UPDATE', 'students', keepId, `تم دمج بيانات الطلاب وحذف النسخ المكررة (${deleteIds.join(', ')})`);
  },

  // SALARIES CRUD
  getSalaries(): any[] {
    return loadFromStorage<any[]>('sams_salaries', []);
  },

  saveSalaries(salaries: any[]) {
    saveToStorage('sams_salaries', salaries);
  },

  deleteSalaryPayment(id: string): boolean {
    const list = this.getSalaries();
    const filtered = list.filter(p => p.id !== id);
    saveToStorage('sams_salaries', filtered);
    addAuditLog('DELETE', 'salaries', id, `حذف سجل راتب`);
    return true;
  },

  // SYSTEM USERS CRUD
  getSystemUsers(): any[] {
    return loadFromStorage<any[]>('sams_system_users', []);
  },

  saveSystemUsers(users: any[]) {
    saveToStorage('sams_system_users', users);
  },

  // GRADE MONTHLY FEES CRUD
  getGradeMonthlyFees(): Record<string, number> {
    return loadFromStorage<Record<string, number>>('sams_grade_monthly_fees', {
      'الأول الإعدادي': 200,
      'الثاني الإعدادي': 200,
      'الثالث الإعدادي': 220,
      'الأول الثانوي': 250,
      'الثاني الثانوي': 280,
      'الثالث الثانوي': 350
    });
  },

  saveGradeMonthlyFees(fees: Record<string, number>) {
    saveToStorage('sams_grade_monthly_fees', fees);
  }
};

export function formatScheduleDisplay(scheduleTime?: string, scheduleDays?: string): string {
  if (!scheduleTime || !scheduleTime.trim()) {
    return scheduleDays || 'غير محدد';
  }

  const raw = scheduleTime.trim();
  const items = raw.split('|').map(s => s.trim()).filter(Boolean);
  if (items.length <= 1) {
    return raw;
  }

  const timeToDays: Record<string, string[]> = {};
  let validParse = true;

  for (const item of items) {
    const match = item.match(/^(.+?)\s*[\(:]\s*(.+?)\)?$/);
    if (match) {
      const day = match[1].trim();
      let time = match[2].trim();
      if (time.endsWith(')')) time = time.slice(0, -1).trim();

      if (!timeToDays[time]) {
        timeToDays[time] = [];
      }
      if (!timeToDays[time].includes(day)) {
        timeToDays[time].push(day);
      }
    } else {
      validParse = false;
      break;
    }
  }

  if (!validParse) {
    return raw;
  }

  const groupedParts = Object.entries(timeToDays).map(([time, days]) => {
    return `${days.join(' - ')} (${time})`;
  });

  return groupedParts.join(' | ');
}

