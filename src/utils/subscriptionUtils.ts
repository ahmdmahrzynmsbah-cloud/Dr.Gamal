/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, FeePayment, ClassRoom } from '../types';
import { samsDb } from './db';

export interface StudentCycle {
  cycleNumber: number; // 1, 2, 3...
  label: string; // مثلاً: "الشهر الأول (سبتمبر 2026)"
  monthName: string; // مثلاً: "سبتمبر 2026"
  periodLabel: string; // مثلاً: "من 15 سبتمبر إلى 30 سبتمبر 2026"
  startDate: Date;
  endDate: Date;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string; // YYYY-MM-DD
  feeRequired: number; // قيمة الاشتراك المطلوب لهذا الشهر (شهر كامل أو نصف شهر)
  amountPaid: number; // المسدد لهذا الشهر
  remainingAmount: number; // المتبقي لهذا الشهر
  status: 'paid' | 'partial' | 'ongoing' | 'unpaid' | 'future';
  statusText: string;
  isCurrent: boolean;
  isHalfMonth?: boolean; // هل تم احتساب نصف شهر للتسجيل بعد يوم 7؟
  daysRemainingInPeriod: number; // الأيام المتبقية حتى نهاية هذا الشهر
  isOverdue: boolean; // هل انتهت فترة هذا الشهر دون سداد كامل؟
  hasEnded: boolean; // هل انتهى الشهر؟
}

export interface StudentSubscriptionOverview {
  studentId: string;
  startDate: Date;
  startDateFormatted: string;
  daysSinceRegistration: number;
  registrationText: string; // مثلاً: "مسجل منذ يومين" أو "مسجل اليوم"
  registrationDay: number; // يوم التسجيل في الشهر (1 - 31)
  isRegisteredAfterDay7: boolean; // هل تم تسجيل الطالب بعد يوم 7 في الشهر؟
  firstMonthFee: number; // قيمة اشتراك الشهر الأول (نصف شهر أو شهر كامل)
  monthlyFee: number; // قيمة الاشتراك الكامل للشهر
  totalPaid: number;
  totalRequired: number;
  totalRemainingDebt: number; // إجمالي المبالغ المتأخرة المستحقة بعد انتهاء فترات الشهور
  currentCycleRemaining: number; // المتبقي من اشتراك الشهر الجاري
  totalBalance: number; // إجمالي المطلوب سداده (المتأخر + الجاري)
  
  currentCycle: StudentCycle; // الشهر الجاري
  cycles: StudentCycle[]; // قائمة بكل شهور الطالب من تاريخ التسجيل
  
  overallStatus: 'paid' | 'partial' | 'ongoing' | 'due' | 'overdue' | 'future';
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
 * Rules:
 * 1. If enrolled on or before day 7 of the month: First month is FULL MONTH (monthlyFee).
 * 2. If enrolled after day 7 of the month: First month is HALF MONTH (monthlyFee / 2).
 * 3. Fees are due AFTER the end of the month, NOT upon registration.
 * 4. Subsequent months are regular full months (monthlyFee).
 */
export function calculateStudentSubscription(
  student: Student,
  allPayments: FeePayment[],
  monthlyFee: number,
  nowDate: Date = new Date()
): StudentSubscriptionOverview {
  const startDate = getStudentStartDate(student);
  const now = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 12, 0, 0);
  
  // Registration day rule
  const registrationDay = startDate.getDate();
  const isRegisteredAfterDay7 = registrationDay > 7;
  const firstMonthFee = isRegisteredAfterDay7 ? Math.round(monthlyFee / 2) : monthlyFee;
  
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

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();

  // Elapsed calendar months from registration month to current month
  const elapsedCalendarMonths = (nowYear - startYear) * 12 + (nowMonth - startMonth);
  const totalCyclesToGenerate = Math.max(elapsedCalendarMonths + 2, 2);

  // Smart payment matching: pool total paid into sequential cycles
  let remainingPaidPool = totalPaid;
  const cycles: StudentCycle[] = [];
  let totalRequiredAcrossElapsed = 0;

