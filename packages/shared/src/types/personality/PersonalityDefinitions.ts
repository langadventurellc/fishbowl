import { PersonalitySectionDef } from "./PersonalitySectionDef";

/**
 * Complete personality definitions loaded from JSON resource.
 * Contains all sections with their traits and discrete value metadata.
 */
export interface PersonalityDefinitions {
  /** Array of personality sections (Big 5, Communication Style, etc.) */
  sections: PersonalitySectionDef[];
}
