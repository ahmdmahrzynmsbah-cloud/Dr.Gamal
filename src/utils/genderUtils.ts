/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from '../types';

// List of known Arabic female first names (normalized for search)
const FEMALE_NAMES_SET = new Set([
  'اسراء', 'إسراء', 'أسراء', 'بسملة', 'سلمى', 'سلمي', 'فاطمة', 'فاطمه', 'مريم', 'اية', 'آية', 'ايه', 'آيه',
  'هاجر', 'يارا', 'حبيبة', 'حبيبه', 'ندى', 'ندي', 'منه', 'منة', 'هدير', 'شهد', 'رنا', 'ملك', 'جنى', 'جني',
  'روان', 'ياسمين', 'زينب', 'خديجة', 'خديجه', 'عائشة', 'عايشه', 'عايشة', 'عائشه', 'اميرة', 'أميرة', 'اميره', 'أميره',
  'دنيا', 'ايمان', 'إيمان', 'مي', 'نوران', 'ضحى', 'ضحي', 'الهام', 'إلهام', 'ريتاج', 'بسنت', 'اروى', 'أروى',
  'رحمة', 'رحمه', 'سارة', 'ساره', 'نورهان', 'شيماء', 'نجلاء', 'ريم', 'ميرنا', 'مروة', 'مروه', 'دعاء', 'ولاء',
  'وفاء', 'هنا', 'هناء', 'هالة', 'هاله', 'هبة', 'هبه', 'بسمة', 'بسمه', 'نهى', 'نهي', 'علا', 'رضوى', 'رضوي',
  'صابرين', 'صفا', 'صفاء', 'سهيلة', 'سهيله', 'تقى', 'تقي', 'تسنيم', 'جودي', 'حنين', 'روفيدا', 'رفيدة', 'ريناد',
  'ريماس', 'زينة', 'زينه', 'سحر', 'سمية', 'سميه', 'سندس', 'شروق', 'صباح', 'عبير', 'عفاف', 'فاتن', 'فريال',
  'فرح', 'فيروز', 'لمياء', 'لينا', 'ليلى', 'ليلي', 'محاسن', 'مديحة', 'مديحه', 'منار', 'منى', 'مني', 'ميار',
  'نبيلة', 'نبيله', 'نادية', 'ناديه', 'نسرين', 'نورا', 'نور', 'نيفين', 'هدى', 'هدي', 'هانيا', 'وجنات', 'وسام',
  'يمنى', 'يمني', 'جهاد', 'رقية', 'رقيه', 'جومانا', 'جمانة', 'جمانه', 'لارا', 'تاليا', 'كارما', 'كنز', 'كنزى',
  'كنزي', 'ساندي', 'تيا', 'تالين', 'كارمن', 'ريتال', 'بيري', 'بيرينا', 'رزان', 'تالا', 'كندا', 'لارين', 'رودينا',
  'سيلين', 'ماسة', 'ماسه', 'جاسمين', 'بتول', 'تبارك', 'براءة', 'ثريا', 'جنات', 'جليلة', 'جميلة', 'جهينة', 'جيهان',
  'حسناء', 'حليمة', 'حميدة', 'حواء', 'خلود', 'دانية', 'دانة', 'داليا', 'درة', 'دينا', 'رانيا', 'ربيحة', 'رجاء',
  'رحاب', 'رشا', 'رغد', 'ريهام', 'زبيدة', 'زهرة', 'زهور', 'ساجدة', 'سالي', 'سامية', 'سناء', 'سوسن', 'سوزان',
  'شادية', 'شاهيناز', 'شيرين', 'صالحة', 'صفية', 'عزة', 'عزيزة', 'عطيات', 'علياء', 'عنان', 'غادة', 'غدير', 'غرام',
  'فاتنة', 'فادية', 'فايزة', 'فدوى', 'فردوس', 'فوزية', 'كروان', 'كريمة', 'كوثر', 'لطيفة', 'لميس', 'لؤلؤة', 'ماجدة',
  'مايسة', 'مرام', 'مروانة', 'منال', 'مهدية', 'ميساء', 'ميسون', 'ميمونة', 'ناهد', 'نبيهة', 'نجاة', 'نجوى', 'نرمين',
  'نعمة', 'نهال', 'نوال', 'نيرة', 'هايدي', 'هيفاء', 'وصال', 'وعد', 'ياقوتة', 'يسر', 'حلا', 'ميرال', 'تولين',
  'لورا', 'روفان', 'أسماء', 'اسماء', 'أمل', 'امل', 'أحلام', 'احلام', 'أماني', 'اماني', 'ابتسام', 'إبتسام', 'إكرام',
  'إشراق', 'اشراق', 'أزهار', 'ازهار', 'إنعام', 'انعام', 'أنسام', 'انسام', 'أنغام', 'انغام', 'أثير', 'اثير',
  'أريج', 'اريج', 'أحكام', 'انشراح', 'إفتتان', 'افتكار', 'اعتماد', 'إعتماد', 'انتصار', 'إنتصار', 'افتخار',
  'امتنان', 'إمتنان', 'إيناس', 'ايناس', 'ألفت', 'الفت', 'عصمت', 'ميرفت', 'حكمت', 'عنايات', 'هدايات', 'جود',
  'غنى', 'غني', 'سما', 'رفاء', 'ميادة', 'مياده', 'رواند', 'ريحانة', 'ريحانه', 'شاهندة', 'شاهنده', 'شهيرة',
  'شهيره', 'عذراء', 'فريدة', 'فريده', 'فلك', 'فوز', 'فيحاء', 'كادي', 'كاميليا', 'لبنى', 'لبني', 'لدن', 'لجين',
  'ماري', 'ماريا', 'مايا', 'مهاد', 'ميريت', 'نادين', 'ناردين', 'نازك', 'نبال', 'نبرة', 'نجاح', 'نداء', 'نرجس',
  'نردين', 'نشوى', 'نشوي', 'نصرة', 'نصيرة', 'نظيرة', 'نعمات', 'هتون', 'هداية', 'هدايه', 'همسة', 'همسه', 'هنادي',
  'هند', 'هويدا', 'هيا', 'وسن', 'يثرب', 'ياقوت', 'ياسمينة', 'ياسمينه', 'رويدة', 'رويده', 'سيدرة', 'سدرة', 'سدره',
  'رواء', 'روند', 'سيليا', 'لوجين', 'ألين', 'الين', 'سيلفا', 'ميلا', 'نورين', 'ليان', 'ريمان', 'حور', 'سديم',
  'ترف', 'كيان', 'ميسم', 'وتين', 'ريف', 'جوانا', 'أسيل', 'اسيل', 'سوار', 'وجد', 'مزن', 'وسن', 'أسمى', 'اسمى',
  'إبتهال', 'ابتهال', 'إيثار', 'ايثار', 'شهدة', 'شذى', 'شذي', 'رغدة', 'رغده', 'نمارق', 'أفنان', 'افنان', 'سندس'
]);

