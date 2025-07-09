import { describe, it, expect } from 'vitest';
import {
  BaseError,
  IpcError,
  IpcValidationError,
  DatabaseError,
  SecureStorageError,
} from '../../../../src/shared/types/errors';

describe('Error Classes', () => {
  describe('BaseError', () => {
    it('should create a base error with all properties', () => {
      const error = new BaseError('Test message', 'TEST_ERROR', { detail: 'test' });

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('BaseError');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.timestamp).toBeTypeOf('number');
      expect(error.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should create a base error without details', () => {
      const error = new BaseError('Test message', 'TEST_ERROR');

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toBeUndefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new BaseError('Test message', 'TEST_ERROR', { detail: 'test' });
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'BaseError',
        message: 'Test message',
        code: 'TEST_ERROR',
        timestamp: error.timestamp,
        details: { detail: 'test' },
        stack: error.stack,
      });
    });
  });

  describe('IpcError', () => {
    it('should create an IPC error with channel and operation', () => {
      const error = new IpcError('IPC failed', 'test:channel', 'get');

      expect(error.message).toBe('IPC failed');
      expect(error.code).toBe('IPC_ERROR');
      expect(error.channel).toBe('test:channel');
      expect(error.operation).toBe('get');
    });

    it('should create an IPC error without channel and operation', () => {
      const error = new IpcError('IPC failed');

      expect(error.message).toBe('IPC failed');
      expect(error.code).toBe('IPC_ERROR');
      expect(error.channel).toBeUndefined();
      expect(error.operation).toBeUndefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new IpcError('IPC failed', 'test:channel', 'get');
      const json = error.toJSON();

      expect(json.channel).toBe('test:channel');
      expect(json.operation).toBe('get');
    });
  });

  describe('IpcValidationError', () => {
    it('should create a validation error with field and value', () => {
      const error = new IpcValidationError('Invalid input', 'testField', 'invalid-value');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('IPC_VALIDATION_ERROR');
      expect(error.field).toBe('testField');
      expect(error.value).toBe('invalid-value');
    });

    it('should create a validation error without field and value', () => {
      const error = new IpcValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('IPC_VALIDATION_ERROR');
      expect(error.field).toBeUndefined();
      expect(error.value).toBeUndefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new IpcValidationError('Invalid input', 'testField', 'invalid-value');
      const json = error.toJSON();

      expect(json.field).toBe('testField');
      expect(json.value).toBe('invalid-value');
    });
  });

  describe('DatabaseError', () => {
    it('should create a database error with all properties', () => {
      const error = new DatabaseError('Query failed', 'SELECT', 'users', 'SELECT * FROM users');

      expect(error.message).toBe('Query failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.operation).toBe('SELECT');
      expect(error.table).toBe('users');
      expect(error.query).toBe('SELECT * FROM users');
    });

    it('should create a database error without optional properties', () => {
      const error = new DatabaseError('Query failed');

      expect(error.message).toBe('Query failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.operation).toBeUndefined();
      expect(error.table).toBeUndefined();
      expect(error.query).toBeUndefined();
    });

    it('should serialize to JSON correctly in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new DatabaseError('Query failed', 'SELECT', 'users', 'SELECT * FROM users');
      const json = error.toJSON();

      expect(json.operation).toBe('SELECT');
      expect(json.table).toBe('users');
      expect(json.query).toBe('SELECT * FROM users');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include query in JSON in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new DatabaseError('Query failed', 'SELECT', 'users', 'SELECT * FROM users');
      const json = error.toJSON();

      expect(json.operation).toBe('SELECT');
      expect(json.table).toBe('users');
      expect(json.query).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('SecureStorageError', () => {
    it('should create a secure storage error with operation and service', () => {
      const error = new SecureStorageError('Storage failed', 'get', 'keytar');

      expect(error.message).toBe('Storage failed');
      expect(error.code).toBe('SECURE_STORAGE_ERROR');
      expect(error.operation).toBe('get');
      expect(error.service).toBe('keytar');
    });

    it('should create a secure storage error without operation and service', () => {
      const error = new SecureStorageError('Storage failed');

      expect(error.message).toBe('Storage failed');
      expect(error.code).toBe('SECURE_STORAGE_ERROR');
      expect(error.operation).toBeUndefined();
      expect(error.service).toBeUndefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new SecureStorageError('Storage failed', 'get', 'keytar');
      const json = error.toJSON();

      expect(json.operation).toBe('get');
      expect(json.service).toBe('keytar');
    });
  });
});
