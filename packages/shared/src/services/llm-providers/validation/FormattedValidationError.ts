export interface FormattedValidationError {
  path: string;
  field: string;
  message: string;
  code: string;
  value?: unknown;
  expectedType?: string;
  line?: number;
  column?: number;
}