// List of Arabic male names that might end with feminine letters (ة, ه, ى, ي, اء)
const MALE_NAMES_WITH_FEMININE_ENDINGS = new Set([
  'حمزة', 'حمزه', 'أسامة', 'اسامة', 'اسامه', 'طلحة', 'طلحه', 'عنترة', 'عنتره', 'قتادة', 'قتاده',
  'معاوية', 'معاويه', 'حذيفة', 'حذيفه', 'عبيدة', 'عبيده', 'ميسرة', 'ميسره', 'عكرمة', 'عكرمه',
  'سلامة', 'سلامه', 'شحاتة', 'شحاته', 'جمعة', 'جمعه', 'عطية', 'عطيه', 'شيبة', 'شيبه', 'ربيعة', 'ربيعه',
  'علقمة', 'علقمه', 'ثمامة', 'ثمامه', 'مصطفى', 'مصطفي', 'يحيى', 'يحيي', 'موسى', 'موسي', 'عيسى', 'عيسي',
  'مرتضى', 'مرتضي', 'مجتبى', 'مجتبي', 'علاء', 'بهاء', 'براء', 'ضياء', 'فداء', 'رضا', 'علي', 'على',
  'رامي', 'سامي', 'شادي', 'فادي', 'هادي', 'نادي', 'راضي', 'ماضي', 'غالي', 'والي', 'ناجي', 'شرف', 'زكريا',
  'زكرياء', 'طه', 'يس', 'ياسين', 'هاني', 'يحيي', 'يسري', 'صبري', 'لطفي', 'وجدي', 'حسني', 'بدري', 'فخري',
  'فتحي', 'حمدي', 'مجدي', 'فوزي', 'شوقي', 'رمزي', 'سامي', 'راضي', 'صفوت', 'عزت', 'مدحت', 'طلعت', 'رفعت',
  'عفت', 'نشأت', 'بهجت', 'رأفت', 'ثروت', 'جودت'
]);

/**
 * Normalizes an Arabic string by removing tashkeel and standardizing letters.
 */
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel/harakat
    .replace(/[أإآ]/g, 'ا') // Normalize Alef
    .replace(/ة/g, 'ه') // Normalize Taa Marbuta for matching
    .trim();
}

