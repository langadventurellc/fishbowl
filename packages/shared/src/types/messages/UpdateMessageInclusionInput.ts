/**
 * Input type for updating message inclusion status
 */
export interface UpdateMessageInclusionInput {
  /** Message ID to update */
  id: string;
  /** Whether message should be included in LLM context */
  included: boolean;
}
