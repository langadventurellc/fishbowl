import type { CreateMessageInput } from "@fishbowl-ai/shared";

/**
 * Messages create operation request type
 *
 * Parameters for creating a new message
 */
export interface MessagesCreateRequest {
  input: CreateMessageInput;
}
