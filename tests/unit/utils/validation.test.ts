/**
 * Validation Utilities Tests
 */

import {
  validateLatLng,
  validateString,
  validateNumber,
  validateBoolean,
  validateEnum,
  validateRadius,
  validateMaxResults,
} from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';

describe('Validation Utilities', () => {
  describe('validateLatLng', () => {
    it('should validate valid coordinates', () => {
      const result = validateLatLng(
        { lat: -36.8485, lng: 174.7633 },
        'location'
      );
      expect(result).toEqual({ lat: -36.8485, lng: 174.7633 });
    });

    it('should throw for invalid lat range', () => {
      expect(() =>
        validateLatLng({ lat: 100, lng: 0 }, 'location')
      ).toThrow(ValidationError);
    });

    it('should throw for invalid lng range', () => {
      expect(() =>
        validateLatLng({ lat: 0, lng: 200 }, 'location')
      ).toThrow(ValidationError);
    });

    it('should throw for non-object input', () => {
      expect(() => validateLatLng('invalid', 'location')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateString', () => {
    it('should validate valid strings', () => {
      expect(validateString('hello', 'field')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(validateString('  hello  ', 'field')).toBe('hello');
    });

    it('should throw for empty strings', () => {
      expect(() => validateString('', 'field')).toThrow(ValidationError);
    });

    it('should throw for too long strings', () => {
      expect(() => validateString('a'.repeat(2000), 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateNumber', () => {
    it('should validate valid numbers', () => {
      expect(validateNumber(42, 'field')).toBe(42);
    });

    it('should throw for NaN', () => {
      expect(() => validateNumber(NaN, 'field')).toThrow(ValidationError);
    });

    it('should validate min constraint', () => {
      expect(() => validateNumber(5, 'field', 10)).toThrow(
        ValidationError
      );
    });

    it('should validate max constraint', () => {
      expect(() => validateNumber(15, 'field', 0, 10)).toThrow(
        ValidationError
      );
    });
  });

  describe('validateBoolean', () => {
    it('should validate true', () => {
      expect(validateBoolean(true, 'field')).toBe(true);
    });

    it('should validate false', () => {
      expect(validateBoolean(false, 'field')).toBe(false);
    });

    it('should throw for non-boolean', () => {
      expect(() => validateBoolean('true', 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateEnum', () => {
    const modes = ['driving', 'walking', 'transit'] as const;

    it('should validate valid enum value', () => {
      expect(validateEnum('driving', 'mode', modes)).toBe('driving');
    });

    it('should throw for invalid enum value', () => {
      expect(() => validateEnum('flying', 'mode', modes)).toThrow(
        ValidationError
      );
    });
  });

  describe('validateRadius', () => {
    it('should return default for undefined', () => {
      expect(validateRadius(undefined)).toBe(5000);
    });

    it('should validate valid radius', () => {
      expect(validateRadius(1000)).toBe(1000);
    });

    it('should throw for too large radius', () => {
      expect(() => validateRadius(100000)).toThrow(ValidationError);
    });

    it('should throw for too small radius', () => {
      expect(() => validateRadius(50)).toThrow(ValidationError);
    });
  });

  describe('validateMaxResults', () => {
    it('should return default for undefined', () => {
      expect(validateMaxResults(undefined)).toBe(20);
    });

    it('should validate valid max results', () => {
      expect(validateMaxResults(10)).toBe(10);
    });

    it('should throw for exceeding max', () => {
      expect(() => validateMaxResults(50)).toThrow(ValidationError);
    });

    it('should throw for less than 1', () => {
      expect(() => validateMaxResults(0)).toThrow(ValidationError);
    });
  });
});
