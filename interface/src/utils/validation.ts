import {
  EMAIL_REGEX,
  PASSWORD_RULES,
  PASSWORD_STRENGTH,
} from '@/constants/config'

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length checks
  if (password.length >= PASSWORD_RULES.MIN_LENGTH) {
    score += 25
  } else {
    feedback.push(`Minimal ${PASSWORD_RULES.MIN_LENGTH} karakter`)
  }

  if (password.length >= 12) {
    score += 25
  }

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 20
  } else {
    feedback.push('Gunakan huruf besar dan kecil')
  }

  if (/\d/.test(password)) {
    score += 15
  } else {
    feedback.push('Tambahkan angka')
  }

  if (new RegExp(`[${PASSWORD_RULES.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    score += 15
  } else {
    feedback.push('Tambahkan simbol khusus')
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong'
  if (score <= PASSWORD_STRENGTH.WEAK_MAX) {
    strength = 'weak'
  } else if (score <= PASSWORD_STRENGTH.MEDIUM_MAX) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return { strength, score, feedback }
}

/**
 * Validate password against rules
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(`Password minimal ${PASSWORD_RULES.MIN_LENGTH} karakter`)
  }

  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar')
  }

  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  }

  if (PASSWORD_RULES.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password harus mengandung angka')
  }

  if (PASSWORD_RULES.REQUIRE_SPECIAL) {
    const specialRegex = new RegExp(
      `[${PASSWORD_RULES.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`
    )
    if (!specialRegex.test(password)) {
      errors.push('Password harus mengandung karakter khusus')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate name
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 3
}

/**
 * Sanitize input untuk prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
}
