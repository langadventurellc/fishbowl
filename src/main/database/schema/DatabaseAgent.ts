/**
 * Database agent schema type
 */
export interface DatabaseAgent {
  id: string;
  name: string;
  role: string;
  personality: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}
