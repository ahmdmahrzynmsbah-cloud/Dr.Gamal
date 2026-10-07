/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, FeePayment, SystemNotification } from '../types';
import { samsDb, addAuditLog } from './db';
import { calculateStudentSubscription, getStudentMonthlyFee } from './subscriptionUtils';

// List of months for academic year tracking (Starting from August - Month 8)
export const MONTHS_LIST = [
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
  'يونيو 2027',
  'يوليو 2027'
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
  gradeLevel: string,
  options?: {
    remainingAmount?: number;
    amountPaid?: number;
    periodLabel?: string;
    nextDueDate?: string;
  }
): string {
  const isAlsafa = typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa';
  const customCenterTitle = isAlsafa ? 'سيستم الصفا للمواد الشرعية' : (localStorage.getItem('sams_custom_app_name_v2') || 'الدكتور في اللغة العربية');
  const signature = isAlsafa ? '#سيستم الصفا للمواد الشرعية' : '#سيستم الدكتور في اللغة العربية';
  
  let financialDetails = '';
  if (options?.remainingAmount && options.remainingAmount > 0 && options.amountPaid && options.amountPaid > 0) {
    financialDetails = `نود إحاطة سيادتكم علماً بالموقف المالي لاشتراك الطالب/ة عن فترة (*${options.periodLabel || monthName}*):
• إجمالي قيمة الاشتراك المقررة: *${amount} ج.م*
• المبلغ المسدد سابقاً: *${options.amountPaid} ج.م*
• المبلغ المتبقي المستحق سداده: *${options.remainingAmount} undefined`;
  } else {
    financialDetails = `نود تذكير سيادتكم بموعد استحقاق قسط الاشتراك الدراسي عن فترة (*${options?.periodLabel || monthName}*) الخاص بـ (*${gradeLevel}*) وقيمته: *${amount} ج.م*.`;
  }

  const nextDueText = options?.nextDueDate ? `\n• موعد التجديد القادم: *${options.nextDueDate}*` : '';

  return `السلام عليكم ورحمة الله وبركاته
السيد ولي أمر الطالب/ة: *${studentName}* (${parentName || 'المحترم'})

تحية طيبة وبعد من إدارة *${customCenterTitle}*

${financialDetails}${nextDueText}

يرجى التكرم بالمبادرة بالسداد عبر مقر السنتر أو وسائل الدفع المعتمدة لضمان استمرار انتظام الطالب في المجموعات وتلقي الكتب والمذكرات الدراسية.

شاكرين لكم حسن تعاونكم ودعمكم الدائم!

${signature}`;
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
 * Optimized with daily throttling, persistent deduplication, and consolidated alerts to prevent UI lag.
 */
export function checkFeeDueDatesBackgroundService(
  targetMonth?: string,
  options?: { force?: boolean; isStartup?: boolean }
): {
  checkedCount: number;
  unpaidCount: number;
  newNotisCount: number;
  unpaidStudents: Student[];
} {
  try {
    // 1. Startup Guard: If running on app startup, check user preference
    if (options?.isStartup) {
      const startupEnabled = localStorage.getItem('sams_startup_auto_notis_enabled');
      // If user disabled startup automated checks, return immediately
      if (startupEnabled === 'false') {
        return { checkedCount: 0, unpaidCount: 0, newNotisCount: 0, unpaidStudents: [] };
      }
    }

    // 2. Throttle: If not forced, only run at most ONCE per calendar day
    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheckDate = localStorage.getItem('sams_last_fee_check_date');
    if (!options?.force && lastCheckDate === todayStr) {
      return { checkedCount: 0, unpaidCount: 0, newNotisCount: 0, unpaidStudents: [] };
    }

    const students = samsDb.getStudents().filter(s => s.status === 'active' && !s.deleted_at);
    const payments = samsDb.getFees();
    const existingNotifications = samsDb.getNotifications();
    const existingAdminNotis = samsDb.getAdminNotifications();

    // Determine target month (default to current active month e.g., 'أغسطس 2026' or saved active month)
    const activeMonth = targetMonth || localStorage.getItem('sams_active_fee_month') || 'أغسطس 2026';

    // Get grade monthly fee map
    const gradeFeesMap = samsDb.getGradeMonthlyFees();

    // Load persistent sent-reminders map to avoid repetitive cycles even if notifications array is trimmed
    let sentRemindersMap: Record<string, string> = {};
    try {
      const raw = localStorage.getItem('sams_sent_reminders_map');
      if (raw) sentRemindersMap = JSON.parse(raw);
    } catch (e) {
      sentRemindersMap = {};
    }

    const unpaidStudents: Student[] = [];
    let newNotisCount = 0;
    let remindersUpdated = false;

    for (const student of students) {
      const feeAmount = getStudentMonthlyFee(student, null, gradeFeesMap);
      const sub = calculateStudentSubscription(student, payments, feeAmount);

      // Student is due if and only if:
      // 1. The month has ENDED and payment was not completed (isOverdue)
      // 2. Or totalRemainingDebt > 0 from ended months
      const isDue = (sub.totalRemainingDebt > 0) || sub.currentCycle.isOverdue || sub.overallStatus === 'overdue';

      if (isDue) {
        unpaidStudents.push(student);

        const cycleIdentifier = sub.currentCycle.periodLabel || sub.currentCycle.label;
        const reminderKey = `fee-remind-${student.id}-${cycleIdentifier}`;

        // Check both persistent log and in-memory notifications
        const alreadyInPersistentLog = Boolean(sentRemindersMap[reminderKey]);
        const alreadyNotified = alreadyInPersistentLog || existingNotifications.some(
          n => n.recipient_id === student.id &&
               n.title.includes('استحقاق قسط') &&
               (n.message.includes(cycleIdentifier) || n.message.includes(activeMonth))
        );

        // If running as automated startup check, do NOT spam 50 individual notifications!
        // We will create 1 consolidated admin alert below.
        // Only if force (explicit button click) and not already notified, record individual student notice silently:
        if (options?.force && !alreadyNotified) {
          const remainingMsg = sub.currentCycle.remainingAmount < feeAmount && sub.currentCycle.amountPaid > 0
            ? `(متبقي بعد سداد جزئي: ${sub.currentCycle.remainingAmount} ج.م من أصل ${feeAmount} ج.م)`
            : `(المبلغ المطلوب: ${sub.currentCycle.remainingAmount} ج.م)`;

          samsDb.addNotification({
            title: `تنبيه استحقاق اشتراك: ${student.name}`,
            message: `تنبيه آلي من النظام: استحقاق اشتراك ${sub.currentCycle.label} ${remainingMsg} عن الفترة (${sub.currentCycle.periodLabel}) للطالب (${student.name}). تاريخ الاستحقاق: ${sub.nextDueDateFormatted}. يرجى التكرم بالسداد لإدارة السنتر.`,
            category: 'alert',
            recipient_type: 'specific',
            recipient_id: student.id
          }, { silent: true });

          sentRemindersMap[reminderKey] = todayStr;
          remindersUpdated = true;
          newNotisCount++;
        }
      }
    }

    // Consolidated Admin Alert:
    // If there are unpaid students, create AT MOST 1 aggregated admin notification per day/month
    if (unpaidStudents.length > 0) {
      const summaryReminderKey = `summary-due-${activeMonth}-${todayStr}`;
      const summaryAlreadyExists = existingAdminNotis.some(
        n => n.metadata?.summaryKey === summaryReminderKey ||
             (n.type === 'payment_reminder' && n.message.includes(summaryReminderKey))
      );

      if (!summaryAlreadyExists) {
        samsDb.addAdminNotification({
          type: 'payment_reminder',
          message: `ملخص اشتراكات شهر (${activeMonth}): تم رصد ${unpaidStudents.length} طالب/ة مستحق عليهم سداد أو استكمال الاشتراك. يمكن مراجعتهم من قسم الرسوم.`,
          metadata: { summaryKey: summaryReminderKey, count: unpaidStudents.length, month: activeMonth }
        }, { silent: true });
        newNotisCount++;
      }
    }

    // Record check timestamp & date
    localStorage.setItem('sams_last_fee_check_date', todayStr);
    localStorage.setItem('sams_last_fee_check_timestamp', new Date().toISOString());

    if (remindersUpdated) {
      try {
        localStorage.setItem('sams_sent_reminders_map', JSON.stringify(sentRemindersMap));
      } catch (e) {}
    }

    if (newNotisCount > 0) {
      addAuditLog(
        'INSERT',
        'notifications',
        'bg-service',
        `فحص آلي لأقساط الطلاب لشهر (${activeMonth}): تم رصد ${unpaidStudents.length} طالب غير مسدد، وتوليد إشعار إداري ملخص بنجاح.`
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
