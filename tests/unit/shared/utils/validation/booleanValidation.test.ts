import { describe, expect, it } from 'vitest';
import {
  assertIsBoolean,
  BooleanValidationError,
  safeValidateBoolean,
  validateFilterBoolean,
  validateStrictBoolean,
} from '../../../../../src/shared/utils/validation';

describe('booleanValidation', () => {
  describe('BooleanValidationError', () => {
    it('should create error with proper properties', () => {
      const error = new BooleanValidationError('Test message', 'testField', 'invalid');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('BooleanValidationError');
      expect(error.fieldName).toBe('testField');
      expect(error.receivedValue).toBe('invalid');
    });
  });

  describe('assertIsBoolean', () => {
    it('should pass for valid boolean true', () => {
      expect(() => assertIsBoolean(true, 'testField')).not.toThrow();
    });

    it('should pass for valid boolean false', () => {
      expect(() => assertIsBoolean(false, 'testField')).not.toThrow();
    });

    it('should throw for string "true"', () => {
      expect(() => assertIsBoolean('true', 'testField')).toThrow(BooleanValidationError);
      expect(() => assertIsBoolean('true', 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: string',
      );
    });

    it('should throw for string "false"', () => {
      expect(() => assertIsBoolean('false', 'testField')).toThrow(BooleanValidationError);
    });

    it('should throw for number 1', () => {
      expect(() => assertIsBoolean(1, 'testField')).toThrow(BooleanValidationError);
      expect(() => assertIsBoolean(1, 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: number',
      );
    });

    it('should throw for number 0', () => {
      expect(() => assertIsBoolean(0, 'testField')).toThrow(BooleanValidationError);
    });

    it('should throw for null', () => {
      expect(() => assertIsBoolean(null, 'testField')).toThrow(BooleanValidationError);
      expect(() => assertIsBoolean(null, 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: object',
      );
    });

    it('should throw for undefined', () => {
      expect(() => assertIsBoolean(undefined, 'testField')).toThrow(BooleanValidationError);
      expect(() => assertIsBoolean(undefined, 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: undefined',
      );
    });

    it('should throw for object', () => {
      expect(() => assertIsBoolean({}, 'testField')).toThrow(BooleanValidationError);
    });

    it('should throw for array', () => {
      expect(() => assertIsBoolean([], 'testField')).toThrow(BooleanValidationError);
    });
  });

  describe('validateStrictBoolean', () => {
    it('should return true for valid boolean true', () => {
      expect(validateStrictBoolean(true, 'testField')).toBe(true);
    });

    it('should return true for valid boolean false', () => {
      expect(validateStrictBoolean(false, 'testField')).toBe(true);
    });

    it('should throw specific error for null', () => {
      expect(() => validateStrictBoolean(null, 'testField')).toThrow(
        'testField cannot be null or undefined',
      );
    });

    it('should throw specific error for undefined', () => {
      expect(() => validateStrictBoolean(undefined, 'testField')).toThrow(
        'testField cannot be null or undefined',
      );
    });

    it('should throw specific error for string "true"', () => {
      expect(() => validateStrictBoolean('true', 'testField')).toThrow(
        "testField cannot be a string representation of boolean ('true'/'false')",
      );
    });

    it('should throw specific error for string "false"', () => {
      expect(() => validateStrictBoolean('false', 'testField')).toThrow(
        "testField cannot be a string representation of boolean ('true'/'false')",
      );
    });

    it('should throw specific error for number 1', () => {
      expect(() => validateStrictBoolean(1, 'testField')).toThrow(
        'testField cannot be a numeric representation of boolean (1/0)',
      );
    });

    it('should throw specific error for number 0', () => {
      expect(() => validateStrictBoolean(0, 'testField')).toThrow(
        'testField cannot be a numeric representation of boolean (1/0)',
      );
    });

    it('should throw for other string values', () => {
      expect(() => validateStrictBoolean('invalid', 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: string',
      );
    });

    it('should throw for other number values', () => {
      expect(() => validateStrictBoolean(42, 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: number',
      );
    });
  });

  describe('safeValidateBoolean', () => {
    it('should return valid result for boolean true', () => {
      const result = safeValidateBoolean(true, 'testField');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid result for boolean false', () => {
      const result = safeValidateBoolean(false, 'testField');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should return error result for null', () => {
      const result = safeValidateBoolean(null, 'testField');
      expect(result.valid).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.error).toBe('testField cannot be null or undefined');
    });

    it('should return error result for string "true"', () => {
      const result = safeValidateBoolean('true', 'testField');
      expect(result.valid).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.error).toBe(
        "testField cannot be a string representation of boolean ('true'/'false')",
      );
    });

    it('should return error result for number 1', () => {
      const result = safeValidateBoolean(1, 'testField');
      expect(result.valid).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.error).toBe('testField cannot be a numeric representation of boolean (1/0)');
    });

    it('should return error result for invalid type', () => {
      const result = safeValidateBoolean('invalid', 'testField');
      expect(result.valid).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.error).toBe(
        'testField must be a boolean value (true or false), received: string',
      );
    });
  });

  describe('validateFilterBoolean', () => {
    it('should return true for boolean true', () => {
      expect(validateFilterBoolean(true, 'testField')).toBe(true);
    });

    it('should return true for boolean false', () => {
      expect(validateFilterBoolean(false, 'testField')).toBe(true);
    });

    it('should return true for null (IS NULL queries)', () => {
      expect(validateFilterBoolean(null, 'testField')).toBe(true);
    });

    it('should throw for undefined', () => {
      expect(() => validateFilterBoolean(undefined, 'testField')).toThrow(
        'testField cannot be null or undefined',
      );
    });

    it('should throw for string "true"', () => {
      expect(() => validateFilterBoolean('true', 'testField')).toThrow(
        "testField cannot be a string representation of boolean ('true'/'false')",
      );
    });

    it('should throw for number 1', () => {
      expect(() => validateFilterBoolean(1, 'testField')).toThrow(
        'testField cannot be a numeric representation of boolean (1/0)',
      );
    });

    it('should throw for invalid type', () => {
      expect(() => validateFilterBoolean('invalid', 'testField')).toThrow(
        'testField must be a boolean value (true or false), received: string',
      );
    });
  });
});
