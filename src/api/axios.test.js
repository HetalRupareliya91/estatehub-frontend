import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attachAuthToken, handleAuthError } from './axios';

describe('attachAuthToken', () => {
  beforeEach(() => localStorage.clear());

  it('adds the Authorization header when a token is stored', () => {
    localStorage.setItem('estatehub_token', 'abc123');
    const config = { headers: {} };
    const result = attachAuthToken(config);
    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('leaves the config untouched when there is no stored token', () => {
    const config = { headers: {} };
    const result = attachAuthToken(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});

describe('handleAuthError', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('estatehub_token', 'abc123');
    localStorage.setItem('estatehub_user', '{"id":"u1"}');
    // jsdom doesn't implement real navigation, so window.location is
    // replaced with a plain mutable object for these two tests only.
    delete window.location;
    window.location = { pathname: '/leads', href: '' };
  });

  it('clears stored auth and redirects to /login on a 401, when not already there', async () => {
    const error = { response: { status: 401 } };
    await expect(handleAuthError(error)).rejects.toBe(error);
    expect(localStorage.getItem('estatehub_token')).toBeNull();
    expect(localStorage.getItem('estatehub_user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('does not redirect again if already on the login page', async () => {
    window.location.pathname = '/login';
    const error = { response: { status: 401 } };
    await expect(handleAuthError(error)).rejects.toBe(error);
    expect(window.location.href).toBe(''); // untouched - would otherwise loop
  });

  it('leaves stored auth alone for a non-401 error', async () => {
    const error = { response: { status: 500 } };
    await expect(handleAuthError(error)).rejects.toBe(error);
    expect(localStorage.getItem('estatehub_token')).toBe('abc123');
    expect(window.location.href).toBe('');
  });

  it('still rejects (does not throw) when the error has no response at all (network error)', async () => {
    const error = new Error('Network Error');
    await expect(handleAuthError(error)).rejects.toBe(error);
    expect(localStorage.getItem('estatehub_token')).toBe('abc123');
  });
});
