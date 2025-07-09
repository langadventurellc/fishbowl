import { app, ipcMain, BrowserWindow } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { arch, platform, version } from 'os';
import type {
  SystemInfo,
  ConfigKey,
  ConfigValue,
  AiProvider,
  CredentialInfo,
  Agent,
  Conversation,
  Message,
  ConversationAgent,
  DatabaseFilter,
  CreateAgentData,
  UpdateAgentData,
  CreateConversationData,
  UpdateConversationData,
  CreateMessageData,
} from '../../shared/types';
import { credentialManager } from '../secure-storage';
import { SecureStorageError, DatabaseError } from '../../shared/types/errors';
import { DatabaseErrorHandler } from './error-handler';
import {
  UuidSchema,
  UuidArraySchema,
  SanitizedCreateAgentSchema,
  SanitizedUpdateAgentSchema,
  SanitizedCreateConversationSchema,
  SanitizedUpdateConversationSchema,
  SanitizedCreateMessageSchema,
} from '../../shared/types/validation';
import {
  getActiveAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentsByConversationId,
  getActiveConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessageById,
  getMessagesByConversationId,
  createMessage,
  deleteMessage,
} from '../database/queries';
import { transactionManager } from '../database/transactions';
import { v4 as uuidv4 } from 'uuid';

// Configuration file path
const CONFIG_FILE = join(app.getPath('userData'), 'config.json');

// Default configuration
const DEFAULT_CONFIG: ConfigValue = {
  theme: 'system',
  windowState: {
    width: 1200,
    height: 800,
    isMaximized: false,
    isMinimized: false,
    isFullscreen: false,
  },
  devTools: app.isPackaged ? false : true,
  autoUpdater: true,
  telemetry: false,
};

// In-memory config cache
let configCache: ConfigValue = { ...DEFAULT_CONFIG };

// Load configuration from file
const loadConfig = (): ConfigValue => {
  try {
    if (existsSync(CONFIG_FILE)) {
      const configData = readFileSync(CONFIG_FILE, 'utf8');
      const parsedConfig = JSON.parse(configData);
      configCache = { ...DEFAULT_CONFIG, ...parsedConfig };
    }
  } catch (error) {
    console.error('Failed to load config:', error);
    configCache = { ...DEFAULT_CONFIG };
  }
  return configCache;
};

// Save configuration to file
const saveConfig = (config: ConfigValue): void => {
  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    configCache = config;
  } catch (error) {
    console.error('Failed to save config:', error);
  }
};

// Initialize config
loadConfig();

/**
 * Set up IPC handlers for main process communication
 */
