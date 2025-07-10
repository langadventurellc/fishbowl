/**
 * Agent data structure
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