  for (let i = 0; i < totalCyclesToGenerate; i++) {
    const cycleNumber = i + 1;
    const isFirstMonth = i === 0;
    const isHalfMonth = isFirstMonth && isRegisteredAfterDay7;
    const feeRequired = isHalfMonth ? firstMonthFee : monthlyFee;

    // Calendar month bounds
    let cycleStart: Date;
    let cycleEnd: Date;

    if (isFirstMonth) {
      cycleStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
      // End of that calendar month (e.g. 30 September 23:59:59)
      cycleEnd = new Date(startYear, startMonth + 1, 0, 23, 59, 59, 999);
    } else {
      cycleStart = new Date(startYear, startMonth + i, 1, 0, 0, 0);
      cycleEnd = new Date(startYear, startMonth + i + 1, 0, 23, 59, 59, 999);
    }

    const cycleMonthDate = new Date(startYear, startMonth + i, 1);
    const monthName = `${ARABIC_MONTH_NAMES[cycleMonthDate.getMonth()]} ${cycleMonthDate.getFullYear()}`;
    
    // Inclusive display end date
    const displayEnd = new Date(cycleEnd.getFullYear(), cycleEnd.getMonth(), cycleEnd.getDate());
    const periodLabel = `من ${formatShortDateArabic(cycleStart)} إلى ${formatShortDateArabic(displayEnd)}`;
    
    let label = `${getCycleArabicName(i)} (${monthName})`;
    if (isHalfMonth) {
      label += ' [نصف شهر]';
    }

    // Allocate payment
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

    // Has the month ended? (due after end of month)
    const hasEnded = now.getTime() > cycleEnd.getTime();
    const isCurrent = (now.getTime() >= cycleStart.getTime() && now.getTime() <= cycleEnd.getTime()) || (isFirstMonth && now.getTime() < cycleStart.getTime());
    const msUntilEnd = cycleEnd.getTime() - now.getTime();
    const daysRemainingInPeriod = Math.max(0, Math.ceil(msUntilEnd / (1000 * 60 * 60 * 24)));

    // Status determination
    let status: StudentCycle['status'] = 'ongoing';
    let statusText = '';
    let isOverdue = false;

    if (amountPaidForThisCycle >= feeRequired) {
      status = 'paid';
      statusText = 'مسدد بالكامل';
      isOverdue = false;
    } else if (amountPaidForThisCycle > 0) {
      status = 'partial';
      isOverdue = hasEnded;
      statusText = hasEnded
        ? `سداد جزئي متأخر (متبقي ${remainingAmount} ج.م)`
        : `سداد جزئي جاري (متبقي ${remainingAmount} ج.م)`;
    } else {
      // 0 paid
      if (cycleStart.getTime() > now.getTime()) {
        status = 'future';
        statusText = 'شهر قادم';
        isOverdue = false;
      } else if (hasEnded) {
        // Month has finished and not paid -> becomes DUE / OVERDUE!
        status = 'unpaid';
        statusText = `مستحق السداد (انتهى الشهر - مطلوب ${feeRequired} ج.م)`;
        isOverdue = true;
      } else {
        // Month is ongoing -> NOT due yet, active period!
        status = 'ongoing';
        statusText = isHalfMonth
          ? `نصف شهر جاري (يستحق بنهاية الشهر - ${feeRequired} ج.م)`
          : `شهر كامل جاري (يستحق بنهاية الشهر - ${feeRequired} ج.م)`;
        isOverdue = false;
      }
    }

    if (hasEnded || isCurrent) {
      totalRequiredAcrossElapsed += feeRequired;
    }

    cycles.push({
      cycleNumber,
      label,
      monthName,
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
      isHalfMonth,
      daysRemainingInPeriod,
      isOverdue,
      hasEnded
    });
  }

  // Find the current active cycle
  let currentCycle = cycles.find(c => c.isCurrent);
  if (!currentCycle) {
    currentCycle = cycles.find(c => !c.hasEnded) || cycles[0];
  }

  // Overdue debt: ONLY months that have ENDED and remain unpaid!
  const totalRemainingDebt = cycles
    .filter(c => c.hasEnded)
    .reduce((sum, c) => sum + c.remainingAmount, 0);

  const currentCycleRemaining = currentCycle.hasEnded ? 0 : currentCycle.remainingAmount;
  const totalBalance = totalRemainingDebt + currentCycleRemaining;

