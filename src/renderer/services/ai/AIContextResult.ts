import { Agent } from '../../../shared/types';
import { AIMessage } from './AIMessage';

/**
 * Result of AI context preparation.
 */
export interface AIContextResult {
  messages: AIMessage[];
  activeMessageCount: number;
  totalMessageCount: number;
  isFiltered: boolean;
  agent?: Agent;
}
