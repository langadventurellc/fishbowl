import { TestAgent } from "./TestAgent";
import { TestMessage } from "./TestMessage";

export interface TestConversation {
  id: string;
  title: string;
  participants: TestAgent[];
  messages: TestMessage[];
}
