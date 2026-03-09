export const validatePassword = (password: string): string | null => {
  if (password.length < 10) return 'Password must be at least 10 characters';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

export const PASSWORD_HINT = 'Min. 10 characters, 1 number, 1 special character';
