import { describe, it, expect } from 'vitest';
import {
  SystemInfoSchema,
  PlatformSchema,
  ArchSchema,
  VersionSchema,
  WindowStateSchema,
  ConfigValueSchema,
  ThemeSchema,
  AgentSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  MessageSchema,
  CreateMessageSchema,
  ConversationSchema,
  ConversationAgentSchema,
  DatabaseFilterSchema,
  AiProviderSchema,
  SetCredentialSchema,
  GetCredentialSchema,
  DeleteCredentialSchema,
  CredentialInfoSchema,
  IpcChannelSchema,
  IpcRequestSchema,
  IpcResponseSchema,
} from '../../../../src/shared/types/validation';

describe('Validation Schemas', () => {
  describe('System Schemas', () => {
    it('should validate SystemInfo correctly', () => {
      const validData = {
        platform: 'darwin',
        arch: 'arm64',
        version: '14.0.0',
        appVersion: '1.0.0',
        electronVersion: '37.2.0',
        chromeVersion: '110.0.0',
        nodeVersion: '18.0.0',
        memory: { used: 1024, total: 8192 },
      };

      expect(SystemInfoSchema.parse(validData)).toEqual(validData);
    });

    it('should validate platform string', () => {
      expect(PlatformSchema.parse('darwin')).toBe('darwin');
      expect(PlatformSchema.parse('win32')).toBe('win32');
    });

    it('should validate arch string', () => {
      expect(ArchSchema.parse('arm64')).toBe('arm64');
      expect(ArchSchema.parse('x64')).toBe('x64');
    });

    it('should validate version string', () => {
      expect(VersionSchema.parse('1.0.0')).toBe('1.0.0');
    });
  });

  describe('Configuration Schemas', () => {
    it('should validate WindowState correctly', () => {
      const validData = {
        width: 800,
        height: 600,
        x: 100,
        y: 100,
        isMaximized: false,
        isMinimized: false,
        isFullscreen: false,
      };

      expect(WindowStateSchema.parse(validData)).toEqual(validData);
    });

    it('should validate ConfigValue correctly', () => {
      const validData = {
        theme: 'dark' as const,
        windowState: {
          width: 800,
          height: 600,
          isMaximized: false,
          isMinimized: false,
          isFullscreen: false,
        },
        devTools: true,
        autoUpdater: true,
        telemetry: false,
      };

      expect(ConfigValueSchema.parse(validData)).toEqual(validData);
    });

    it('should validate theme values', () => {
      expect(ThemeSchema.parse('light')).toBe('light');
      expect(ThemeSchema.parse('dark')).toBe('dark');
      expect(ThemeSchema.parse('system')).toBe('system');
      expect(() => ThemeSchema.parse('invalid')).toThrow();
    });

    it('should reject invalid window dimensions', () => {
      expect(() =>
        WindowStateSchema.parse({
          width: 0,
          height: 600,
          isMaximized: false,
          isMinimized: false,
          isFullscreen: false,
        }),
      ).toThrow();
    });
  });

  describe('Database Schemas', () => {
    it('should validate Agent correctly', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Agent',
        role: 'Assistant',
        personality: 'Helpful and friendly',
        isActive: true,
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
      };

      expect(AgentSchema.parse(validData)).toEqual(validData);
    });

    it('should validate CreateAgent correctly', () => {
      const validData = {
        name: 'Test Agent',
        role: 'Assistant',
        personality: 'Helpful and friendly',
        isActive: true,
      };

      expect(CreateAgentSchema.parse(validData)).toEqual(validData);
    });

    it('should validate UpdateAgent correctly', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Agent',
        isActive: false,
      };

      expect(UpdateAgentSchema.parse(validData)).toEqual(validData);
    });

    it('should validate Message correctly', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        conversationId: '550e8400-e29b-41d4-a716-446655440001',
        agentId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Hello world',
        type: 'text',
        metadata: '{}',
        timestamp: 1640995200000,
      };

      expect(MessageSchema.parse(validData)).toEqual(validData);
    });

    it('should validate CreateMessage correctly', () => {
      const validData = {
        conversationId: '550e8400-e29b-41d4-a716-446655440001',
        agentId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Hello world',
        type: 'text',
      };

      expect(CreateMessageSchema.parse(validData)).toEqual({
        ...validData,
        isActive: true,
        metadata: '{}',
      });
    });

    it('should validate Conversation correctly', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Conversation',
        description: 'A test conversation',
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
        isActive: true,
      };

      expect(ConversationSchema.parse(validData)).toEqual(validData);
    });

    it('should validate ConversationAgent correctly', () => {
      const validData = {
        conversationId: '550e8400-e29b-41d4-a716-446655440001',
        agentId: '550e8400-e29b-41d4-a716-446655440002',
      };

      expect(ConversationAgentSchema.parse(validData)).toEqual(validData);
    });

    it('should validate DatabaseFilter correctly', () => {
      const validData = {
        limit: 10,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        where: { isActive: true },
      };

      expect(DatabaseFilterSchema.parse(validData)).toEqual(validData);
    });

    it('should reject invalid UUID format', () => {
      expect(() =>
        AgentSchema.parse({
          id: 'invalid-uuid',
          name: 'Test Agent',
          role: 'Assistant',
          personality: 'Helpful',
          isActive: true,
          createdAt: 1640995200000,
          updatedAt: 1640995200000,
        }),
      ).toThrow();
    });
  });

  describe('Secure Storage Schemas', () => {
    it('should validate AI provider types', () => {
      expect(AiProviderSchema.parse('openai')).toBe('openai');
      expect(AiProviderSchema.parse('anthropic')).toBe('anthropic');
      expect(AiProviderSchema.parse('google')).toBe('google');
      expect(() => AiProviderSchema.parse('invalid')).toThrow();
    });

    it('should validate SetCredential correctly', () => {
      const validData = {
        provider: 'openai' as const,
        apiKey: 'sk-test-key',
        metadata: { model: 'gpt-4' },
      };

      expect(SetCredentialSchema.parse(validData)).toEqual(validData);
    });

    it('should validate GetCredential correctly', () => {
      const validData = { provider: 'openai' as const };
      expect(GetCredentialSchema.parse(validData)).toEqual(validData);
    });

    it('should validate DeleteCredential correctly', () => {
      const validData = { provider: 'openai' as const };
      expect(DeleteCredentialSchema.parse(validData)).toEqual(validData);
    });

    it('should validate CredentialInfo correctly', () => {
      const validData = {
        provider: 'openai' as const,
        hasApiKey: true,
        lastUpdated: 1640995200000,
        metadata: { model: 'gpt-4' },
      };

      expect(CredentialInfoSchema.parse(validData)).toEqual(validData);
    });

    it('should reject empty API key', () => {
      expect(() =>
        SetCredentialSchema.parse({
          provider: 'openai',
          apiKey: '',
        }),
      ).toThrow();
    });
  });

  describe('IPC Schemas', () => {
    it('should validate IPC channel names', () => {
      expect(IpcChannelSchema.parse('window:minimize')).toBe('window:minimize');
      expect(IpcChannelSchema.parse('db:agents:list')).toBe('db:agents:list');
      expect(IpcChannelSchema.parse('secure:credentials:get')).toBe('secure:credentials:get');
      expect(() => IpcChannelSchema.parse('invalid:channel')).toThrow();
    });

    it('should validate IPC request correctly', () => {
      const validData = {
        channel: 'window:minimize' as const,
        data: { test: 'data' },
        requestId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(IpcRequestSchema.parse(validData)).toEqual(validData);
    });

    it('should validate IPC response correctly', () => {
      const validData = {
        success: true,
        data: { result: 'success' },
        requestId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(IpcResponseSchema.parse(validData)).toEqual(validData);
    });

    it('should validate IPC error response correctly', () => {
      const validData = {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error',
          details: { info: 'additional info' },
        },
        requestId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(IpcResponseSchema.parse(validData)).toEqual(validData);
    });
  });
});
