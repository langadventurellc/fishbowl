// Window handlers
export { windowMinimizeHandler } from './windowMinimizeHandler';
export { windowMaximizeHandler } from './windowMaximizeHandler';
export { windowCloseHandler } from './windowCloseHandler';

// App handlers
export { appGetVersionHandler } from './appGetVersionHandler';

// System handlers
export { systemGetInfoHandler } from './systemGetInfoHandler';
export { systemPlatformHandler } from './systemPlatformHandler';
export { systemArchHandler } from './systemArchHandler';
export { systemVersionHandler } from './systemVersionHandler';

// Configuration handlers
export { configGetHandler } from './configGetHandler';
export { configSetHandler } from './configSetHandler';

// Theme handlers
export { themeGetHandler } from './themeGetHandler';
export { themeSetHandler } from './themeSetHandler';

// Development handlers
export { devIsDevHandler } from './devIsDevHandler';
export { devOpenDevToolsHandler } from './devOpenDevToolsHandler';
export { devCloseDevToolsHandler } from './devCloseDevToolsHandler';

// Secure storage handlers
export { secureCredentialsGetHandler } from './secureCredentialsGetHandler';
export { secureCredentialsSetHandler } from './secureCredentialsSetHandler';
export { secureCredentialsDeleteHandler } from './secureCredentialsDeleteHandler';
export { secureCredentialsListHandler } from './secureCredentialsListHandler';
export { secureKeytarGetHandler } from './secureKeytarGetHandler';
export { secureKeytarSetHandler } from './secureKeytarSetHandler';
export { secureKeytarDeleteHandler } from './secureKeytarDeleteHandler';

// Database agent handlers
export { dbAgentsListHandler } from './dbAgentsListHandler';
export { dbAgentsGetHandler } from './dbAgentsGetHandler';
export { dbAgentsCreateHandler } from './dbAgentsCreateHandler';
export { dbAgentsUpdateHandler } from './dbAgentsUpdateHandler';
export { dbAgentsDeleteHandler } from './dbAgentsDeleteHandler';

// Database conversation handlers
export { dbConversationsListHandler } from './dbConversationsListHandler';
export { dbConversationsGetHandler } from './dbConversationsGetHandler';
export { dbConversationsCreateHandler } from './dbConversationsCreateHandler';
export { dbConversationsUpdateHandler } from './dbConversationsUpdateHandler';
export { dbConversationsDeleteHandler } from './dbConversationsDeleteHandler';

// Database message handlers
export { dbMessagesListHandler } from './dbMessagesListHandler';
export { dbMessagesGetHandler } from './dbMessagesGetHandler';
export { dbMessagesCreateHandler } from './dbMessagesCreateHandler';
export { dbMessagesDeleteHandler } from './dbMessagesDeleteHandler';

// Database conversation-agent relationship handlers
export { dbConversationAgentsListHandler } from './dbConversationAgentsListHandler';
export { dbConversationAgentsAddHandler } from './dbConversationAgentsAddHandler';
export { dbConversationAgentsRemoveHandler } from './dbConversationAgentsRemoveHandler';

// Database transaction handlers
export { dbTransactionsCreateConversationWithAgentsHandler } from './dbTransactionsCreateConversationWithAgentsHandler';
export { dbTransactionsCreateMessagesBatchHandler } from './dbTransactionsCreateMessagesBatchHandler';
export { dbTransactionsDeleteConversationCascadeHandler } from './dbTransactionsDeleteConversationCascadeHandler';
export { dbTransactionsTransferMessagesHandler } from './dbTransactionsTransferMessagesHandler';

// Database backup handlers
export * from './database/backup';
