export interface ValidationWarning {
  type: "deprecation" | "compatibility" | "performance";
  message: string;
  path?: string;
}
