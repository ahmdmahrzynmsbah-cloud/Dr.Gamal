/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Teacher, ClassRoom, Subject, Grade, Attendance, ClassSchedule, FeePayment, SystemNotification, AuditLog, CenterScheduleData } from '../types';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'الدكتور أحمد كمال',
    national_id: '29001011234567',
    specialization: 'اللغة العربية وآدابها',
    phone: '01012345678',
    email: 'dr.arabic@sams.com',
    status: 'active',
    joined_date: '2025-09-01'
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'c-1',
    name: 'الأول الثانوي - مجموعة السبت 4:30م',
    schedule_days: 'السبت والثلاثاء',
    schedule_time: '16:30',
    capacity: 50,
    grade_level: 'الأول الثانوي'
  },
  {
    id: 'c-2',
    name: 'الثاني الثانوي - مجموعة الأحد 6:30م',
    schedule_days: 'الأحد والأربعاء',
    schedule_time: '18:30',
    capacity: 40,
    grade_level: 'الثاني الثانوي'
  },
  {
    id: 'c-3',
    name: 'الثالث الثانوي - مجموعة السبت 12:00م',
    schedule_days: 'السبت والخميس',
    schedule_time: '12:00',
    capacity: 60,
    grade_level: 'الثالث الثانوي'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-101',
    name: 'أحمد محمود عبد العزيز الجمل',
    national_id: '31005120104321',
    registration_id: '20261001',
    class_id: 'c-3',
    grade_level: 'الثالث الثانوي',
    birth_date: '2008-05-12',
    phone: '01223456781',
    parent_name: 'محمود عبد العزيز الجمل',
    parent_phone: '01023456781',
    status: 'active',
    created_at: '2026-02-01 10:00:00'
  },
  {
    id: 's-102',
    name: 'يوسف شريف عبد الهادي حسن',
    national_id: '31008240209876',
    registration_id: '20261002',
    class_id: 'c-3',
    grade_level: 'الثالث الثانوي',
    birth_date: '2008-08-24',
    phone: '01123456782',
    parent_name: 'شريف عبد الهادي حسن',
    parent_phone: '01223456782',
    status: 'active',
    created_at: '2026-02-01 10:15:00'
  },
  {
    id: 's-103',
    name: 'عبد الرحمن محمد علي الشافعي',
    national_id: '31004150102468',
    registration_id: '20261003',
    class_id: 'c-3',
    grade_level: 'الثالث الثانوي',
    birth_date: '2008-04-15',
    phone: '01523456783',
    parent_name: 'محمد علي الشافعي',
    parent_phone: '01023456783',
    status: 'active',
    created_at: '2026-02-02 09:30:00'
  },
  {
    id: 's-104',
    name: 'ندى عادل عبد الحميد متولي',
    national_id: '31011030101357',
    registration_id: '20261004',
    class_id: 'c-3',
    grade_level: 'الثالث الثانوي',
    birth_date: '2008-11-03',
    phone: '01023456784',
    parent_name: 'عادل عبد الحميد متولي',
    parent_phone: '01123456784',
    status: 'active',
    created_at: '2026-02-02 11:00:00'
  },
  {
    id: 's-105',
    name: 'مريم حسن إبراهيم عبد السلام',
    national_id: '31002180205555',
    registration_id: '20261005',
    class_id: 'c-3',
    grade_level: 'الثالث الثانوي',
    birth_date: '2008-02-18',
    phone: '01223456785',
    parent_name: 'حسن إبراهيم عبد السلام',
    parent_phone: '01523456785',
    status: 'active',
    created_at: '2026-02-03 14:20:00'
  },
  {
    id: 's-201',
    name: 'عمر ياسر عبد اللطيف خليل',
    national_id: '31109050103333',
    registration_id: '20262001',
    class_id: 'c-2',
    grade_level: 'الثاني الثانوي',
    birth_date: '2009-09-05',
    phone: '01123456786',
    parent_name: 'ياسر عبد اللطيف خليل',
    parent_phone: '01023456786',
    status: 'active',
    created_at: '2026-02-05 16:10:00'
  },
  {
    id: 's-202',
    name: 'سارة خالد محمود أبو العلا',
    national_id: '31112300104444',
    registration_id: '20262002',
    class_id: 'c-2',
    grade_level: 'الثاني الثانوي',
    birth_date: '2009-12-30',
    phone: '01223456787',
    parent_name: 'خالد محمود أبو العلا',
    parent_phone: '01123456787',
    status: 'active',
    created_at: '2026-02-05 16:45:00'
  },
  {
    id: 's-301',
    name: 'مصطفى كريم هشام مصطفى',
    national_id: '31201150201111',
    registration_id: '20263001',
    class_id: 'c-1',
    grade_level: 'الأول الثانوي',
    birth_date: '2010-01-15',
    phone: '01523456788',
    parent_name: 'كريم هشام مصطفى',
    parent_phone: '01223456788',
    status: 'active',
    created_at: '2026-02-08 10:00:00'
  },
  {
    id: 's-302',
    name: 'فاطمة محمد رامي زكي',
    national_id: '31206120102222',
    registration_id: '20263002',
    class_id: 'c-1',
    grade_level: 'الأول الثانوي',
    birth_date: '2010-06-12',
    phone: '01023456789',
    parent_name: 'محمد رامي زكي',
    parent_phone: '01523456789',
    status: 'active',
    created_at: '2026-02-08 11:30:00'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'اللغة العربية - النحو والبلاغة',
    class_id: 'c-3',
    teacher_id: 't-1',
    weekly_hours: 4
  }
];

export const INITIAL_GRADES: Grade[] = [];
export const INITIAL_ATTENDANCE: Attendance[] = [];
export const INITIAL_SCHEDULES: ClassSchedule[] = [];
export const INITIAL_FEES: FeePayment[] = [
  {
    id: 'f-1',
    student_id: 's-101',
    amount: 150,
    payment_date: '2026-03-01',
    payment_method: 'cash',
    term: 'first_term',
    receipt_number: 'REC-2026-1024',
    category: 'tuition'
  },
  {
    id: 'f-2',
    student_id: 's-103',
    amount: 150,
    payment_date: '2026-03-01',
    payment_method: 'cash',
    term: 'first_term',
    receipt_number: 'REC-2026-1025',
    category: 'tuition'
  },
  {
    id: 'f-3',
    student_id: 's-104',
    amount: 150,
    payment_date: '2026-03-02',
    payment_method: 'cash',
    term: 'first_term',
    receipt_number: 'REC-2026-1026',
    category: 'tuition'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_CENTER_SCHEDULE: CenterScheduleData = {
  periods: [
    { id: 'p1', name: 'الفترة الأولى', time: '12:00', isBreak: false },
    { id: 'p2', name: 'الفترة الثانية', time: '02:00', isBreak: false },
    { id: 'p3', name: 'استراحة تبديل المجموعات', time: '04:00', isBreak: true },
    { id: 'p4', name: 'الفترة الثالثة', time: '04:30', isBreak: false },
    { id: 'p5', name: 'الفترة الرابعة', time: '06:30', isBreak: false },
    { id: 'p6', name: 'الفترة الخامسة', time: '08:30', isBreak: false },
  ],
  days: [
    { id: 'd1', name: 'الأحد' },
    { id: 'd2', name: 'الاثنين' },
    { id: 'd3', name: 'الثلاثاء' },
    { id: 'd4', name: 'الأربعاء' },
    { id: 'd5', name: 'الخميس' },
  ],
  entries: {}
};
