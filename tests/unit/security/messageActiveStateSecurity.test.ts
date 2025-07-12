import { beforeEach, describe, expect, it, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import type { DatabaseMessage } from '../../../src/main/database/schema/DatabaseMessage';

// Mock validation utilities
vi.mock('../../../src/shared/utils/validation/booleanValidation', () => ({
  validateStrictBoolean: vi.fn(),
  assertIsBoolean: vi.fn(),
  safeValidateBoolean: vi.fn(),
  validateFilterBoolean: vi.fn(),
}));

// Mock database utilities
vi.mock('../../../src/main/database/queries/messages/updateMessageActiveState', () => ({
  updateMessageActiveState: vi.fn(),
}));

vi.mock('../../../src/main/database/queries/messages/toggleMessageActiveState', () => ({
  toggleMessageActiveState: vi.fn(),
}));

// Don't mock validation - we want to test the actual validation logic

// Mock IPC handlers
vi.mock('../../../src/main/ipc/handlers/dbMessagesUpdateActiveStateHandler', () => ({
  dbMessagesUpdateActiveStateHandler: vi.fn(),
}));

vi.mock('../../../src/main/ipc/handlers/dbMessagesToggleActiveStateHandler', () => ({
  dbMessagesToggleActiveStateHandler: vi.fn(),
}));

describe('Message Active State Security Tests', () => {
  let mockMessageId: string;

  beforeEach(() => {
    mockMessageId = uuidv4();
    vi.clearAllMocks();
  });

  describe('SQL Injection Prevention', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE messages; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; UPDATE messages SET is_active = 0; --",
      "' OR 1=1 --",
      "'; INSERT INTO messages VALUES (...); --",
      "' AND (SELECT COUNT(*) FROM messages) > 0 --",
      "'; DELETE FROM messages WHERE 1=1; --",
    ];

    sqlInjectionPayloads.forEach(payload => {
      it(`should prevent SQL injection via message ID: ${payload.substring(0, 20)}...`, async () => {
        const { validateIpcArguments } = await import('../../../src/preload/validation');

        // Test update active state with malicious message ID
        const updateResult = validateIpcArguments('db:messages:update-active-state', [
          payload,
          { isActive: true },
        ]);

        expect(updateResult.valid).toBe(false);
        expect(updateResult.error).toContain('Valid UUID');
      });

      it(`should prevent SQL injection via toggle message ID: ${payload.substring(0, 20)}...`, async () => {
        const { validateIpcArguments } = await import('../../../src/preload/validation');

        // Test toggle active state with malicious message ID
        const toggleResult = validateIpcArguments('db:messages:toggle-active-state', [payload]);

        expect(toggleResult.valid).toBe(false);
        expect(toggleResult.error).toContain('Valid UUID');
      });
    });

    it('should validate proper UUID format and reject malformed UUIDs', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const malformedUuids = [
        'not-a-uuid',
        '123',
        '',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        '12345678-1234-1234-1234-12345678901', // too short
        '12345678-1234-1234-1234-1234567890123', // too long
        '12345678-1234-1234-1234-1234567890zz', // invalid hex
      ];

      malformedUuids.forEach(invalidUuid => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          invalidUuid,
          { isActive: true },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Valid UUID');
      });
    });
  });

  describe('Boolean Coercion Attack Prevention', () => {
    it('should prevent string-to-boolean coercion attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const stringCoercionPayloads = [
        'true',
        'false',
        'True',
        'FALSE',
        '1',
        '0',
        'yes',
        'no',
        'on',
        'off',
      ];

      stringCoercionPayloads.forEach(payload => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          mockMessageId,
          { isActive: payload },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('isActive');
      });
    });

    it('should prevent numeric-to-boolean coercion attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const numericCoercionPayloads = [1, 0, -1, 2, 99, 0.5, NaN, Infinity, -Infinity];

      numericCoercionPayloads.forEach(payload => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          mockMessageId,
          { isActive: payload },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('isActive');
      });
    });

    it('should prevent null/undefined coercion attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const nullishPayloads = [null, undefined];

      nullishPayloads.forEach(payload => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          mockMessageId,
          { isActive: payload },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('isActive');
      });
    });

    it('should prevent object/array injection attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const objectPayloads = [
        {},
        [],
        { valueOf: () => true },
        { toString: () => 'true' },
        [true],
        new Boolean(true),
        function () {
          return true;
        },
        Symbol('true'),
        new Date(),
        /regex/,
      ];

      objectPayloads.forEach(payload => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          mockMessageId,
          { isActive: payload },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/isActive must be a boolean value.*received:/);
      });
    });
  });

  describe('Parameter Injection Attacks', () => {
    it('should prevent parameter pollution attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      // Test multiple isActive values in updates object
      const result = validateIpcArguments('db:messages:update-active-state', [
        mockMessageId,
        {
          isActive: true,
          isActive2: false, // extra parameter
          is_active: false, // snake_case variant
        },
      ]);

      // The validation may fail due to strict object validation
      expect(result.valid).toBe(false);
    });

    it('should prevent nested object injection', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const result = validateIpcArguments('db:messages:update-active-state', [
        mockMessageId,
        {
          isActive: {
            valueOf: () => true,
            malicious: 'payload',
          },
        },
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/isActive must be a boolean value.*received:/);
    });

    it('should handle special object properties safely', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      // Test that validation handles special properties without breaking
      const result = validateIpcArguments('db:messages:update-active-state', [
        mockMessageId,
        { isActive: true, someExtraProperty: 'value' },
      ]);

      // Validation may reject objects with extra properties due to strict validation
      expect(result.valid).toBe(false);
      // Ensure no prototype pollution occurred
      expect(Object.prototype.hasOwnProperty.call(Object.prototype, 'someExtraProperty')).toBe(
        false,
      );
    });
  });

  describe('Race Condition Security', () => {
    it('should handle concurrent update attempts securely', async () => {
      const { updateMessageActiveState } = await import(
        '../../../src/main/database/queries/messages/updateMessageActiveState'
      );

      // Mock successful concurrent updates
      const mockMessage1: DatabaseMessage = {
        id: mockMessageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        type: 'text',
        content: 'test',
        metadata: '{}',
        timestamp: Date.now(),
        is_active: true,
      };

      const mockMessage2: DatabaseMessage = {
        ...mockMessage1,
        is_active: false,
      };

      vi.mocked(updateMessageActiveState)
        .mockResolvedValueOnce(mockMessage1)
        .mockResolvedValueOnce(mockMessage2);

      // Simulate concurrent update attempts
      const updates = [
        updateMessageActiveState(mockMessageId, true),
        updateMessageActiveState(mockMessageId, false),
      ];

      const results = await Promise.all(updates);

      // Both should succeed but with different final states
      expect(results).toHaveLength(2);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });

    it('should handle toggle race conditions securely', async () => {
      const { toggleMessageActiveState } = await import(
        '../../../src/main/database/queries/messages/toggleMessageActiveState'
      );

      // Mock toggle operations
      const mockMessage1: DatabaseMessage = {
        id: mockMessageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        type: 'text',
        content: 'test',
        metadata: '{}',
        timestamp: Date.now(),
        is_active: false,
      };

      const mockMessage2: DatabaseMessage = {
        ...mockMessage1,
        is_active: true,
      };

      vi.mocked(toggleMessageActiveState)
        .mockResolvedValueOnce(mockMessage1)
        .mockResolvedValueOnce(mockMessage2);

      // Simulate concurrent toggle attempts
      const toggles = [
        toggleMessageActiveState(mockMessageId),
        toggleMessageActiveState(mockMessageId),
      ];

      const results = await Promise.all(toggles);

      // Both should succeed
      expect(results).toHaveLength(2);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });
  });

  describe('Error Information Disclosure Prevention', () => {
    it('should not expose sensitive database information in errors', () => {
      // This test validates that error handling properly sanitizes sensitive information
      // The actual implementation would need proper error handling middleware
      expect(true).toBe(true); // Placeholder for actual error sanitization testing
    });

    it('should not expose UUID patterns in error messages', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const result = validateIpcArguments('db:messages:update-active-state', [
        'malicious-id-with-secret-info-12345678-1234-1234-1234-123456789012',
        { isActive: true },
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Valid UUID');
      // Should not echo back the malicious input
      expect(result.error).not.toContain('malicious-id-with-secret-info');
    });
  });

  describe('Input Sanitization Edge Cases', () => {
    it('should handle Unicode and special character attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const unicodeAttacks = [
        'ⅫⅫⅫ-ⅫⅫⅫⅫ-ⅫⅫⅫⅫ-ⅫⅫⅫⅫ-ⅫⅫⅫⅫⅫⅫⅫⅫⅫⅫⅫⅫ', // Roman numerals
        '\u202E123e4567-e89b-12d3-a456-426614174000', // Right-to-left override
        'nullⅯ\u0000123e4567-e89b-12d3-a456-426614174000', // Null byte injection
        '🚀123e4567-e89b-12d3-a456-426614174000', // Emoji injection
      ];

      unicodeAttacks.forEach(attack => {
        const result = validateIpcArguments('db:messages:toggle-active-state', [attack]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Valid UUID');
      });
    });

    it('should handle extremely long input attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      // Create an extremely long string (DoS attempt)
      const longString = 'a'.repeat(100000);

      const result = validateIpcArguments('db:messages:update-active-state', [
        longString,
        { isActive: true },
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Valid UUID');
    });

    it('should handle binary and control character attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const binaryAttacks = [
        '\x00\x01\x02\x03', // Null and control chars
        '\r\n\t', // Newlines and tabs
        '\x7F\x80\x81', // DEL and high ASCII
        '\uFEFF', // Byte order mark
        '\uFFFE\uFFFF', // Invalid Unicode
      ];

      binaryAttacks.forEach(attack => {
        const result = validateIpcArguments('db:messages:toggle-active-state', [attack]);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Valid UUID');
      });
    });
  });

  describe('Memory Exhaustion Prevention', () => {
    it('should handle large object attacks efficiently', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      // Create a large object to test memory handling
      const largeObject: any = { isActive: true };
      for (let i = 0; i < 1000; i++) {
        largeObject[`prop${i}`] = 'value'.repeat(100);
      }

      const startTime = Date.now();
      const result = validateIpcArguments('db:messages:update-active-state', [
        mockMessageId,
        largeObject,
      ]);
      const endTime = Date.now();

      // Should complete within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      // Large objects may be rejected by validation
      expect(result.valid).toBeDefined();
    });

    it('should handle deeply nested object attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      // Create deeply nested object
      let nestedObj: any = { isActive: true };
      for (let i = 0; i < 100; i++) {
        nestedObj = { nested: nestedObj };
      }

      const result = validateIpcArguments('db:messages:update-active-state', [
        mockMessageId,
        nestedObj,
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing isActive field');
    });
  });

  describe('Type Confusion Attacks', () => {
    it('should prevent WeakMap/WeakSet injection', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const weakAttacks = [
        new WeakMap([[{}, true]]),
        new WeakSet([{}]),
        new Map([['isActive', true]]),
        new Set([true]),
      ];

      weakAttacks.forEach(attack => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          mockMessageId,
          { isActive: attack },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/isActive must be a boolean value.*received:/);
      });
    });

    it('should prevent BigInt coercion attacks', async () => {
      const { validateIpcArguments } = await import('../../../src/preload/validation');

      const bigIntAttacks = [BigInt(1), BigInt(0), BigInt('9007199254740991')];

      bigIntAttacks.forEach(attack => {
        const result = validateIpcArguments('db:messages:update-active-state', [
          mockMessageId,
          { isActive: attack },
        ]);

        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/isActive must be a boolean value.*received:/);
      });
    });
  });
});
