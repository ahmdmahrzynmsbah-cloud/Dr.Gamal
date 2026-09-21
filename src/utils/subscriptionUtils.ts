/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, FeePayment } from '../types';

export interface StudentCycle {
  cycleNumber: number; // 1, 2, 3...
  label: string; // مثلاً: "الشهر الأول"
  periodLabel: string; // مثلاً: "من 19 سبتمبر إلى 18 أكتوبر 2026"
  startDate: Date;
  endDate: Date;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string; // YYYY-MM-DD
  feeRequired: number; // قيمة الاشتراك المطلوب لهذا الشهر
  amountPaid: number; // المسدد لهذا الشهر
  remainingAmount: number; // المتبقي لهذا الشهر
  status: 'paid' | 'partial' | 'unpaid' | 'future';
  statusText: string;
  isCurrent: boolean;
  daysRemainingInPeriod: number; // الأيام المتبقية حتى نهاية هذا الشهر
  isOverdue: boolean; // هل انتهت فترة هذا الشهر دون سداد كامل؟
}

export interface StudentSubscriptionOverview {
  studentId: string;
  startDate: Date;
  startDateFormatted: string;
  daysSinceRegistration: number;
  registrationText: string; // مثلاً: "مسجل منذ يومين" أو "مسجل اليوم"
  monthlyFee: number;
  totalPaid: number;
  totalRequired: number;
  totalRemainingDebt: number; // إجمالي المبالغ المتبقية غير المسددة
  
  currentCycle: StudentCycle; // الشهر الجاري
  cycles: StudentCycle[]; // قائمة بكل شهور الطالب من تاريخ التسجيل
  
  overallStatus: 'paid' | 'partial' | 'due' | 'overdue' | 'future';
  statusLabel: string;
  statusBadgeClass: string;
  
  nextDueDate: Date;
  nextDueDateFormatted: string;
}

const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const CYCLE_ARABIC_NAMES = [
  'الشهر الأول',
  'الشهر الثاني',
  'الشهر الثالث',
  'الشهر الرابع',
  'الشهر الخامس',
  'الشهر السادس',
  'الشهر السابع',
  'الشهر الثامن',
  'الشهر التاسع',
  'الشهر العاشر',
  'الشهر الحادي عشر',
  'الشهر الثاني عشر'
];

export function getCycleArabicName(index: number): string {
  if (index >= 0 && index < CYCLE_ARABIC_NAMES.length) {
    return CYCLE_ARABIC_NAMES[index];
  }
  return `الشهر رقم ${index + 1}`;
}

