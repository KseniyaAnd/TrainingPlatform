import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AnalyticsFormatterService } from './analytics-formatter.service';

describe('AnalyticsFormatterService', () => {
  let service: AnalyticsFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsFormatterService],
    });

    service = TestBed.inject(AnalyticsFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('getTrendIcon', () => {
    it('should return arrow-up icon for improving trend', () => {
      expect(service.getTrendIcon('improving')).toBe('pi-arrow-up');
    });

    it('should return arrow-down icon for declining trend', () => {
      expect(service.getTrendIcon('declining')).toBe('pi-arrow-down');
    });

    it('should return minus icon for stable trend', () => {
      expect(service.getTrendIcon('stable')).toBe('pi-minus');
    });

    it('should return minus icon for undefined trend', () => {
      expect(service.getTrendIcon(undefined)).toBe('pi-minus');
    });

    it('should return minus icon for unknown trend', () => {
      expect(service.getTrendIcon('unknown')).toBe('pi-minus');
      expect(service.getTrendIcon('')).toBe('pi-minus');
    });
  });

  describe('getTrendColor', () => {
    it('should return emerald color for improving trend', () => {
      expect(service.getTrendColor('improving')).toBe('text-emerald-600');
    });

    it('should return red color for declining trend', () => {
      expect(service.getTrendColor('declining')).toBe('text-red-600');
    });

    it('should return gray color for stable trend', () => {
      expect(service.getTrendColor('stable')).toBe('text-gray-600');
    });

    it('should return gray color for undefined trend', () => {
      expect(service.getTrendColor(undefined)).toBe('text-gray-600');
    });

    it('should return gray color for unknown trend', () => {
      expect(service.getTrendColor('unknown')).toBe('text-gray-600');
      expect(service.getTrendColor('')).toBe('text-gray-600');
    });
  });

  describe('getTrendLabel', () => {
    it('should return "Улучшается" for improving trend', () => {
      expect(service.getTrendLabel('improving')).toBe('Улучшается');
    });

    it('should return "Ухудшается" for declining trend', () => {
      expect(service.getTrendLabel('declining')).toBe('Ухудшается');
    });

    it('should return "Стабильно" for stable trend', () => {
      expect(service.getTrendLabel('stable')).toBe('Стабильно');
    });

    it('should return "Неизвестно" for undefined trend', () => {
      expect(service.getTrendLabel(undefined)).toBe('Неизвестно');
    });

    it('should return "Неизвестно" for unknown trend', () => {
      expect(service.getTrendLabel('unknown')).toBe('Неизвестно');
      expect(service.getTrendLabel('')).toBe('Неизвестно');
    });
  });

  describe('trend formatting consistency', () => {
    it('should provide consistent formatting for improving trend', () => {
      const trend = 'improving';
      expect(service.getTrendIcon(trend)).toBe('pi-arrow-up');
      expect(service.getTrendColor(trend)).toBe('text-emerald-600');
      expect(service.getTrendLabel(trend)).toBe('Улучшается');
    });

    it('should provide consistent formatting for declining trend', () => {
      const trend = 'declining';
      expect(service.getTrendIcon(trend)).toBe('pi-arrow-down');
      expect(service.getTrendColor(trend)).toBe('text-red-600');
      expect(service.getTrendLabel(trend)).toBe('Ухудшается');
    });

    it('should provide consistent formatting for stable trend', () => {
      const trend = 'stable';
      expect(service.getTrendIcon(trend)).toBe('pi-minus');
      expect(service.getTrendColor(trend)).toBe('text-gray-600');
      expect(service.getTrendLabel(trend)).toBe('Стабильно');
    });

    it('should provide consistent default formatting', () => {
      const trend = undefined;
      expect(service.getTrendIcon(trend)).toBe('pi-minus');
      expect(service.getTrendColor(trend)).toBe('text-gray-600');
      expect(service.getTrendLabel(trend)).toBe('Неизвестно');
    });
  });

  describe('all trend types', () => {
    it('should handle all possible trend values', () => {
      const trends = ['improving', 'declining', 'stable', undefined, '', 'random'];

      trends.forEach((trend) => {
        const icon = service.getTrendIcon(trend);
        const color = service.getTrendColor(trend);
        const label = service.getTrendLabel(trend);

        expect(icon).toBeDefined();
        expect(color).toBeDefined();
        expect(label).toBeDefined();
        expect(typeof icon).toBe('string');
        expect(typeof color).toBe('string');
        expect(typeof label).toBe('string');
      });
    });
  });
});
