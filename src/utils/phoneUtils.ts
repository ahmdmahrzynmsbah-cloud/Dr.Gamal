/**
 * Utility functions for Egyptian phone number validation and normalization.
 */

// Check if the input text indicates "No phone" (e.g. "لا يوجد", "غير متوفر", etc.)
export function isNoPhoneValue(phone: string): boolean {
  if (!phone) return false;
  const trimmed = phone.trim().toLowerCase();
  const noPhonePatterns = [
    'لا يوجد',
    'لايوجد',
    'غير متوفر',
    'ليس لديه',
    'بدون',
    'لا يملك',
    'لايوجد هاتف',
    'لا يوجد هاتف',
    'لايوجد رقم',
    'لا يوجد رقم',
    'لايوجد محمول',
    'لا يوجد محمول',
    'none',
    'n/a',
    'no phone'
  ];
  return noPhonePatterns.some(pattern => trimmed.includes(pattern)) || trimmed === 'لا' || trimmed === '0';
}

// Convert Eastern Arabic / Persian numerals to Western digits (e.g., ٠١٠ -> 010)
export function normalizePhoneDigits(phone: string): string {
  if (!phone) return '';
  if (isNoPhoneValue(phone)) {
    return 'لا يوجد';
  }
  return phone
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9')
    .trim();
}

/**
 * Validates whether a string is a valid Egyptian phone number.
 * - Egyptian Mobile: 11 digits starting with 010, 011, 012, or 015
 *   (Also accepts international format starting with +201X, 201X, or 00201X)
 * - Egyptian Landline: 9-10 digits starting with 0 (e.g., 02, 03, 050, 040, 055, etc.)
 * - Also accepts "لا يوجد" / "غير متوفر" as a valid entry
 * 
 * @param phone The input phone number string
 * @param isRequired Whether an empty phone string should be considered invalid
 */
export function isValidEgyptianPhone(phone: string, isRequired = false): boolean {
  if (!phone || !phone.trim()) {
    return !isRequired;
  }

  if (isNoPhoneValue(phone)) {
    return true;
  }

  const normalized = normalizePhoneDigits(phone);
  // Remove common separators (spaces, hyphens, plus, parentheses)
  const cleaned = normalized.replace(/[\s\-\+\(\)]/g, '');

  // 1) Local Egyptian Mobile: 11 digits starting with 010, 011, 012, or 015
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    return true;
  }

  // 2) International Egyptian Mobile: e.g. 201012345678, 201112345678, 00201012345678
  if (/^(20|0020)1[0125]\d{8}$/.test(cleaned)) {
    return true;
  }

  // 3) Egyptian Landline: 9 to 10 digits starting with 0 (02, 03, 050, 040, 055, etc.)
  if (/^0[234589]\d{7,8}$/.test(cleaned)) {
    return true;
  }

  return false;
}

/**
 * Returns a human-readable Arabic error message if the phone number is invalid, or null if valid.
 */
export function validateEgyptianPhone(phone: string, fieldLabel = 'رقم الهاتف', isRequired = false): string | null {
  if (!phone || !phone.trim()) {
    if (isRequired) {
      return `يرجى إدخال ${fieldLabel} أو اختيار "لا يوجد".`;
    }
    return null;
  }

  if (isNoPhoneValue(phone)) {
    return null;
  }

  const normalized = normalizePhoneDigits(phone);
  const cleaned = normalized.replace(/[\s\-\+\(\)]/g, '');

  // Check for non-digit characters
  if (!/^\d+$/.test(cleaned)) {
    return `عذراً، ${fieldLabel} يجب أن يحتوي على أرقام فقط دون حروف أو رموز غريبة.`;
  }

  // Case 1: Standard local mobile starting with "01"
  if (cleaned.startsWith('01')) {
    if (cleaned.length > 11) {
      const extraCount = cleaned.length - 11;
      return `عذراً، ${fieldLabel} زائد عن المطلوب (${cleaned.length} رقم). رقم المحمول المصري يتكون من 11 رقم فقط (يوجد ${extraCount} رقم زيادة).`;
    }
    if (cleaned.length < 11) {
      const missingCount = 11 - cleaned.length;
      return `عذراً، ${fieldLabel} ناقص (${cleaned.length} رقم). رقم المحمول المصري يتكون من 11 رقم (ينقصك ${missingCount} رقم).`;
    }
    // 11 digits check network code
    if (!/^01[0125]/.test(cleaned)) {
      const networkPrefix = cleaned.slice(0, 3);
      return `عذراً، ${fieldLabel} يبدأ بـ (${networkPrefix}) وهو غير تابع لأي شبكة محمول مصرية. يجب أن يبدأ بـ (010, 011, 012, 015).`;
    }
    return null; // Valid 11-digit mobile
  }

  // Case 2: International Egyptian format starting with "201" or "00201"
  if (cleaned.startsWith('201')) {
    if (cleaned.length > 12) {
      return `عذراً، ${fieldLabel} بالصيغة الدولية زائد عن المطلوب (${cleaned.length} رقم). الصيغة الدولية للمحمول تكون 12 رقم فقط (مثال: 201012345678).`;
    }
    if (cleaned.length < 12) {
      return `عذراً، ${fieldLabel} بالصيغة الدولية ناقص (${cleaned.length} رقم). يجب أن يتكون من 12 رقم (مثال: 201012345678).`;
    }
    if (!/^201[0125]/.test(cleaned)) {
      return `عذراً، كود الشبكة غير صحيح. يجب أن يبدأ الرقم بـ 2010 أو 2011 أو 2012 أو 2015.`;
    }
    return null;
  }

  if (cleaned.startsWith('00201')) {
    if (cleaned.length > 14) {
      return `عذراً، ${fieldLabel} بالصيغة الدولية زائد عن المطلوب.`;
    }
    if (cleaned.length < 14) {
      return `عذراً، ${fieldLabel} بالصيغة الدولية ناقص.`;
    }
    if (!/^00201[0125]/.test(cleaned)) {
      return `عذراً، كود الشبكة غير صحيح.`;
    }
    return null;
  }

  // Case 3: Landline starting with "0" (e.g., 02, 03, 050, 040, etc.)
  if (cleaned.startsWith('0')) {
    if (cleaned.length > 10) {
      return `عذراً، ${fieldLabel} الأرضي زائد عن المطلوب. أرقام التليفون الأرضي بمصر تكون من 9 إلى 10 أرقام فقط (كود المحافظة + الرقم).`;
    }
    if (cleaned.length < 9) {
      return `عذراً، ${fieldLabel} الأرضي ناقص (${cleaned.length} أرقام). أرقام التليفون الأرضي تتكون من 9 إلى 10 أرقام.`;
    }
    if (!/^0[234589]/.test(cleaned)) {
      return `عذراً، كود المحافظة في ${fieldLabel} غير صحيح.`;
    }
    return null;
  }

  // Case 4: Invalid starting digits
  return `عذراً، ${fieldLabel} غير صحيح. يجب أن يبدأ بـ (01) لأرقام المحمول المصرية أو بـ (02, 03..) للأرضي.`;
}
