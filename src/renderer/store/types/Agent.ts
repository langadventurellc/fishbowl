/**
 * Agent data structure - matches shared types and database schema
 */

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
