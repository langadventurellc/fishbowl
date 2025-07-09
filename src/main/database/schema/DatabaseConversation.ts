/**
 * Database conversation schema type
 */
export interface DatabaseConversation {
  id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
  is_active: boolean;
}
