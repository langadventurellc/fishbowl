/**
 * Combined application state interface
 */

import type { ThemeSlice } from './ThemeSlice';
import type { UISlice } from './UISlice';
import type { SettingsSlice } from './SettingsSlice';
import type { AgentSlice } from './AgentSlice';
import type { ConversationSlice } from './ConversationSlice';

/**
 * Combined application state interface
 */
export interface AppState
  extends ThemeSlice,
    UISlice,
    SettingsSlice,
    AgentSlice,
    ConversationSlice {}