/**
 * Extracts the first word (first name) from a full student name string.
 */
export function extractFirstName(fullName: string): string {
  if (!fullName) return '';
  // Clean prefixes like "الطالب:", "الطالبة:", "الطالب/ة:", "الطالب", "الطالبة", "أ.", "د."
  let cleaned = fullName
    .replace(/^(الطالبة|الطالب\/ة|الطالب|طالبة|طالب|السيد|السيدة|الآنسة|أ\.|د\.|م\.)[:\s]*/i, '')
    .trim();
  
  // Handle compound names like "عبد الله", "عبد الرحمن", "نور الدين", "أم كلثوم", "منة الله"
  const parts = cleaned.split(/\s+/);
  if (parts.length === 0) return '';
  
  if (parts[0] === 'عبد' && parts.length > 1) {
    return `${parts[0]} ${parts[1]}`;
  }
  if ((parts[0] === 'أم' || parts[0] === 'ام') && parts.length > 1) {
    return `${parts[0]} ${parts[1]}`;
  }
  if ((parts[0] === 'منة' || parts[0] === 'منه' || parts[0] === 'هبة' || parts[0] === 'هبه' || parts[0] === 'نور') && parts.length > 1 && parts[1].startsWith('ال')) {
    return `${parts[0]} ${parts[1]}`;
  }
  
  return parts[0];
}

/**
 * Detects whether an Arabic name is feminine.
 */
export function isFemaleName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const firstName = extractFirstName(name);
  if (!firstName) return false;

  // Check if first name is in known male list
  if (MALE_NAMES_WITH_FEMININE_ENDINGS.has(firstName)) {
    return false;
  }

  // Check direct match in known female names set
  if (FEMALE_NAMES_SET.has(firstName)) {
    return true;
  }

  const normalized = normalizeArabic(firstName);
  for (const femaleName of FEMALE_NAMES_SET) {
    if (normalizeArabic(femaleName) === normalized) {
      return true;
    }
  }

  // Morphological rules
  // 1. Compound feminine names starting with "ام "
  if (firstName.startsWith('أم ') || firstName.startsWith('ام ')) {
    return true;
  }

  // 2. Name ending with 'ة' or 'ه' and not in known male list
  if ((firstName.endsWith('ة') || firstName.endsWith('ه')) && firstName.length >= 3) {
    return true;
  }

  // 3. Name ending with 'اء' (like شيماء، أسماء، حسناء، نجلاء، إسراء) and length >= 4
  if (firstName.endsWith('اء') && firstName.length >= 4) {
    return true;
  }

  // 4. Name ending with 'ى' (Alef Maqsura like سلمى، هدى، ندى، منى، لبنى، بشرى، ذكرى، جنى، تقى)
  if (firstName.endsWith('ى') && firstName.length >= 3) {
    return true;
  }

  return false;
}

/**
 * Returns 'female' or 'male' for a student or student name.
 */
export function getStudentGender(
  studentOrName: Student | string | undefined | null,
  explicitGender?: 'male' | 'female'
): 'male' | 'female' {
  if (explicitGender === 'female' || explicitGender === 'male') return explicitGender;
  if (!studentOrName) return 'male';

  if (typeof studentOrName === 'object' && studentOrName !== null) {
    if (studentOrName.gender === 'female') return 'female';
    if (studentOrName.gender === 'male') return 'male';
    return isFemaleName(studentOrName.name) ? 'female' : 'male';
  }

  if (typeof studentOrName === 'string') {
    return isFemaleName(studentOrName) ? 'female' : 'male';
  }

  return 'male';
}

/**
 * Returns "الطالبة" for female and "الطالب" for male.
 */
export function getStudentTitle(
  studentOrName: Student | string | undefined | null,
  explicitGender?: 'male' | 'female'
): 'الطالب' | 'الطالبة' {
  return getStudentGender(studentOrName, explicitGender) === 'female' ? 'الطالبة' : 'الطالب';
}

/**
 * Returns "طالبة" for female and "طالب" for male (without Alif-Lam).
 */
export function getStudentTitleIndef(
  studentOrName: Student | string | undefined | null,
  explicitGender?: 'male' | 'female'
): 'طالب' | 'طالبة' {
  return getStudentGender(studentOrName, explicitGender) === 'female' ? 'طالبة' : 'طالب';
}

/**
 * Returns "للطالبة" for female and "للطالب" for male.
 */