export const setupIpcHandlers = (): void => {
  // Window controls
  ipcMain.handle('window:minimize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.minimize();
    }
  });

  ipcMain.handle('window:maximize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.handle('window:close', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.close();
    }
  });

  // Application info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // System information
  ipcMain.handle('system:getInfo', (): SystemInfo => {
    const memoryUsage = process.memoryUsage();

    return {
      platform: platform(),
      arch: arch(),
      version: version(),
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
      },
    };
  });

  ipcMain.handle('system:platform', () => {
    return platform();
  });

  ipcMain.handle('system:arch', () => {
    return arch();
  });

  ipcMain.handle('system:version', () => {
    return version();
  });

  // Configuration management
  ipcMain.handle('config:get', (_event, key: ConfigKey): ConfigValue[ConfigKey] => {
    return configCache[key];
  });

  ipcMain.handle('config:set', (_event, key: ConfigKey, value: ConfigValue[ConfigKey]): void => {
    const newConfig = { ...configCache, [key]: value };
    saveConfig(newConfig);
  });

  // Theme management
  ipcMain.handle('theme:get', () => {
    return configCache.theme;
  });

  ipcMain.handle('theme:set', (_event, theme: 'light' | 'dark' | 'system') => {
    const newConfig = { ...configCache, theme };
    saveConfig(newConfig);

    // Broadcast theme change to all windows
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('theme:change', theme);
    });
  });

  // Development tools
  ipcMain.handle('dev:isDev', () => {
    return !app.isPackaged;
  });

  ipcMain.handle('dev:openDevTools', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.openDevTools();
    }
  });

  ipcMain.handle('dev:closeDevTools', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.closeDevTools();
    }
  });

  // Secure storage handlers
  ipcMain.handle(
    'secure:credentials:get',
    async (_event, provider: AiProvider): Promise<CredentialInfo | null> => {
      try {
        return await credentialManager.getCredential(provider);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to get credentials for provider ${provider}`,
          'getCredentials',
          'secure:credentials',
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:credentials:set',
    async (
      _event,
      provider: AiProvider,
      apiKey: string,
      metadata?: Record<string, unknown>,
    ): Promise<void> => {
      try {
        await credentialManager.setCredential(provider, apiKey, metadata);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to set credentials for provider ${provider}`,
          'setCredentials',
          'secure:credentials',
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:credentials:delete',
    async (_event, provider: AiProvider): Promise<void> => {
      try {
        await credentialManager.deleteCredential(provider);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to delete credentials for provider ${provider}`,
          'deleteCredentials',
          'secure:credentials',
          error,
        );
      }
    },
  );

  ipcMain.handle('secure:credentials:list', async (): Promise<CredentialInfo[]> => {
    try {
      return await credentialManager.listCredentials();
    } catch (error) {
      throw new SecureStorageError(
        'Failed to list credentials',
        'listCredentials',
        'secure:credentials',
        error,
      );
    }
  });

  ipcMain.handle(
    'secure:keytar:get',
    async (_event, service: string, account: string): Promise<string | null> => {
      try {
        return await credentialManager.storage.get(service, account);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to get keytar value for ${service}:${account}`,
          'get',
          service,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:keytar:set',
    async (_event, service: string, account: string, password: string): Promise<void> => {
      try {
        await credentialManager.storage.set(service, account, password);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to set keytar value for ${service}:${account}`,
          'set',
          service,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:keytar:delete',
    async (_event, service: string, account: string): Promise<void> => {
      try {
        await credentialManager.storage.delete(service, account);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to delete keytar value for ${service}:${account}`,
          'delete',
          service,
          error,
        );
      }
    },
  );

  // Database IPC handlers

  // Agent operations
  ipcMain.handle('db:agents:list', (_event, _filter?: DatabaseFilter): Agent[] => {
    try {
      const agents = getActiveAgents();
      return agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        isActive: agent.is_active,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at,
      }));
    } catch (error) {
      throw new DatabaseError('Failed to list agents', 'list', 'agents', undefined, error);
    }
  });

  ipcMain.handle('db:agents:get', (_event, id: string): Agent | null => {
    try {
      const validatedId = UuidSchema.parse(id);
      const agent = getAgentById(validatedId);
      if (!agent) return null;
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        isActive: agent.is_active,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to get agent with ID ${id}`,
        'get',
        'agents',
        undefined,
        error,
      );
    }
  });

  ipcMain.handle('db:agents:create', async (_event, agentData: CreateAgentData): Promise<Agent> => {
    const context = {
      operation: 'create',
      table: 'agents',
      timestamp: Date.now(),
    };

    try {
      return await DatabaseErrorHandler.executeWithRetry(() => {
        const validatedData = SanitizedCreateAgentSchema.parse(agentData);
        const agent = createAgent({
          id: uuidv4(),
          name: validatedData.name,
          role: validatedData.role,
          personality: validatedData.personality,
          is_active: validatedData.isActive,
        });
        return {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          personality: agent.personality,
          isActive: agent.is_active,
          createdAt: agent.created_at,
          updatedAt: agent.updated_at,
        };
      }, context);
    } catch (error) {
      DatabaseErrorHandler.handleDatabaseError(error, context);
    }
  });

  ipcMain.handle('db:agents:update', (_event, id: string, updates: UpdateAgentData): Agent => {
    try {
      const validatedUpdates = SanitizedUpdateAgentSchema.parse({ id, ...updates });
      const agent = updateAgent(validatedUpdates.id, {
        name: validatedUpdates.name,
        role: validatedUpdates.role,
        personality: validatedUpdates.personality,
        is_active: validatedUpdates.isActive,
      });
      if (!agent) {
        throw new DatabaseError(
          `Agent with ID ${id} not found`,
          'update',
          'agents',
          undefined,
          new Error('Agent not found'),
        );
      }
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        isActive: agent.is_active,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to update agent with ID ${id}`,
        'update',
        'agents',
        undefined,
        error,
      );
    }
  });

  ipcMain.handle('db:agents:delete', (_event, id: string): void => {
    try {
      const validatedId = UuidSchema.parse(id);
      deleteAgent(validatedId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete agent with ID ${id}`,
        'delete',
        'agents',
        undefined,
        error,
      );
    }
  });

  // Conversation operations
  ipcMain.handle('db:conversations:list', (_event, _filter?: DatabaseFilter): Conversation[] => {
    try {
      const conversations = getActiveConversations();
      return conversations.map(conversation => ({
        id: conversation.id,
        name: conversation.name,
        description: conversation.description,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        isActive: conversation.is_active,
      }));
    } catch (error) {
      throw new DatabaseError(
        'Failed to list conversations',
        'list',
        'conversations',
        undefined,
        error,
      );
    }
  });

  ipcMain.handle('db:conversations:get', (_event, id: string): Conversation | null => {
    try {
      const validatedId = UuidSchema.parse(id);
      const conversation = getConversationById(validatedId);
      if (!conversation) return null;
      return {
        id: conversation.id,
        name: conversation.name,
        description: conversation.description,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        isActive: conversation.is_active,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to get conversation with ID ${id}`,
        'get',
        'conversations',
        undefined,
        error,
      );
    }
  });

  ipcMain.handle(
    'db:conversations:create',
    (_event, conversationData: CreateConversationData): Conversation => {
      try {
        const validatedData = SanitizedCreateConversationSchema.parse(conversationData);
        const conversation = createConversation({
          id: uuidv4(),
          name: validatedData.name,
          description: validatedData.description,
          is_active: validatedData.isActive,
        });
        return {
          id: conversation.id,
          name: conversation.name,
          description: conversation.description,
          createdAt: conversation.created_at,
          updatedAt: conversation.updated_at,
          isActive: conversation.is_active,
        };
      } catch (error) {
        throw new DatabaseError(
          'Failed to create conversation',
          'create',
          'conversations',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'db:conversations:update',
    (_event, id: string, updates: UpdateConversationData): Conversation => {
      try {
        const validatedUpdates = SanitizedUpdateConversationSchema.parse({ id, ...updates });
        const conversation = updateConversation(validatedUpdates.id, {
          name: validatedUpdates.name,
          description: validatedUpdates.description,
          is_active: validatedUpdates.isActive,
        });
        if (!conversation) {
          throw new DatabaseError(
            `Conversation with ID ${id} not found`,
            'update',
            'conversations',
            undefined,
            new Error('Conversation not found'),
          );
        }
        return {
          id: conversation.id,
          name: conversation.name,
          description: conversation.description,
          createdAt: conversation.created_at,
          updatedAt: conversation.updated_at,
          isActive: conversation.is_active,
        };
      } catch (error) {
        throw new DatabaseError(
          `Failed to update conversation with ID ${id}`,
          'update',
          'conversations',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle('db:conversations:delete', (_event, id: string): void => {
    try {
      const validatedId = UuidSchema.parse(id);
      deleteConversation(validatedId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete conversation with ID ${id}`,
        'delete',
        'conversations',
        undefined,
        error,
      );
    }
  });

  // Message operations
  ipcMain.handle(
    'db:messages:list',
    (_event, conversationId: string, _filter?: DatabaseFilter): Message[] => {
      try {
        const validatedConversationId = UuidSchema.parse(conversationId);
        const messages = getMessagesByConversationId(validatedConversationId);
        return messages.map(message => ({
          id: message.id,
          conversationId: message.conversation_id,
          agentId: message.agent_id,
          content: message.content,
          type: message.type,
          metadata: message.metadata,
          timestamp: message.timestamp,
        }));
      } catch (error) {
        throw new DatabaseError(
          `Failed to list messages for conversation ${conversationId}`,
          'list',
          'messages',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle('db:messages:get', (_event, id: string): Message | null => {
    try {
      const validatedId = UuidSchema.parse(id);
      const message = getMessageById(validatedId);
      if (!message) return null;
      return {
        id: message.id,
        conversationId: message.conversation_id,
        agentId: message.agent_id,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        timestamp: message.timestamp,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to get message with ID ${id}`,
        'get',
        'messages',
        undefined,
        error,
      );
    }
  });

  ipcMain.handle('db:messages:create', (_event, messageData: CreateMessageData): Message => {
    try {
      const validatedData = SanitizedCreateMessageSchema.parse(messageData);
      const message = createMessage({
        id: uuidv4(),
        conversation_id: validatedData.conversationId,
        agent_id: validatedData.agentId,
        content: validatedData.content,
        type: validatedData.type,
        metadata: validatedData.metadata,
      });
      return {
        id: message.id,
        conversationId: message.conversation_id,
        agentId: message.agent_id,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        timestamp: message.timestamp,
      };
    } catch (error) {
      throw new DatabaseError('Failed to create message', 'create', 'messages', undefined, error);
    }
  });

  ipcMain.handle('db:messages:delete', (_event, id: string): void => {
    try {
      const validatedId = UuidSchema.parse(id);
      deleteMessage(validatedId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete message with ID ${id}`,
        'delete',
        'messages',
        undefined,
        error,
      );
    }
  });

  // Conversation-Agent relationship operations
  ipcMain.handle(
    'db:conversation-agents:list',
    (_event, conversationId: string): ConversationAgent[] => {
      try {
        const validatedConversationId = UuidSchema.parse(conversationId);
        const agents = getAgentsByConversationId(validatedConversationId);
        return agents.map(agent => ({
          conversationId: validatedConversationId,
          agentId: agent.id,
        }));
      } catch (error) {
        throw new DatabaseError(
          `Failed to list agents for conversation ${conversationId}`,
          'list',
          'conversation_agents',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'db:conversation-agents:add',
    (_event, conversationId: string, agentId: string): void => {
      try {
        UuidSchema.parse(conversationId);
        UuidSchema.parse(agentId);

        // Note: This requires implementing the actual database operation
        // For now, we'll throw an error indicating it's not yet implemented
        throw new DatabaseError(
          'Add conversation-agent relationship not yet implemented',
          'add',
          'conversation_agents',
          undefined,
          new Error('Not implemented'),
        );
      } catch (error) {
        throw new DatabaseError(
          `Failed to add agent ${agentId} to conversation ${conversationId}`,
          'add',
          'conversation_agents',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'db:conversation-agents:remove',
    (_event, conversationId: string, agentId: string): void => {
      try {
        UuidSchema.parse(conversationId);
        UuidSchema.parse(agentId);

        // Note: This requires implementing the actual database operation
        // For now, we'll throw an error indicating it's not yet implemented
        throw new DatabaseError(
          'Remove conversation-agent relationship not yet implemented',
          'remove',
          'conversation_agents',
          undefined,
          new Error('Not implemented'),
        );
      } catch (error) {
        throw new DatabaseError(
          `Failed to remove agent ${agentId} from conversation ${conversationId}`,
          'remove',
          'conversation_agents',
          undefined,
          error,
        );
      }
    },
  );

  // Transaction-based complex operations
  ipcMain.handle(
    'db:transactions:create-conversation-with-agents',
    async (
      _event,
      conversationData: CreateConversationData,
      agentIds: string[],
    ): Promise<{ conversation: Conversation; agentCount: number }> => {
      const context = {
        operation: 'create-with-agents',
        table: 'conversations',
        timestamp: Date.now(),
      };

      try {
        return await DatabaseErrorHandler.executeWithRetry(() => {
          const validatedData = SanitizedCreateConversationSchema.parse(conversationData);
          const validatedAgentIds = UuidArraySchema.parse(agentIds);

          return transactionManager.executeTransaction(db => {
            const now = Date.now();

            // Create conversation
            const insertConversation = db.prepare(`
            INSERT INTO conversations (id, name, description, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

            const conversationId = uuidv4();
            const conversationRecord = {
              id: conversationId,
              name: validatedData.name,
              description: validatedData.description,
              is_active: validatedData.isActive,
              created_at: now,
              updated_at: now,
            };

            insertConversation.run(
              conversationRecord.id,
              conversationRecord.name,
              conversationRecord.description,
              conversationRecord.is_active,
              conversationRecord.created_at,
              conversationRecord.updated_at,
            );

            // Create conversation-agent associations
            const insertAssociation = db.prepare(`
            INSERT INTO conversation_agents (conversation_id, agent_id)
            VALUES (?, ?)
          `);

            for (const agentId of validatedAgentIds) {
              insertAssociation.run(conversationId, agentId);
            }

            return {
              conversation: {
                id: conversationRecord.id,
                name: conversationRecord.name,
                description: conversationRecord.description,
                createdAt: conversationRecord.created_at,
                updatedAt: conversationRecord.updated_at,
                isActive: conversationRecord.is_active,
              },
              agentCount: validatedAgentIds.length,
            };
          });
        }, context);
      } catch (error) {
        DatabaseErrorHandler.handleDatabaseError(error, context);
      }
    },
  );

  ipcMain.handle(
    'db:transactions:create-messages-batch',
    (_event, messages: CreateMessageData[]): Message[] => {
      try {
        const validatedMessages = messages.map(msg => SanitizedCreateMessageSchema.parse(msg));

        return transactionManager.executeTransaction(db => {
          const insertMessage = db.prepare(`
          INSERT INTO messages (id, conversation_id, agent_id, content, type, metadata, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

          const createdMessages: Message[] = [];
          const now = Date.now();

          for (const msgData of validatedMessages) {
            const messageRecord = {
              id: uuidv4(),
              conversation_id: msgData.conversationId,
              agent_id: msgData.agentId,
              content: msgData.content,
              type: msgData.type,
              metadata: msgData.metadata ?? '{}',
              timestamp: now,
            };

            insertMessage.run(
              messageRecord.id,
              messageRecord.conversation_id,
              messageRecord.agent_id,
              messageRecord.content,
              messageRecord.type,
              messageRecord.metadata,
              messageRecord.timestamp,
            );

            createdMessages.push({
              id: messageRecord.id,
              conversationId: messageRecord.conversation_id,
              agentId: messageRecord.agent_id,
              content: messageRecord.content,
              type: messageRecord.type,
              metadata: messageRecord.metadata,
              timestamp: messageRecord.timestamp,
            });
          }

          // Update conversation timestamp
          const updateConversation = db.prepare(`
          UPDATE conversations SET updated_at = ? WHERE id = ?
        `);

          if (validatedMessages.length > 0) {
            updateConversation.run(now, validatedMessages[0].conversationId);
          }

          return createdMessages;
        });
      } catch (error) {
        throw new DatabaseError(
          'Failed to create messages batch',
          'create-batch',
          'messages',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'db:transactions:delete-conversation-cascade',
    (_event, conversationId: string): void => {
      try {
        const validatedConversationId = UuidSchema.parse(conversationId);

        transactionManager.executeTransaction(db => {
          // Delete conversation-agent associations
          const deleteAssociations = db.prepare(`
          DELETE FROM conversation_agents WHERE conversation_id = ?
        `);
          deleteAssociations.run(validatedConversationId);

          // Delete messages
          const deleteMessages = db.prepare(`
          DELETE FROM messages WHERE conversation_id = ?
        `);
          deleteMessages.run(validatedConversationId);

          // Delete conversation
          const deleteConversation = db.prepare(`
          DELETE FROM conversations WHERE id = ?
        `);
          deleteConversation.run(validatedConversationId);
        });
      } catch (error) {
        throw new DatabaseError(
          `Failed to delete conversation ${conversationId} with cascade`,
          'delete-cascade',
          'conversations',
          undefined,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'db:transactions:transfer-messages',
    (_event, fromConversationId: string, toConversationId: string, messageIds: string[]): void => {
      try {
        const validatedFromConversationId = UuidSchema.parse(fromConversationId);
        const validatedToConversationId = UuidSchema.parse(toConversationId);
        const validatedMessageIds = UuidArraySchema.parse(messageIds);

        transactionManager.executeTransaction(db => {
          const now = Date.now();

          // Update messages to new conversation
          const updateMessages = db.prepare(`
          UPDATE messages SET conversation_id = ?, timestamp = ? WHERE id = ?
        `);

          for (const messageId of validatedMessageIds) {
            updateMessages.run(validatedToConversationId, now, messageId);
          }

          // Update both conversations' timestamps
          const updateConversation = db.prepare(`
          UPDATE conversations SET updated_at = ? WHERE id = ?
        `);

          updateConversation.run(now, validatedFromConversationId);
          updateConversation.run(now, validatedToConversationId);
        });
      } catch (error) {
        throw new DatabaseError(
          `Failed to transfer messages from ${fromConversationId} to ${toConversationId}`,
          'transfer-messages',
          'messages',
          undefined,
          error,
        );
      }
    },
  );

  // Error handling is already built into individual handlers
};
