import { isLoginSuccess, usernameError } from './validators';

describe('usernameError', () => {
  it('returns prompt when empty', () => {
    expect(usernameError('')).toBe('please enter your username');
  });

  it('returns length error when over 24 characters', () => {
    expect(usernameError('a'.repeat(25))).toBe('Must not exceed 24 characters');
  });

  it('accepts exactly 24 characters', () => {
    expect(usernameError('a'.repeat(24))).toBeNull();
  });

  it('returns alphanumeric error for special characters', () => {
    expect(usernameError('user_name')).toBe('Values must be alphanumeric');
  });

  it('accepts letters and numbers', () => {
    expect(usernameError('user123')).toBeNull();
  });
});

describe('isLoginSuccess', () => {
  it('true when loginStatus is success', () => {
    expect(isLoginSuccess({ loginStatus: 'success' })).toBeTrue();
  });

  it('false when loginStatus is not success', () => {
    expect(isLoginSuccess({ loginStatus: 'failed' })).toBeFalse();
  });

  it('false for an error payload', () => {
    expect(isLoginSuccess({ error: 'invalid otp' })).toBeFalse();
  });

  it('true when status flag is true', () => {
    expect(isLoginSuccess({ status: true })).toBeTrue();
  });

  it('true when success flag is true', () => {
    expect(isLoginSuccess({ success: true })).toBeTrue();
  });
});