  // Overall status
  let overallStatus: StudentSubscriptionOverview['overallStatus'] = 'ongoing';
  let statusLabel = '';
  let statusBadgeClass = '';

  if (totalRemainingDebt > 0) {
    overallStatus = 'overdue';
    statusLabel = `متأخر ومستحق (مطلوب ${totalRemainingDebt} ج.م)`;
    statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
  } else if (currentCycle.status === 'paid' && totalPaid > 0) {
    overallStatus = 'paid';
    statusLabel = 'مسدد بالكامل';
    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
  } else if (currentCycle.status === 'partial') {
    overallStatus = 'partial';
    statusLabel = `سداد جزئي (متبقي ${currentCycleRemaining} ج.م)`;
    statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
  } else {
    // In ongoing active month without overdue debt
    overallStatus = 'ongoing';
    if (currentCycle.isHalfMonth) {
      statusLabel = `طالب جديد (نصف شهر: ${currentCycle.feeRequired} ج.م) • يستحق بعد انتهاء الشهر`;
    } else {
      statusLabel = `طالب جديد (شهر كامل: ${currentCycle.feeRequired} ج.م) • يستحق بعد انتهاء الشهر`;
    }
    statusBadgeClass = 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
  }

  // Next due date: end of current cycle or first unpaid cycle
  const nextDueDate = currentCycle.endDate;
  const nextDueDateFormatted = formatShortDateArabic(nextDueDate);

  return {
    studentId: student.id,
    startDate,
    startDateFormatted: formatShortDateArabic(startDate),
    daysSinceRegistration,
    registrationText,
    registrationDay,
    isRegisteredAfterDay7,
    firstMonthFee,
    monthlyFee,
    totalPaid,
    totalRequired: totalRequiredAcrossElapsed,
    totalRemainingDebt,
    currentCycleRemaining,
    totalBalance,
    currentCycle,
    cycles,
    overallStatus,
    statusLabel,
    statusBadgeClass,
    nextDueDate,
    nextDueDateFormatted
  };
}

/**
 * Resolves the configured monthly fee for a student based on their grade and class.
 * Checks class custom fee, grade fees map from db/localStorage, with intelligent Arabic grade aliases.
 */
