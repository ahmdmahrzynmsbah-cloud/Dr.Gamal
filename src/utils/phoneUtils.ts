/**
 * Utility functions for Egyptian phone number validation and normalization.
 */

// Convert Eastern Arabic / Persian numerals to Western digits (e.g., ٠١٠ -> 010)
export function normalizePhoneDigits(phone: string): string {
  if (!phone) return '';
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
 * 
 * @param phone The input phone number string
 * @param isRequired Whether an empty phone string should be considered invalid
 */
export function isValidEgyptianPhone(phone: string, isRequired = false): boolean {
  if (!phone || !phone.trim()) {
    return !isRequired;
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
      return `يرجى إدخال ${fieldLabel}.`;
    }
    return null;
  }

  if (!isValidEgyptianPhone(phone, isRequired)) {
    return `عذراً، ${fieldLabel} غير صحيح. يرجى إدخال رقم مصري صحيح مكون من 11 رقم يبدأ بـ (010, 011, 012, 015) مثل: 01012345678`;
  }

  return null;
}
