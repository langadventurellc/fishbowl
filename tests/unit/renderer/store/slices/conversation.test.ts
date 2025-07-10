/**
 * Comprehensive tests for conversation slice functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStore } from '../../../../../src/renderer/store';
import type { Conversation } from '../../../../../src/renderer/store/types';

// Mock window.electronAPI for testing
Object.defineProperty(window, 'electronAPI', {
  value: {
    windowControls: {
      minimize: vi.fn(),
      maximize: vi.fn(),
      close: vi.fn(),
    },
  },
  writable: true,
});

describe('Conversation Slice', () => {
  let store: typeof useStore;

  // Mock conversation data
  const mockConversation1: Conversation = {
    id: 'conv-1',
    name: 'Test Conversation 1',
    description: 'A test conversation',
    createdAt: 1672531200000, // 2023-01-01
    updatedAt: 1672531200000,
    isActive: true,
  };

  const mockConversation2: Conversation = {
    id: 'conv-2',
    name: 'Test Conversation 2',
    description: 'Another test conversation',
    createdAt: 1672531300000, // 2023-01-01 + 100s
    updatedAt: 1672531300000,
    isActive: true,
  };

  const mockConversations = [mockConversation1, mockConversation2];

  beforeEach(() => {
    // Use the existing store and reset it for each test
    store = useStore;
    // Reset conversation state for each test
    store.getState().setConversations([]);
    store.getState().setActiveConversation(null);
    store.getState().setLoading(false);
    store.getState().setError(null);
  });

  describe('Initial State', () => {
    it('should initialize with default conversation state', () => {
      const state = store.getState();

      expect(state.conversations).toEqual([]);
      expect(state.activeConversationId).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should have all required conversation actions', () => {
      const state = store.getState();

      expect(typeof state.setConversations).toBe('function');
      expect(typeof state.addConversation).toBe('function');
      expect(typeof state.updateConversation).toBe('function');
      expect(typeof state.removeConversation).toBe('function');
      expect(typeof state.setActiveConversation).toBe('function');
      expect(typeof state.setLoading).toBe('function');
      expect(typeof state.setError).toBe('function');
    });
  });

  describe('Conversation List Management', () => {
    it('should set conversations list', () => {
      store.getState().setConversations(mockConversations);

      const state = store.getState();
      expect(state.conversations).toEqual(mockConversations);
      expect(state.error).toBeNull();
    });

    it('should clear conversations list when setting empty array', () => {
      // First add some conversations
      store.getState().setConversations(mockConversations);
      expect(store.getState().conversations).toHaveLength(2);

      // Then clear them
      store.getState().setConversations([]);
      expect(store.getState().conversations).toEqual([]);
    });

    it('should clear error when setting conversations', () => {
      // Set an error first
      store.getState().setError('Some error');
      expect(store.getState().error).toBe('Some error');

      // Setting conversations should clear the error
      store.getState().setConversations(mockConversations);
      expect(store.getState().error).toBeNull();
    });
  });

  describe('Add Conversation', () => {
    it('should add new conversation to the beginning of the list', () => {
      store.getState().addConversation(mockConversation1);

      const state = store.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0]).toEqual(mockConversation1);
      expect(state.error).toBeNull();
    });

    it('should add multiple conversations to the beginning', () => {
      store.getState().addConversation(mockConversation1);
      store.getState().addConversation(mockConversation2);

      const state = store.getState();
      expect(state.conversations).toHaveLength(2);
      expect(state.conversations[0]).toEqual(mockConversation2); // Most recent first
      expect(state.conversations[1]).toEqual(mockConversation1);
    });

    it('should update existing conversation instead of duplicating', () => {
      // Add initial conversation
      store.getState().addConversation(mockConversation1);
      expect(store.getState().conversations).toHaveLength(1);

      // Add same conversation with updated data
      const updatedConversation = {
        ...mockConversation1,
        name: 'Updated Name',
        updatedAt: Date.now(),
      };
      store.getState().addConversation(updatedConversation);

      const state = store.getState();
      expect(state.conversations).toHaveLength(1); // Still only one
      expect(state.conversations[0].name).toBe('Updated Name');
    });

    it('should clear error when adding conversation', () => {
      store.getState().setError('Some error');
      expect(store.getState().error).toBe('Some error');

      store.getState().addConversation(mockConversation1);
      expect(store.getState().error).toBeNull();
    });
  });

  describe('Update Conversation', () => {
    beforeEach(() => {
      store.getState().setConversations(mockConversations);
    });

    it('should update existing conversation', () => {
      const updates = { name: 'Updated Name' };
      store.getState().updateConversation('conv-1', updates);

      const state = store.getState();
      const updatedConversation = state.conversations.find((c: Conversation) => c.id === 'conv-1');
      expect(updatedConversation?.name).toBe('Updated Name');
      expect(updatedConversation?.updatedAt).toBeGreaterThan(mockConversation1.updatedAt);
      expect(state.error).toBeNull();
    });

    it('should update conversation description', () => {
      const updates = { description: 'Updated description' };
      store.getState().updateConversation('conv-1', updates);

      const state = store.getState();
      const updatedConversation = state.conversations.find((c: Conversation) => c.id === 'conv-1');
      expect(updatedConversation?.description).toBe('Updated description');
    });

    it('should update multiple fields at once', () => {
      const updates = {
        name: 'New Name',
        description: 'New Description',
        isActive: false,
      };
      store.getState().updateConversation('conv-1', updates);

      const state = store.getState();
      const updatedConversation = state.conversations.find((c: Conversation) => c.id === 'conv-1');
      expect(updatedConversation?.name).toBe('New Name');
      expect(updatedConversation?.description).toBe('New Description');
      expect(updatedConversation?.isActive).toBe(false);
    });

    it('should preserve other fields when updating', () => {
      const originalCreatedAt = mockConversation1.createdAt;
      const updates = { name: 'New Name' };
      store.getState().updateConversation('conv-1', updates);

      const state = store.getState();
      const updatedConversation = state.conversations.find((c: Conversation) => c.id === 'conv-1');
      expect(updatedConversation?.createdAt).toBe(originalCreatedAt);
      expect(updatedConversation?.id).toBe('conv-1');
    });

    it('should set error when trying to update non-existent conversation', () => {
      store.getState().updateConversation('non-existent', { name: 'Updated' });

      const state = store.getState();
      expect(state.error).toBe('Conversation with ID non-existent not found');
    });

    it('should clear error on successful update', () => {
      store.getState().setError('Previous error');
      store.getState().updateConversation('conv-1', { name: 'Updated' });

      expect(store.getState().error).toBeNull();
    });
  });

  describe('Remove Conversation', () => {
    beforeEach(() => {
      store.getState().setConversations(mockConversations);
    });

    it('should remove existing conversation', () => {
      store.getState().removeConversation('conv-1');

      const state = store.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0].id).toBe('conv-2');
      expect(state.error).toBeNull();
    });

    it('should remove all conversations when removing the last one', () => {
      store.getState().removeConversation('conv-1');
      store.getState().removeConversation('conv-2');

      const state = store.getState();
      expect(state.conversations).toHaveLength(0);
    });

    it('should clear active conversation when removing active conversation', () => {
      // Set active conversation
      store.getState().setActiveConversation('conv-1');
      expect(store.getState().activeConversationId).toBe('conv-1');

      // Remove active conversation
      store.getState().removeConversation('conv-1');

      const state = store.getState();
      expect(state.activeConversationId).toBeNull();
      expect(state.conversations.find((c: Conversation) => c.id === 'conv-1')).toBeUndefined();
    });

    it('should not affect active conversation when removing different conversation', () => {
      store.getState().setActiveConversation('conv-1');
      store.getState().removeConversation('conv-2');

      const state = store.getState();
      expect(state.activeConversationId).toBe('conv-1');
    });

    it('should set error when trying to remove non-existent conversation', () => {
      store.getState().removeConversation('non-existent');

      const state = store.getState();
      expect(state.error).toBe('Conversation with ID non-existent not found');
      expect(state.conversations).toHaveLength(2); // Unchanged
    });

    it('should clear error on successful removal', () => {
      store.getState().setError('Previous error');
      store.getState().removeConversation('conv-1');

      expect(store.getState().error).toBeNull();
    });
  });

  describe('Active Conversation Management', () => {
    beforeEach(() => {
      store.getState().setConversations(mockConversations);
    });

    it('should set active conversation', () => {
      store.getState().setActiveConversation('conv-1');

      const state = store.getState();
      expect(state.activeConversationId).toBe('conv-1');
      expect(state.error).toBeNull();
    });

    it('should clear active conversation by setting null', () => {
      store.getState().setActiveConversation('conv-1');
      expect(store.getState().activeConversationId).toBe('conv-1');

      store.getState().setActiveConversation(null);
      expect(store.getState().activeConversationId).toBeNull();
    });

    it('should validate conversation exists when setting active', () => {
      store.getState().setActiveConversation('non-existent');

      const state = store.getState();
      expect(state.activeConversationId).toBeNull();
      expect(state.error).toBe('Conversation with ID non-existent not found');
    });

    it('should switch between active conversations', () => {
      store.getState().setActiveConversation('conv-1');
      expect(store.getState().activeConversationId).toBe('conv-1');

      store.getState().setActiveConversation('conv-2');
      expect(store.getState().activeConversationId).toBe('conv-2');
    });

    it('should clear error when successfully setting active conversation', () => {
      store.getState().setError('Previous error');
      store.getState().setActiveConversation('conv-1');

      expect(store.getState().error).toBeNull();
    });

    it('should clear error when setting active conversation to null', () => {
      store.getState().setError('Previous error');
      store.getState().setActiveConversation(null);

      expect(store.getState().error).toBeNull();
    });
  });

  describe('Loading State Management', () => {
    it('should set loading state to true', () => {
      store.getState().setLoading(true);
      expect(store.getState().loading).toBe(true);
    });

    it('should set loading state to false', () => {
      store.getState().setLoading(true);
      store.getState().setLoading(false);
      expect(store.getState().loading).toBe(false);
    });

    it('should toggle loading state', () => {
      expect(store.getState().loading).toBe(false);

      store.getState().setLoading(true);
      expect(store.getState().loading).toBe(true);

      store.getState().setLoading(false);
      expect(store.getState().loading).toBe(false);
    });
  });

  describe('Error State Management', () => {
    it('should set error message', () => {
      const errorMessage = 'Something went wrong';
      store.getState().setError(errorMessage);
      expect(store.getState().error).toBe(errorMessage);
    });

    it('should clear error by setting null', () => {
      store.getState().setError('Some error');
      expect(store.getState().error).toBe('Some error');

      store.getState().setError(null);
      expect(store.getState().error).toBeNull();
    });

    it('should overwrite existing error', () => {
      store.getState().setError('First error');
      store.getState().setError('Second error');
      expect(store.getState().error).toBe('Second error');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle rapid conversation additions', () => {
      for (let i = 0; i < 100; i++) {
        store.getState().addConversation({
          id: `conv-${i}`,
          name: `Conversation ${i}`,
          description: `Description ${i}`,
          createdAt: Date.now() + i,
          updatedAt: Date.now() + i,
          isActive: true,
        });
      }

      expect(store.getState().conversations).toHaveLength(100);
    });

    it('should handle empty updates gracefully', () => {
      store.getState().setConversations(mockConversations);
      store.getState().updateConversation('conv-1', {});

      const state = store.getState();
      const conversation = state.conversations.find((c: Conversation) => c.id === 'conv-1');
      expect(conversation?.name).toBe(mockConversation1.name); // Unchanged
      expect(conversation?.updatedAt).toBeGreaterThan(mockConversation1.updatedAt); // Timestamp updated
    });

    it('should handle setting active conversation multiple times', () => {
      store.getState().setConversations(mockConversations);

      // Rapid switching
      store.getState().setActiveConversation('conv-1');
      store.getState().setActiveConversation('conv-2');
      store.getState().setActiveConversation('conv-1');
      store.getState().setActiveConversation(null);

      expect(store.getState().activeConversationId).toBeNull();
      expect(store.getState().error).toBeNull();
    });

    it('should handle concurrent state updates', () => {
      store.getState().setConversations(mockConversations);

      // Simulate concurrent updates
      store.getState().setLoading(true);
      store.getState().setActiveConversation('conv-1');
      store.getState().updateConversation('conv-1', { name: 'Updated' });
      store.getState().setError('Some error');
      store.getState().setLoading(false);

      const state = store.getState();
      expect(state.loading).toBe(false);
      expect(state.activeConversationId).toBe('conv-1');
      expect(state.conversations.find((c: Conversation) => c.id === 'conv-1')?.name).toBe(
        'Updated',
      );
      expect(state.error).toBe('Some error');
    });
  });
});
