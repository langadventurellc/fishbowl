import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeString,
  sanitizeValue,
  validateChannelName,
  validateUuid,
  validateSafeObject,
  validateIpcArguments,
  ipcRateLimiter,
} from '../../../src/preload/validation';

describe('Validation Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = sanitizeString(input);
      expect(result).toBe('Hello  World');
    });

    it('should remove iframe tags', () => {
      const input = 'Hello <iframe src="malicious.com"></iframe> World';
      const result = sanitizeString(input);
      expect(result).toBe('Hello  World');
    });

    it('should remove javascript: protocols', () => {
      const input = 'Hello javascript:alert("xss") World';
      const result = sanitizeString(input);
      expect(result).toBe('Hello alert("xss") World');
    });

    it('should remove event handlers', () => {
      const input = 'Hello onclick="alert()" World';
      const result = sanitizeString(input);
      expect(result).toBe('Hello  World');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeValue', () => {
    it('should sanitize string values', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeValue(input);
      expect(result).toBe('');
    });

    it('should sanitize array values', () => {
      const input = ['normal', '<script>alert("xss")</script>', 'also normal'];
      const result = sanitizeValue(input) as string[];
      expect(result).toEqual(['normal', '', 'also normal']);
    });

    it('should sanitize object values', () => {
      const input = {
        safe: 'normal value',
        unsafe: '<script>alert("xss")</script>',
        'unsafe<script>': 'value',
      };
      const result = sanitizeValue(input) as Record<string, string>;
      expect(result.safe).toBe('normal value');
      expect(result.unsafe).toBe('');
      expect(result['unsafe_1']).toBe('value'); // Key 'unsafe<script>' sanitized to 'unsafe_1' to avoid collision
    });

    it('should handle nested objects', () => {
      const input = {
        nested: {
          safe: 'normal',
          unsafe: '<script>alert("xss")</script>',
        },
      };
      const result = sanitizeValue(input) as any;
      expect(result.nested.safe).toBe('normal');
      expect(result.nested.unsafe).toBe('');
    });

    it('should handle non-string values', () => {
      const input = { number: 123, boolean: true, null: null };
      const result = sanitizeValue(input);
      expect(result).toEqual({ number: 123, boolean: true, null: null });
    });
  });

  describe('validateChannelName', () => {
    it('should validate correct channel names', () => {
      expect(validateChannelName('window:minimize')).toBe(true);
      expect(validateChannelName('db:agents:list')).toBe(true);
      expect(validateChannelName('secure:credentials:get')).toBe(true);
    });

    it('should reject invalid channel names', () => {
      expect(validateChannelName('invalid channel')).toBe(false);
      expect(validateChannelName('invalid@channel')).toBe(false);
      expect(validateChannelName('invalid.channel')).toBe(false);
      expect(validateChannelName('')).toBe(false);
    });
  });

  describe('validateUuid', () => {
    it('should validate correct UUIDs', () => {
      expect(validateUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validateUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validateUuid('not-a-uuid')).toBe(false);
      expect(validateUuid('123e4567-e89b-12d3-a456-42661417400')).toBe(false);
      expect(validateUuid('')).toBe(false);
      expect(validateUuid('123')).toBe(false);
    });
  });

  describe('validateSafeObject', () => {
    it('should validate safe objects', () => {
      const safeObj = { name: 'test', value: 123 };
      expect(validateSafeObject(safeObj)).toBe(true);
    });

    it('should reject objects with dangerous properties', () => {
      const dangerousObj = { name: 'test' };
      Object.defineProperty(dangerousObj, '__proto__', { value: {}, enumerable: true });
      expect(validateSafeObject(dangerousObj)).toBe(false);
    });

    it('should reject objects with constructor property', () => {
      const dangerousObj = { name: 'test', constructor: Function };
      expect(validateSafeObject(dangerousObj)).toBe(false);
    });

    it('should reject objects with prototype property', () => {
      const dangerousObj = { name: 'test', prototype: {} };
      expect(validateSafeObject(dangerousObj)).toBe(false);
    });

    it('should reject non-objects', () => {
      expect(validateSafeObject('string')).toBe(false);
      expect(validateSafeObject(123)).toBe(false);
      expect(validateSafeObject(null)).toBe(false);
    });
  });

  describe('validateIpcArguments', () => {
    it('should validate window control channels', () => {
      const result = validateIpcArguments('window:minimize', []);
      expect(result.valid).toBe(true);
    });

    it('should validate database get operations with UUID', () => {
      const result = validateIpcArguments('db:agents:get', [
        '123e4567-e89b-12d3-a456-426614174000',
      ]);
      expect(result.valid).toBe(true);
    });

    it('should reject database get operations with invalid UUID', () => {
      const result = validateIpcArguments('db:agents:get', ['not-a-uuid']);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Valid UUID required');
    });

    it('should validate config operations', () => {
      const setResult = validateIpcArguments('config:set', ['theme', 'dark']);
      expect(setResult.valid).toBe(true);

      const getResult = validateIpcArguments('config:get', ['theme']);
      expect(getResult.valid).toBe(true);
    });

    it('should reject config operations with invalid arguments', () => {
      const result = validateIpcArguments('config:get', []);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Configuration key required');
    });

    it('should validate secure storage operations', () => {
      const result = validateIpcArguments('secure:credentials:get', ['openai']);
      expect(result.valid).toBe(true);
    });

    it('should validate theme operations', () => {
      const result = validateIpcArguments('theme:set', ['dark']);
      expect(result.valid).toBe(true);
    });

    it('should reject theme operations with invalid theme', () => {
      const result = validateIpcArguments('theme:set', ['invalid-theme']);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Valid theme value required');
    });

    it('should sanitize arguments', () => {
      const result = validateIpcArguments('config:set', ['theme', '<script>alert("xss")</script>']);
      expect(result.valid).toBe(true);
      expect(result.sanitizedArgs?.[1]).toBe('');
    });

    it('should reject unsafe objects', () => {
      const unsafeObj = { name: 'test' };
      Object.defineProperty(unsafeObj, '__proto__', { value: {}, enumerable: true });
      const result = validateIpcArguments('db:agents:create', [unsafeObj]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unsafe object detected');
    });

    describe('Message Active State Operations', () => {
      it('should validate db:messages:toggle-active-state with valid UUID', () => {
        const result = validateIpcArguments('db:messages:toggle-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
        ]);
        expect(result.valid).toBe(true);
      });

      it('should reject db:messages:toggle-active-state with invalid UUID', () => {
        const result = validateIpcArguments('db:messages:toggle-active-state', ['not-a-uuid']);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid UUID required');
      });

      it('should reject db:messages:toggle-active-state with no arguments', () => {
        const result = validateIpcArguments('db:messages:toggle-active-state', []);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid UUID required');
      });

      it('should validate db:messages:update-active-state with valid UUID and updates object', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: true },
        ]);
        expect(result.valid).toBe(true);
      });

      it('should validate db:messages:update-active-state with false isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: false },
        ]);
        expect(result.valid).toBe(true);
      });

      it('should reject db:messages:update-active-state with invalid UUID', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          'not-a-uuid',
          { isActive: true },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid UUID and updates object required');
      });

      it('should reject db:messages:update-active-state with no arguments', () => {
        const result = validateIpcArguments('db:messages:update-active-state', []);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid UUID and updates object required');
      });

      it('should reject db:messages:update-active-state with only UUID', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid UUID and updates object required');
      });

      it('should reject db:messages:update-active-state with null updates object', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          null,
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid updates object required');
      });

      it('should reject db:messages:update-active-state with string updates object', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          'not-an-object',
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Valid updates object required');
      });

      it('should reject db:messages:update-active-state with updates object missing isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { otherField: 'value' },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Missing isActive field in updates object');
      });

      it('should reject db:messages:update-active-state with non-boolean isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: 'true' },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          "isActive cannot be a string representation of boolean ('true'/'false')",
        );
      });

      it('should reject db:messages:update-active-state with numeric isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: 1 },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('isActive cannot be a numeric representation of boolean (1/0)');
      });

      it('should reject db:messages:update-active-state with null isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: null },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('isActive cannot be null or undefined');
      });

      it('should reject db:messages:update-active-state with undefined isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: undefined },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('isActive cannot be null or undefined');
      });

      it('should reject db:messages:update-active-state with string "false"', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: 'false' },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          "isActive cannot be a string representation of boolean ('true'/'false')",
        );
      });

      it('should reject db:messages:update-active-state with number 0', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: 0 },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('isActive cannot be a numeric representation of boolean (1/0)');
      });

      it('should reject db:messages:update-active-state with object isActive', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: {} },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'isActive must be a boolean value (true or false), received: object',
        );
      });

      it('should reject db:messages:update-active-state with extra fields in updates object', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: true, extraField: 'value' },
        ]);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Updates object must only contain the "isActive" field');
      });

      it('should accept db:messages:update-active-state with only isActive field', () => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          '123e4567-e89b-12d3-a456-426614174000',
          { isActive: true },
        ]);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('IpcRateLimiter', () => {
    beforeEach(() => {
      ipcRateLimiter.reset();
    });

    it('should allow normal rate of calls', () => {
      for (let i = 0; i < 50; i++) {
        expect(ipcRateLimiter.isAllowed('test:channel')).toBe(true);
      }
    });

    it('should block excessive calls', () => {
      // Make 100 calls (the limit)
      for (let i = 0; i < 100; i++) {
        expect(ipcRateLimiter.isAllowed('test:channel')).toBe(true);
      }

      // The 101st call should be blocked
      expect(ipcRateLimiter.isAllowed('test:channel')).toBe(false);
    });

    it('should track different channels separately', () => {
      for (let i = 0; i < 100; i++) {
        expect(ipcRateLimiter.isAllowed('channel1')).toBe(true);
      }

      // channel1 should be blocked
      expect(ipcRateLimiter.isAllowed('channel1')).toBe(false);

      // channel2 should still be allowed
      expect(ipcRateLimiter.isAllowed('channel2')).toBe(true);
    });

    it('should reset rate limits', () => {
      for (let i = 0; i < 100; i++) {
        ipcRateLimiter.isAllowed('test:channel');
      }

      expect(ipcRateLimiter.isAllowed('test:channel')).toBe(false);

      ipcRateLimiter.reset();

      expect(ipcRateLimiter.isAllowed('test:channel')).toBe(true);
    });
  });
});
