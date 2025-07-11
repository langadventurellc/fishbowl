import { describe, it, expect } from 'vitest';
import { getActiveMessagesForAI } from '../../../../../src/shared/utils/ai/getActiveMessagesForAI';
import type { Message } from '../../../../../src/shared/types';

describe('getActiveMessagesForAI', () => {
  // Helper function to create test messages
  const createTestMessage = (id: string, isActive: boolean, timestamp: number): Message => ({
    id,
    conversationId: '123e4567-e89b-12d3-a456-426614174000',
    agentId: '456e7890-e89b-12d3-a456-426614174000',
    isActive,
    content: `Test message ${id}`,
    type: 'text',
    metadata: '{}',
    timestamp,
  });

  it('should return only active messages', () => {
    const messages: Message[] = [
      createTestMessage('1', true, 1000),
      createTestMessage('2', false, 2000),
      createTestMessage('3', true, 3000),
      createTestMessage('4', false, 4000),
    ];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
    expect(result.every(msg => msg.isActive)).toBe(true);
  });

  it('should return messages sorted by timestamp in ascending order', () => {
    const messages: Message[] = [
      createTestMessage('1', true, 3000),
      createTestMessage('2', true, 1000),
      createTestMessage('3', true, 2000),
    ];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(1000);
    expect(result[1].timestamp).toBe(2000);
    expect(result[2].timestamp).toBe(3000);
  });

  it('should return empty array when no messages are active', () => {
    const messages: Message[] = [
      createTestMessage('1', false, 1000),
      createTestMessage('2', false, 2000),
      createTestMessage('3', false, 3000),
    ];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return all messages when all are active', () => {
    const messages: Message[] = [
      createTestMessage('1', true, 1000),
      createTestMessage('2', true, 2000),
      createTestMessage('3', true, 3000),
    ];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(3);
    expect(result.every(msg => msg.isActive)).toBe(true);
  });

  it('should handle empty array input', () => {
    const result = getActiveMessagesForAI([]);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should throw error for non-array input', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      getActiveMessagesForAI(null as any);
    }).toThrow('Messages must be an array');

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      getActiveMessagesForAI(undefined as any);
    }).toThrow('Messages must be an array');

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      getActiveMessagesForAI('not an array' as any);
    }).toThrow('Messages must be an array');
  });

  it('should maintain all message properties in the result', () => {
    const originalMessage = createTestMessage('1', true, 1000);
    const messages: Message[] = [originalMessage];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(originalMessage);
    expect(result[0].id).toBe('1');
    expect(result[0].conversationId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(result[0].agentId).toBe('456e7890-e89b-12d3-a456-426614174000');
    expect(result[0].content).toBe('Test message 1');
    expect(result[0].type).toBe('text');
    expect(result[0].metadata).toBe('{}');
    expect(result[0].timestamp).toBe(1000);
  });

  it('should handle messages with same timestamp', () => {
    const messages: Message[] = [
      createTestMessage('1', true, 1000),
      createTestMessage('2', true, 1000),
      createTestMessage('3', true, 1000),
    ];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(3);
    expect(result.every(msg => msg.timestamp === 1000)).toBe(true);
  });

  it('should handle mixed active/inactive messages with various timestamps', () => {
    const messages: Message[] = [
      createTestMessage('1', false, 5000),
      createTestMessage('2', true, 3000),
      createTestMessage('3', false, 1000),
      createTestMessage('4', true, 2000),
      createTestMessage('5', true, 4000),
      createTestMessage('6', false, 6000),
    ];

    const result = getActiveMessagesForAI(messages);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('4'); // timestamp 2000
    expect(result[1].id).toBe('2'); // timestamp 3000
    expect(result[2].id).toBe('5'); // timestamp 4000
    expect(result.every(msg => msg.isActive)).toBe(true);
  });

  it('should not modify the original messages array', () => {
    const messages: Message[] = [
      createTestMessage('1', true, 3000),
      createTestMessage('2', false, 1000),
      createTestMessage('3', true, 2000),
    ];
    const originalLength = messages.length;
    const originalFirstMessage = messages[0];

    const result = getActiveMessagesForAI(messages);

    // Original array should be unchanged
    expect(messages).toHaveLength(originalLength);
    expect(messages[0]).toBe(originalFirstMessage);

    // Result should be a different array
    expect(result).not.toBe(messages);
    expect(result).toHaveLength(2);
  });
});
