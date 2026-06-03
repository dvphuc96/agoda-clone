export function validateEmail(value: string): string | null {
  if (!value) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? null : 'auth.invalidEmail';
}

export function validatePhone(value: string): string | null {
  if (!value) return null;
  const re = /^(0[3-9])[0-9]{8}$/;
  return re.test(value) ? null : 'auth.invalidPhone';
}

export function validatePassword(value: string): string | null {
  if (!value) return null;
  return value.length >= 8 ? null : 'auth.passwordTooShort';
}

export function validateRequired(value: string, fieldKey: string): string | null {
  return value.trim() ? null : fieldKey;
}
