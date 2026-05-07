import { describe, expect, it } from 'vitest';
import { getRoleLabel, getRoleSeverity } from './role.utils.js';

describe('Role Utils', () => {
  describe('getRoleSeverity', () => {
    it('should return "warn" for ADMIN role', () => {
      expect(getRoleSeverity('ADMIN')).toBe('warn');
    });

    it('should return "info" for TEACHER role', () => {
      expect(getRoleSeverity('TEACHER')).toBe('info');
    });

    it('should return "success" for STUDENT role', () => {
      expect(getRoleSeverity('STUDENT')).toBe('success');
    });

    it('should return "secondary" for unknown role', () => {
      expect(getRoleSeverity('UNKNOWN')).toBe('secondary');
      expect(getRoleSeverity('')).toBe('secondary');
      expect(getRoleSeverity('guest')).toBe('secondary');
    });

    it('should handle case-sensitive role names', () => {
      expect(getRoleSeverity('admin')).toBe('secondary');
      expect(getRoleSeverity('Admin')).toBe('secondary');
    });
  });

  describe('getRoleLabel', () => {
    it('should return "Администратор" for ADMIN role', () => {
      expect(getRoleLabel('ADMIN')).toBe('Администратор');
    });

    it('should return "Преподаватель" for TEACHER role', () => {
      expect(getRoleLabel('TEACHER')).toBe('Преподаватель');
    });

    it('should return "Студент" for STUDENT role', () => {
      expect(getRoleLabel('STUDENT')).toBe('Студент');
    });

    it('should return original role for unknown role', () => {
      expect(getRoleLabel('UNKNOWN')).toBe('UNKNOWN');
      expect(getRoleLabel('GUEST')).toBe('GUEST');
      expect(getRoleLabel('')).toBe('');
    });

    it('should handle case-sensitive role names', () => {
      expect(getRoleLabel('admin')).toBe('admin');
      expect(getRoleLabel('Teacher')).toBe('Teacher');
    });
  });

  describe('role utils integration', () => {
    it('should provide consistent severity and label for each role', () => {
      const roles = ['ADMIN', 'TEACHER', 'STUDENT'];

      roles.forEach((role) => {
        const severity = getRoleSeverity(role);
        const label = getRoleLabel(role);

        expect(severity).toBeDefined();
        expect(label).toBeDefined();
        expect(label).not.toBe(role); // Должна быть локализация
      });
    });
  });
});
