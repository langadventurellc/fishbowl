export interface TestMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: "user" | "agent" | "system";
}
