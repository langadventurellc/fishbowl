/**
 * Defines a reduced feature set for capability graceful degradation
 *
 * Represents a simplified version of a capability that removes problematic
 * features while retaining core functionality that can work within platform
 * constraints.
 */
export interface ReducedFeatureSet {
  /** Human-readable name for this reduced feature set */
  name: string;

  /** Description of what this reduced set provides */
  description: string;

  /** Features that are removed in this reduced set */
  removedFeatures: string[];

  /** Features that are retained in this reduced set */
  retainedFeatures: string[];

  /** Expected performance impact of using this reduced set */
  performanceImpact: 'improved' | 'minimal' | 'moderate' | 'significant';

  /** How much compatibility is gained by using this reduced set */
  compatibilityGain: 'low' | 'moderate' | 'high' | 'very-high';

  /** Impact on user experience when using this reduced set */
  userExperienceImpact: 'none' | 'minor' | 'moderate' | 'major';

  /** Specific implementation notes for this reduced set (optional) */
  implementationNotes?: string[];

  /** Limitations that users should be aware of (optional) */
  limitations?: string[];

  /** Benefits of using this reduced set (optional) */
  benefits?: string[];
}
