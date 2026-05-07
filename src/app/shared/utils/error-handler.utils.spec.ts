import { describe, expect, it, vi } from 'vitest';
import { extractErrorMessage, handleLoadError, isAuthError } from './error-handler.utils.js';

describe('Error Handler Utils', () => {
  describe('handleLoadError', () => {
    it('should return custom message when provided', () => {
      const error = new Error('Network error');
      const result = handleLoadError(error, 'users', 'Кастомная ошибка');

      expect(result).toBe('Кастомная ошибка');
    });

    it('should return standard message for "users" context', () => {
      const error = new Error('Failed');
      const result = handleLoadError(error, 'users');

      expect(result).toBe('Не удалось загрузить список пользователей');
    });

    it('should return standard message for "courses" context', () => {
      const error = new Error('Failed');
      const result = handleLoadError(error, 'courses');

      expect(result).toBe('Не удалось загрузить список курсов');
    });

    it('should return standard message for "user details" context', () => {
      const error = new Error('Failed');
      const result = handleLoadError(error, 'user details');

      expect(result).toBe('Не удалось загрузить данные пользователя');
    });

    it('should return standard message for "platform statistics" context', () => {
      const error = new Error('Failed');
      const result = handleLoadError(error, 'platform statistics');

      expect(result).toBe('Не удалось загрузить статистику платформы');
    });

    it('should return generic message for unknown context', () => {
      const error = new Error('Failed');
      const result = handleLoadError(error, 'unknown-context');

      expect(result).toBe('Не удалось загрузить unknown-context');
    });

    it('should log error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      handleLoadError(error, 'users');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load users:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      expect(extractErrorMessage(error)).toBe('Test error message');
    });

    it('should return string error as is', () => {
      expect(extractErrorMessage('String error')).toBe('String error');
    });

    it('should return fallback for unknown error type', () => {
      expect(extractErrorMessage(null)).toBe('Произошла ошибка');
      expect(extractErrorMessage(undefined)).toBe('Произошла ошибка');
      expect(extractErrorMessage(123)).toBe('Произошла ошибка');
      expect(extractErrorMessage({})).toBe('Произошла ошибка');
    });

    it('should use custom fallback message', () => {
      expect(extractErrorMessage(null, 'Кастомный fallback')).toBe('Кастомный fallback');
    });

    it('should handle Error subclasses', () => {
      const typeError = new TypeError('Type error');
      expect(extractErrorMessage(typeError)).toBe('Type error');
    });
  });

  describe('isAuthError', () => {
    it('should return true for 401 error', () => {
      const error = new Error('401 Unauthorized');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for 403 error', () => {
      const error = new Error('403 Forbidden');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for string error with 401', () => {
      expect(isAuthError('Error 401: Unauthorized')).toBe(true);
    });

    it('should return true for string error with 403', () => {
      expect(isAuthError('Error 403: Forbidden')).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      expect(isAuthError(new Error('404 Not Found'))).toBe(false);
      expect(isAuthError(new Error('500 Server Error'))).toBe(false);
      expect(isAuthError('Network error')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isAuthError(null)).toBe(false);
      expect(isAuthError(undefined)).toBe(false);
    });

    it('should handle error objects without message', () => {
      expect(isAuthError({})).toBe(false);
      expect(isAuthError(123)).toBe(false);
    });
  });

  describe('error handler integration', () => {
    it('should work together for complete error handling flow', () => {
      const error = new Error('401 Unauthorized');
      const isAuth = isAuthError(error);
      const message = extractErrorMessage(error);
      const handledMessage = handleLoadError(error, 'users');

      expect(isAuth).toBe(true);
      expect(message).toBe('401 Unauthorized');
      expect(handledMessage).toBe('Не удалось загрузить список пользователей');
    });
  });
});
