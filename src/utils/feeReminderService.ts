/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, FeePayment, SystemNotification } from '../types';
import { samsDb, addAuditLog } from './db';

// List of months for academic year tracking
export const MONTHS_LIST = [
  'يوليو 2026',
  'أغسطس 2026',
  'سبتمبر 2026',
  'أكتوبر 2026',
  'نوفمبر 2026',
  'ديسمبر 2026',
  'يناير 2027',
  'فبراير 2027',
  'مارس 2027',
  'أبريل 2027',
  'مايو 2027',
  'يونيو 2027'
];

/**
 * Format Egyptian parent phone number to standard international WhatsApp format (e.g. 201034859313)
 */
export function formatEgyptianPhoneForWhatsApp(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '2' + cleaned;
  } else if (!cleaned.startsWith('20') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }
  return cleaned;
}

/**
 * Generate a professional Arabic WhatsApp reminder text for student tuition
 */
export function generateWhatsAppReminderText(
  studentName: string,
  parentName: string,
  monthName: string,
  amount: number,
  gradeLevel: string
): string {
  const customCenterTitle = localStorage.getItem('sams_custom_app_name_v2') || 'منصة الإدارة والسنتر التعليمي';
  
  return `السلام عليكم ورحمة الله وبركاته 🌸
السيد ولي أمر الطالب/ة: *${studentName}* (${parentName || 'المحترم'})

تحية طيبة وبعد من إدارة *${customCenterTitle}* 🏛️

نود تذكير سيادتكم باقتراب موعد استحقاق قسط الاشتراك الدراسي لشهر (*${monthName}*) الخاص بـ (*${gradeLevel}*) والمقدر بـ *${amount} ج.م*.

يرجى التكرم بالمبادرة بالسداد عبر مقر السنتر أو وسائل الدفع المتاحة لضمان استمرار انتظام الطالب في المجموعات وتلقي الكتب والمذكرات.

شاكرين لكم حسن تعاونكم ودعمكم الدائم! 🌺`;
}

/**
 * Get direct WhatsApp link for parent
 */
export function getWhatsAppReminderUrl(
  parentPhone: string,
  studentName: string,
  parentName: string,
  monthName: string,
  amount: number,
  gradeLevel: string
): { cleanPhone: string; messageText: string; url: string } {
  const cleanPhone = formatEgyptianPhoneForWhatsApp(parentPhone);
  const messageText = generateWhatsAppReminderText(studentName, parentName, monthName, amount, gradeLevel);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  return { cleanPhone, messageText, url };
}

/**
 * BACKGROUND SERVICE:
 * Automatically checks all active students against due tuition payments.
 * Generates system notifications and admin alerts for upcoming/unpaid installments.
 */
export function checkFeeDueDatesBackgroundService(targetMonth?: string): {
  checkedCount: number;
  unpaidCount: number;
  newNotisCount: number;
  unpaidStudents: Student[];
} {
  try {
    const students = samsDb.getStudents().filter(s => s.status === 'active' && !s.deleted_at);
    const payments = samsDb.getFees();
    const existingNotifications = samsDb.getNotifications();

    // Determine target month (default to current active month e.g., 'يوليو 2026' or saved active month)
    const activeMonth = targetMonth || localStorage.getItem('sams_active_fee_month') || 'يوليو 2026';

    // Get grade monthly fee map
    let gradeFeesMap: Record<string, number> = {
      'الصف الأول الإعدادي': 150,
      'الصف الثاني الإعدادي': 150,
      'الصف الثالث الإعدادي': 150,
      'الصف الأول الثانوي': 200,
      'الصف الثاني الثانوي': 250,
      'الصف الثالث الثانوي': 300
    };
    const savedFees = localStorage.getItem('sams_grade_monthly_fees');
    if (savedFees) {
      try {
        gradeFeesMap = { ...gradeFeesMap, ...JSON.parse(savedFees) };
      } catch (e) {
        // use fallback
      }
    }

    const unpaidStudents: Student[] = [];
    let newNotisCount = 0;

    for (const student of students) {
      // Check if student has paid tuition for the target month
      const isPaid = payments.some(
        p => p.student_id === student.id && p.category === 'tuition' && p.month === activeMonth
      );

      if (!isPaid) {
        unpaidStudents.push(student);

        // Check if an automated reminder notification already exists for this student & month
        const alreadyNotified = existingNotifications.some(
          n => n.recipient_id === student.id &&
               n.title.includes('استحقاق قسط') &&
               n.message.includes(activeMonth)
        );

        if (!alreadyNotified) {
          const feeAmount = gradeFeesMap[student.grade_level] || 250;
          
          // 1. Create System Notification for parent/student
          samsDb.addNotification({
            title: `⚠️ تنبيه استحقاق قسط دراسي: ${student.name}`,
            message: `تنبيه آلي من النظام: اقترب موعد استحقاق الاشتراك الشهري لشهر (${activeMonth}) للأنشطة والدروس المقدر بـ ${feeAmount} ج.م للطالب (${student.name}). يرجى التواصل مع ولي الأمر (${student.parent_name || 'ولي الأمر'}) على الهاتف (${student.parent_phone || student.phone}) للمتابعة والسداد.`,
            category: 'alert',
            recipient_type: 'specific',
            recipient_id: student.id
          });

          // 2. Create Admin Notification for dashboard bell
          samsDb.addAdminNotification({
            type: 'payment_reminder',
            message: `تنبيه أقساط: قسط شهر (${activeMonth}) للطالب (${student.name}) لم يتم سداده بعد.`,
            metadata: { student_id: student.id, month: activeMonth, parent_phone: student.parent_phone }
          });

          newNotisCount++;
        }
      }
    }

    // Save last check timestamp
    localStorage.setItem('sams_last_fee_check_timestamp', new Date().toISOString());

    if (newNotisCount > 0) {
      addAuditLog(
        'INSERT',
        'notifications',
        'bg-service',
        `خدمة الخلفية: تم فحص أقساط الطلاب لشهر (${activeMonth}). تم رصد ${unpaidStudents.length} طالب غير مسدد، وإنشاء ${newNotisCount} إشعار استحقاق جديد تلقائياً.`
      );
    }

    return {
      checkedCount: students.length,
      unpaidCount: unpaidStudents.length,
      newNotisCount,
      unpaidStudents
    };
  } catch (err) {
    console.error('Error running fee due dates background service:', err);
    return { checkedCount: 0, unpaidCount: 0, newNotisCount: 0, unpaidStudents: [] };
  }
}