export function getStudentMonthlyFee(
  student: Student,
  classInfo?: ClassRoom | null,
  customGradeFees?: Record<string, number>
): number {
  // 1. Direct class-specific fee if configured
  if (classInfo && typeof (classInfo as any).monthly_fee === 'number' && (classInfo as any).monthly_fee > 0) {
    return (classInfo as any).monthly_fee;
  }

  // 2. Load grade fees map
  let gradeFees = customGradeFees || samsDb.getGradeMonthlyFees();
  if (!gradeFees || Object.keys(gradeFees).length === 0) {
    gradeFees = {
      'الأول الإبتدائي': 80,
      'الثاني الإبتدائي': 80,
      'الثالث الإبتدائي': 90,
      'الرابع الإبتدائي': 100,
      'الخامس الإبتدائي': 100,
      'السادس الإبتدائي': 110,
      'الأول الإعدادي': 120,
      'الثاني الإعدادي': 130,
      'الثالث الإعدادي': 150,
      'الأول الثانوي': 200,
      'الثاني الثانوي': 250,
      'الثالث الثانوي': 300,
    };
  }

  const rawGrade = (student.grade_level || classInfo?.grade_level || '').trim();
  
  // Direct key match
  if (rawGrade && typeof gradeFees[rawGrade] === 'number' && gradeFees[rawGrade] > 0) {
    return gradeFees[rawGrade];
  }

  // Normalized matching with common Arabic educational aliases
  const cleanGrade = rawGrade.replace(/الصف|مجموعة|المرحلة|التعليم|عام|أزهر|[()]/g, '').trim();
  
  // 1st Prep (أولى إعدادي / الأول الإعدادي) - Configured to 120 EGP as requested
  if ((cleanGrade.includes('أول') || cleanGrade.includes('اول') || cleanGrade.includes('1')) && (cleanGrade.includes('إعداد') || cleanGrade.includes('اعداد') || cleanGrade.includes('ع'))) {
    return gradeFees['الأول الإعدادي'] || 120;
  }
  // 2nd Prep (ثانية إعدادي / الثاني الإعدادي)
  if ((cleanGrade.includes('ثان') || cleanGrade.includes('2')) && (cleanGrade.includes('إعداد') || cleanGrade.includes('اعداد') || cleanGrade.includes('ع'))) {
    return gradeFees['الثاني الإعدادي'] || 130;
  }
  // 3rd Prep (ثالثة إعدادي / الثالث الإعدادي)
  if ((cleanGrade.includes('ثالث') || cleanGrade.includes('3')) && (cleanGrade.includes('إعداد') || cleanGrade.includes('اعداد') || cleanGrade.includes('ع'))) {
    return gradeFees['الثالث الإعدادي'] || 150;
  }
  // 1st Secondary (أولى ثانوي / الأول الثانوي)
  if ((cleanGrade.includes('أول') || cleanGrade.includes('اول') || cleanGrade.includes('1')) && (cleanGrade.includes('ثانو') || cleanGrade.includes('ث'))) {
    return gradeFees['الأول الثانوي'] || 200;
  }
  // 2nd Secondary (ثانية ثانوي / الثاني الثانوي)
  if ((cleanGrade.includes('ثان') || cleanGrade.includes('2')) && (cleanGrade.includes('ثانو') || cleanGrade.includes('ث'))) {
    return gradeFees['الثاني الثانوي'] || 250;
  }
  // 3rd Secondary (ثالثة ثانوي / الثالث الثانوي)
  if ((cleanGrade.includes('ثالث') || cleanGrade.includes('3')) && (cleanGrade.includes('ثانو') || cleanGrade.includes('ث'))) {
    return gradeFees['الثالث الثانوي'] || 300;
  }

  // Primary stages
  if (cleanGrade.includes('إبتد') || cleanGrade.includes('ابتد') || cleanGrade.includes('ب')) {
    if (cleanGrade.includes('أول') || cleanGrade.includes('اول') || cleanGrade.includes('1')) return gradeFees['الأول الإبتدائي'] || 80;
    if (cleanGrade.includes('ثان') || cleanGrade.includes('2')) return gradeFees['الثاني الإبتدائي'] || 80;
    if (cleanGrade.includes('ثالث') || cleanGrade.includes('3')) return gradeFees['الثالث الإبتدائي'] || 90;
    if (cleanGrade.includes('رابع') || cleanGrade.includes('4')) return gradeFees['الرابع الإبتدائي'] || 100;
    if (cleanGrade.includes('خامس') || cleanGrade.includes('5')) return gradeFees['الخامس الإبتدائي'] || 100;
    if (cleanGrade.includes('سادس') || cleanGrade.includes('6')) return gradeFees['السادس الإبتدائي'] || 110;
  }

  // Check class name if grade level was ambiguous
  if (classInfo?.name) {
    const className = classInfo.name;
    if (className.includes('أولى إعدادي') || className.includes('اولي اعدادي') || className.includes('1/ع') || className.includes('1ع') || className.includes('أول إعدادي')) {
      return gradeFees['الأول الإعدادي'] || 120;
    }
    if (className.includes('ثانية إعدادي') || className.includes('تانية اعدادي') || className.includes('2/ع') || className.includes('2ع') || className.includes('ثاني إعدادي')) {
      return gradeFees['الثاني الإعدادي'] || 130;
    }
    if (className.includes('ثالثة إعدادي') || className.includes('تالتة اعدادي') || className.includes('3/ع') || className.includes('3ع') || className.includes('ثالث إعدادي')) {
      return gradeFees['الثالث الإعدادي'] || 150;
    }
    if (className.includes('أولى ثانوي') || className.includes('اولي ثانوي') || className.includes('1/ث') || className.includes('1ث')) {
      return gradeFees['الأول الثانوي'] || 200;
    }
    if (className.includes('ثانية ثانوي') || className.includes('تانية ثانوي') || className.includes('2/ث') || className.includes('2ث')) {
      return gradeFees['الثاني الثانوي'] || 250;
    }
    if (className.includes('ثالثة ثانوي') || className.includes('تالتة ثانوي') || className.includes('3/ث') || className.includes('3ث')) {
      return gradeFees['الثالث الثانوي'] || 300;
    }
  }

  // Default fallback (1st prep fee = 120)
  return gradeFees['الأول الإعدادي'] || 120;
}