export function formatShortDateArabic(d: Date): string {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const day = d.getDate();
  const monthName = ARABIC_MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${monthName} ${year}`;
}

export function toDateInputString(d: Date): string {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getStudentStartDate(student: Student): Date {
  const rawDate = student.subscription_start_date || student.created_at;
  if (!rawDate) return new Date();
  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) return new Date();
  // Normalize to beginning of day
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Calculates a date shifted by N calendar months from a start date.
 * Keeps the same day of the month when possible.
 */
export function addCalendarMonths(baseDate: Date, months: number): Date {
  const result = new Date(baseDate);
  const currentDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  
  // Handle edge cases like Jan 31 -> Feb 28
  if (result.getDate() < currentDay) {
    result.setDate(0); // last day of previous month
  }
  return result;
}

/**
 * Checks if a student was enrolled during a specific calendar month
 * E.g., student joined in September 2026 -> was NOT enrolled in July 2026.
 */
export function isStudentEnrolledInCalendarMonth(student: Student, monthString: string): boolean {
  const startDate = getStudentStartDate(student);
  
  // Parse monthString like "سبتمبر 2026"
  const parts = monthString.trim().split(' ');
  if (parts.length < 2) return true;
  
  const mName = parts[0];
  const year = parseInt(parts[1], 10);
  const mIdx = ARABIC_MONTH_NAMES.indexOf(mName);
  if (mIdx === -1 || isNaN(year)) return true;
  
  // End of that calendar month
  const endOfCalendarMonth = new Date(year, mIdx + 1, 0, 23, 59, 59);
  
  return startDate <= endOfCalendarMonth;
}

/**
 * Core function to calculate full subscription history, current cycle, and remaining debt.
 */
export function calculateStudentSubscription(
  student: Student,
  allPayments: FeePayment[],
  monthlyFee: number,
  nowDate: Date = new Date()
): StudentSubscriptionOverview {
  const startDate = getStudentStartDate(student);
  const now = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  
  // Filter student's tuition payments
  const studentPayments = allPayments.filter(
    p => p.student_id === student.id && p.category === 'tuition'
  );
  
  const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  // Days since registration
  const diffTime = now.getTime() - startDate.getTime();
  const daysSinceRegistration = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  let registrationText = '';
  if (daysSinceRegistration === 0) {
    registrationText = 'سجل اليوم';
  } else if (daysSinceRegistration === 1) {
    registrationText = 'سجل أمس';
  } else if (daysSinceRegistration === 2) {
    registrationText = 'سجل منذ يومين';
  } else if (daysSinceRegistration <= 10) {
    registrationText = `سجل منذ ${daysSinceRegistration} أيام`;
  } else {
    registrationText = `سجل منذ ${daysSinceRegistration} يوماً`;
  }

  // How many cycles have elapsed based on calendar time?
  // If registered today or 5 days ago: 1 cycle currently ongoing.
  // We generate cycles: Cycle 1, Cycle 2, up to the current active cycle + at least 1 next cycle
  let cycleCountBasedOnTime = 1;
  while (true) {
    const cycleEnd = addCalendarMonths(startDate, cycleCountBasedOnTime);
    if (now >= cycleEnd) {
      cycleCountBasedOnTime++;
    } else {
      break;
    }
  }

  // Also account for how many cycles have been paid for
  const cyclesPaidCount = Math.floor(totalPaid / (monthlyFee > 0 ? monthlyFee : 1));
  const totalCyclesToGenerate = Math.max(cycleCountBasedOnTime, cyclesPaidCount + 1, 1);
  
  let remainingPaidPool = totalPaid;
  const cycles: StudentCycle[] = [];
  let totalRequiredAcrossElapsed = 0;

  for (let i = 0; i < totalCyclesToGenerate; i++) {
    const cycleNumber = i + 1;
    const cycleStart = addCalendarMonths(startDate, i);
    const cycleEnd = addCalendarMonths(startDate, i + 1);
    
    // Subtract 1 day for inclusive end display (e.g. 19 Sep to 18 Oct)
    const displayEnd = new Date(cycleEnd);
    displayEnd.setDate(displayEnd.getDate() - 1);
    
    const label = getCycleArabicName(i);
    const periodLabel = `من ${formatShortDateArabic(cycleStart)} إلى ${formatShortDateArabic(displayEnd)}`;
    
    const feeRequired = monthlyFee;
    
    // Distribute total paid into this cycle
    let amountPaidForThisCycle = 0;
    if (remainingPaidPool >= feeRequired) {
      amountPaidForThisCycle = feeRequired;
      remainingPaidPool -= feeRequired;
    } else if (remainingPaidPool > 0) {
      amountPaidForThisCycle = remainingPaidPool;
      remainingPaidPool = 0;
    } else {
      amountPaidForThisCycle = 0;
    }
    
    const remainingAmount = Math.max(0, feeRequired - amountPaidForThisCycle);
    
    // Determine status
    let status: StudentCycle['status'] = 'unpaid';
    let statusText = 'غير مسدد';
    
    if (amountPaidForThisCycle >= feeRequired) {
      status = 'paid';
      statusText = 'مسدد بالكامل ✓';
    } else if (amountPaidForThisCycle > 0) {
      status = 'partial';
      statusText = `سداد جزئي (متبقي ${remainingAmount} ج.م)`;
    } else {
      if (cycleStart > now) {
        status = 'future';
        statusText = 'شهر قادم';
      } else {
        status = 'unpaid';
        statusText = `غير مسدد (مطلوب ${feeRequired} ج.م)`;
      }
    }

    const isCurrent = (now >= cycleStart && now < cycleEnd) || (i === 0 && now < cycleStart);
    const msUntilEnd = cycleEnd.getTime() - now.getTime();
    const daysRemainingInPeriod = Math.ceil(msUntilEnd / (1000 * 60 * 60 * 24));
    const isOverdue = (now >= cycleEnd) && (remainingAmount > 0);

    if (now >= cycleStart) {
      totalRequiredAcrossElapsed += feeRequired;
    }

    cycles.push({
      cycleNumber,
      label,
      periodLabel,
      startDate: cycleStart,
      endDate: cycleEnd,
      startDateStr: toDateInputString(cycleStart),
      endDateStr: toDateInputString(cycleEnd),
      feeRequired,
      amountPaid: amountPaidForThisCycle,
      remainingAmount,
      status,
      statusText,
      isCurrent,
      daysRemainingInPeriod,
      isOverdue
    });
  }

  // Find the current active cycle
  let currentCycle = cycles.find(c => c.isCurrent);
  if (!currentCycle) {
    // If none marked isCurrent, use the latest one or first unpaid
    currentCycle = cycles.find(c => c.status !== 'paid') || cycles[cycles.length - 1];
  }

  // Total remaining debt is the sum of remaining amounts of all elapsed / current cycles
  const totalRemainingDebt = cycles
    .filter(c => c.startDate <= now || c.isCurrent)
    .reduce((sum, c) => sum + c.remainingAmount, 0);

  // Overall status
  let overallStatus: StudentSubscriptionOverview['overallStatus'] = 'due';
  let statusLabel = '';
  let statusBadgeClass = '';

  if (totalRemainingDebt === 0 && totalPaid > 0) {
    overallStatus = 'paid';
    statusLabel = 'مسدد بالكامل ✓';
    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
  } else if (currentCycle.status === 'partial' || (totalPaid > 0 && totalRemainingDebt > 0)) {
    overallStatus = 'partial';
    statusLabel = `سداد جزئي (متبقي ${totalRemainingDebt} ج.م)`;
    statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
  } else if (cycles.some(c => c.isOverdue)) {
    overallStatus = 'overdue';
    statusLabel = `متأخر (مطلوب ${totalRemainingDebt} ج.م)`;
    statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
  } else {
    // In first cycle, not paid yet, but not overdue
    if (daysSinceRegistration <= 7) {
      overallStatus = 'due';
      statusLabel = `طالب مسجل حديثاً (مطلوب ${monthlyFee} ج.م)`;
      statusBadgeClass = 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
    } else {
      overallStatus = 'due';
      statusLabel = `مستحق السداد (${monthlyFee} ج.م)`;
      statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
    }
  }

  // Next due date: when the last fully paid cycle ends
  let nextDueDate: Date;
  if (cyclesPaidCount > 0) {
    nextDueDate = addCalendarMonths(startDate, cyclesPaidCount);
  } else {
    nextDueDate = currentCycle.endDate;
  }
  const nextDueDateFormatted = formatShortDateArabic(nextDueDate);

  return {
    studentId: student.id,
    startDate,
    startDateFormatted: formatShortDateArabic(startDate),
    daysSinceRegistration,
    registrationText,
    monthlyFee,
    totalPaid,
    totalRequired: totalRequiredAcrossElapsed,
    totalRemainingDebt,
    currentCycle,
    cycles,
    overallStatus,
    statusLabel,
    statusBadgeClass,
    nextDueDate,
    nextDueDateFormatted
  };
}
