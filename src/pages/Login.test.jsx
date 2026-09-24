import { describe, it, expect } from 'vitest';
import { validate } from './Login';

describe('Login validate()', () => {
  it('flags both fields empty', () => {
    const errors = validate({ email: '', password: '' });
    expect(errors.email).toBe('Email is required');
    expect(errors.password).toBe('Password is required');
  });

  it('rejects an email with no @', () => {
    const errors = validate({ email: 'not-an-email', password: 'secret123' });
    expect(errors.email).toBe('Enter a valid email address');
    expect(errors.password).toBeUndefined();
  });

  it('treats whitespace-only email as empty', () => {
    const errors = validate({ email: '   ', password: 'secret123' });
    expect(errors.email).toBe('Email is required');
  });

  it('requires a password even when the email is valid', () => {
    const errors = validate({ email: 'hetal@estatehub.com', password: '' });
    expect(errors.password).toBe('Password is required');
    expect(errors.email).toBeUndefined();
  });

  it('accepts a valid email and non-empty password', () => {
    expect(validate({ email: 'hetal@estatehub.com', password: 'secret123' })).toEqual({});
  });

  it('accepts a subdomain email', () => {
    expect(validate({ email: 'hetal@sub.estatehub.co.in', password: 'x' })).toEqual({});
  });

  it('is tolerant of leading/trailing whitespace around a valid email', () => {
    expect(validate({ email: '  hetal@test.com  ', password: 'x' })).toEqual({});
  });

  it('rejects an email with a space in the local part', () => {
    const errors = validate({ email: 'hetal @test.com', password: 'x' });
    expect(errors.email).toBe('Enter a valid email address');
  });
});
