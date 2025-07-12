import { describe, it, expect } from 'vitest';
import { ServiceFactory } from '../../../../../src/renderer/services/ai/ServiceFactory';
import { AgentService } from '../../../../../src/renderer/services/ai/AgentService';
import { ConversationContextService } from '../../../../../src/renderer/services/ai/ConversationContextService';
import { MessageFormatterService } from '../../../../../src/renderer/services/ai/MessageFormatterService';

describe('ServiceFactory', () => {
  describe('createAgentService', () => {
    it('should create AgentService with proper dependencies', () => {
      const service = ServiceFactory.createAgentService();

      expect(service).toBeInstanceOf(AgentService);
      expect(service).toBeDefined();

      // Verify the service has the expected methods
      expect(typeof service.prepareAIContext).toBe('function');
      expect(typeof service.prepareAIContextForConversation).toBe('function');
      expect(typeof service.validateAIContext).toBe('function');
    });

    it('should create new instances on each call', () => {
      const service1 = ServiceFactory.createAgentService();
      const service2 = ServiceFactory.createAgentService();

      expect(service1).not.toBe(service2);
    });
  });

  describe('createConversationContextService', () => {
    it('should create ConversationContextService instance', () => {
      const service = ServiceFactory.createConversationContextService();

      expect(service).toBeInstanceOf(ConversationContextService);
      expect(service).toBeDefined();

      // Verify the service has the expected methods
      expect(typeof service.prepareAIContext).toBe('function');
      expect(typeof service.validateFilteredContext).toBe('function');
    });

    it('should create new instances on each call', () => {
      const service1 = ServiceFactory.createConversationContextService();
      const service2 = ServiceFactory.createConversationContextService();

      expect(service1).not.toBe(service2);
    });
  });

  describe('createMessageFormatterService', () => {
    it('should create MessageFormatterService instance', () => {
      const service = ServiceFactory.createMessageFormatterService();

      expect(service).toBeInstanceOf(MessageFormatterService);
      expect(service).toBeDefined();

      // Verify the service has the expected methods
      expect(typeof service.formatMessageForAI).toBe('function');
      expect(typeof service.createSystemMessage).toBe('function');
      expect(typeof service.prepareConversationContext).toBe('function');
    });

    it('should create new instances on each call', () => {
      const service1 = ServiceFactory.createMessageFormatterService();
      const service2 = ServiceFactory.createMessageFormatterService();

      expect(service1).not.toBe(service2);
    });
  });
});