export function getStudentTitleFor(
  studentOrName: Student | string | undefined | null,
  explicitGender?: 'male' | 'female'
): 'للطالب' | 'للطالبة' {
  return getStudentGender(studentOrName, explicitGender) === 'female' ? 'للطالبة' : 'للطالب';
}

/**
 * Returns "الطالب/ة" or specific title.
 */
export function getStudentDisplayNameWithTitle(
  studentOrName: Student | string | undefined | null,
  explicitGender?: 'male' | 'female'
): string {
  const name = typeof studentOrName === 'object' && studentOrName !== null ? studentOrName.name : (studentOrName || '');
  const title = getStudentTitle(studentOrName, explicitGender);
  return `${title}: ${name}`;
}

/**
 * Formats an audit log detail text dynamically to ensure proper gender references (الطالب / الطالبة).
 * For example:
 * "أرشفة الطالب: أسراء مصطفي" -> "أرشفة الطالبة: أسراء مصطفي"
 * "أرشفة الطالب: بسملة حسين" -> "أرشفة الطالبة: بسملة حسين"
 * "أرشفة الطالب: سلمي عبد الله" -> "أرشفة الطالبة: سلمي عبد الله"
 * "أرشفة الطالب: محمود علاء" -> "أرشفة الطالب: محمود علاء"
 */
export function formatAuditLogDetails(details: string): string {
  if (!details || typeof details !== 'string') return details;

  let result = details;

  // Pattern 1: "أرشفة الطالب: [اسم]" / "تسجيل الطالب الجديد: [اسم]" / "تحديث بيانات الطالب: [اسم]" / "استعادة الطالب من الأرشيف: [اسم]" / "حذف نهائي لبيانات الطالب: [اسم]"
  result = result.replace(/(أرشفة|تسجيل|تحديث بيانات|استعادة|حذف نهائي لبيانات)\s+الطالب(?:\s+الجديد)?(?:\s+من الأرشيف)?:\s*([^\n،,]+)/g, (match, action, name) => {
    const trimmedName = name.trim();
    const isFemale = isFemaleName(trimmedName);
    if (isFemale) {
      if (action === 'أرشفة') return `أرشفة الطالبة: ${trimmedName}`;
      if (action === 'تسجيل') return `تسجيل الطالبة الجديدة: ${trimmedName}`;
      if (action === 'تحديث بيانات') return `تحديث بيانات الطالبة: ${trimmedName}`;
      if (action === 'استعادة') return `استعادة الطالبة من الأرشيف: ${trimmedName}`;
      if (action === 'حذف نهائي لبيانات') return `حذف نهائي لبيانات الطالبة: ${trimmedName}`;
    }
    return match;
  });

  // Pattern 2: "رصد/تحديث درجة الطالب ([اسم])" / "تسجيل حضور الطالب ([اسم])" / "تعديل حالة حضور الطالب ([اسم])" / "رصد درجة الطالب ([اسم])" / "رصد واجب الطالب ([اسم])"
  result = result.replace(/(درجة|حضور|واجب|غياب|بيانات|حالة حضور|إدخال درجة جديدة ل)\s*الطالب\s*\(([^)]+)\)/g, (match, prefix, name) => {
    const trimmedName = name.trim();
    const isFemale = isFemaleName(trimmedName);
    if (isFemale) {
      if (prefix === 'إدخال درجة جديدة ل') return `إدخال درجة جديدة للطالبة (${trimmedName})`;
      return `${prefix} الطالبة (${trimmedName})`;
    }
    return match;
  });

  // Pattern 3: "للطالب ([اسم])" / "للطالب: [اسم]"
  result = result.replace(/للطالب\s*(\([^\)]+\)|:\s*[^\n،,]+)/g, (match, namePart) => {
    const cleanName = namePart.replace(/[():]/g, '').trim();
    if (isFemaleName(cleanName)) {
      return `للطالبة ${namePart}`;
    }
    return match;
  });

  // Pattern 4: Generic "الطالب: [اسم]" -> "الطالبة: [اسم]"
  result = result.replace(/الطالب:\s*([^\n،,]+)/g, (match, name) => {
    const trimmedName = name.trim();
    if (isFemaleName(trimmedName)) {
      return `الطالبة: ${trimmedName}`;
    }
    return match;
  });

  // Pattern 5: Generic "الطالب ([اسم])" -> "الطالبة ([اسم])"
  result = result.replace(/الطالب\s*\(([^)]+)\)/g, (match, name) => {
    const trimmedName = name.trim();
    if (isFemaleName(trimmedName)) {
      return `الطالبة (${trimmedName})`;
    }
    return match;
  });

  return result;
}
