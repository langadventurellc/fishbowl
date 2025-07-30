/**
 * BehaviorGroup interface for personality behavior organization.
 *
 * Defines the structure for grouping related behavior traits in the personality creation interface.
 *
 * @module types/settings/BehaviorGroup
 */

import type { BehaviorTrait } from "./BehaviorTrait";

export interface BehaviorGroup {
  /** Display title for the behavior group */
  title: string;
  /** Array of behavior traits in this group */
  behaviors: BehaviorTrait[];
}
