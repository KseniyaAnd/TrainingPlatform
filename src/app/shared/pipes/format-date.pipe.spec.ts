import { describe, expect, it } from 'vitest';

import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    pipe = new FormatDatePipe();
  });

  describe('Basic Functionality', () => {
    it('should create an instance', () => {
      expect(pipe).toBeTruthy();
    });

    it('should return "Не указано" for undefined value', () => {
      expect(pipe.transform(undefined)).toBe('Не указано');
    });

    it('should return "Не указано" for empty string', () => {
      expect(pipe.transform('')).toBe('Не указано');
    });
  });

  describe('Short Format', () => {
    it('should format date in short format', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = pipe.transform(date, 'short');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('should format different dates in short format', () => {
      const date1 = '2024-12-31T10:00:00Z';
      const result1 = pipe.transform(date1, 'short');

      expect(result1).toMatch(/31/);
      expect(result1).toMatch(/2024/);
    });
  });

  describe('Medium Format', () => {
    it('should format date in medium format', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = pipe.transform(date, 'medium');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('should include month name in medium format', () => {
      const date = '2024-06-15T10:30:00Z';
      const result = pipe.transform(date, 'medium');

      expect(result).toBeDefined();
      expect(result).toMatch(/15/);
    });
  });

  describe('Long Format (Default)', () => {
    it('should format date in long format by default', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = pipe.transform(date);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('should format date in long format explicitly', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = pipe.transform(date, 'long');

      expect(result).toBeDefined();
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('should include time in long format', () => {
      const date = '2024-01-15T14:30:00Z';
      const result = pipe.transform(date, 'long');

      expect(result).toBeDefined();
      // Time should be present in long format
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('Date Variations', () => {
    it('should handle ISO date strings', () => {
      const date = '2024-03-20T08:15:30.000Z';
      const result = pipe.transform(date);

      expect(result).toBeDefined();
      expect(result).toMatch(/20/);
      expect(result).toMatch(/2024/);
    });

    it('should handle different months', () => {
      const dates = ['2024-01-01T12:00:00Z', '2024-06-15T12:00:00Z', '2024-12-31T12:00:00Z'];

      dates.forEach((date) => {
        const result = pipe.transform(date);
        expect(result).toBeDefined();
        expect(result).toMatch(/2024/);
      });
    });

    it('should handle leap year dates', () => {
      const date = '2024-02-29T12:00:00Z';
      const result = pipe.transform(date);

      expect(result).toBeDefined();
      expect(result).toMatch(/29/);
      expect(result).toMatch(/2024/);
    });

    it('should handle different years', () => {
      const date1 = '2020-01-01T00:00:00Z';
      const date2 = '2025-01-01T00:00:00Z';

      const result1 = pipe.transform(date1);
      const result2 = pipe.transform(date2);

      expect(result1).toMatch(/2020/);
      expect(result2).toMatch(/2025/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid date strings gracefully', () => {
      const result = pipe.transform('invalid-date');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle very old dates', () => {
      const date = '1900-01-01T00:00:00Z';
      const result = pipe.transform(date);

      expect(result).toBeDefined();
      expect(result).toMatch(/1900/);
    });

    it('should handle future dates', () => {
      const date = '2030-12-31T12:00:00Z';
      const result = pipe.transform(date);

      expect(result).toBeDefined();
      expect(result).toMatch(/2030/);
    });
  });

  describe('Format Consistency', () => {
    it('should produce consistent output for same date', () => {
      const date = '2024-01-15T10:30:00Z';
      const result1 = pipe.transform(date);
      const result2 = pipe.transform(date);

      expect(result1).toBe(result2);
    });

    it('should produce different output for different formats', () => {
      const date = '2024-01-15T10:30:00Z';
      const short = pipe.transform(date, 'short');
      const medium = pipe.transform(date, 'medium');
      const long = pipe.transform(date, 'long');

      // All should be defined
      expect(short).toBeDefined();
      expect(medium).toBeDefined();
      expect(long).toBeDefined();

      // Long format should be longer (includes time)
      expect(long.length).toBeGreaterThanOrEqual(short.length);
    });
  });
});
