export interface RecoverySuggestion {
  type: "user_action" | "auto_fix" | "fallback";
  message: string;
  action?: () => Promise<void>;
}
