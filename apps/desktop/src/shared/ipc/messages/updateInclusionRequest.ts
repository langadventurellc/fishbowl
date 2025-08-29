/**
 * Messages update inclusion operation request type
 *
 * Parameters for updating a message's inclusion flag
 */
export interface MessagesUpdateInclusionRequest {
  id: string;
  included: boolean;
}
