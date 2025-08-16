export interface PersonalitiesErrorState {
  message: string | null;
  operation: "save" | "load" | "sync" | "import" | "reset" | null;
  isRetryable: boolean;
  retryCount: number;
  timestamp: string | null;
  fieldErrors?: Array<{ field: string; message: string }>;
}
