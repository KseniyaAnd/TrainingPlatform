import { describe, expect, it } from 'vitest';
import { formatDate, getDaysDifference, isDateInPast } from './date-utils.js';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/01|января/i);
      expect(formatted).toMatch(/2024/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15T10:30:00Z');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should handle invalid dates gracefully', () => {
      const formatted = formatDate('invalid-date');
      expect(formatted).toBeDefined();
    });
  });

  describe('isDateInPast', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01T00:00:00Z');
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01T00:00:00Z');
      expect(isDateInPast(futureDate)).toBe(false);
    });

    it('should handle string dates', () => {
      expect(isDateInPast('2020-01-01T00:00:00Z')).toBe(true);
      expect(isDateInPast('2030-01-01T00:00:00Z')).toBe(false);
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate days difference correctly', () => {
      const date1 = new Date('2024-01-01T00:00:00Z');
      const date2 = new Date('2024-01-11T00:00:00Z');
      expect(getDaysDifference(date1, date2)).toBe(10);
    });

    it('should return positive number for past to future', () => {
      const past = new Date('2024-01-01T00:00:00Z');
      const future = new Date('2024-01-31T00:00:00Z');
      expect(getDaysDifference(past, future)).toBeGreaterThan(0);
    });

    it('should return negative number for future to past', () => {
      const future = new Date('2024-01-31T00:00:00Z');
      const past = new Date('2024-01-01T00:00:00Z');
      expect(getDaysDifference(future, past)).toBeLessThan(0);
    });

    it('should return 0 for same dates', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(getDaysDifference(date, date)).toBe(0);
    });
  });
});
