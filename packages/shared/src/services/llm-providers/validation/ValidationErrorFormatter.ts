import { z } from "zod";
import type { LlmFieldValidationError } from "../../../types/llm-providers/validation/LlmFieldValidationError";
import type { FormattedValidationError } from "./FormattedValidationError";
import type { FormatterOptions } from "./FormatterOptions";

export class ValidationErrorFormatter {
  constructor(private options: FormatterOptions = {}) {}

  formatZodError(error: z.ZodError): FormattedValidationError[] {
    const errors: FormattedValidationError[] = [];
    const maxErrors = this.options.maxErrorCount ?? 10;

    for (const issue of error.issues.slice(0, maxErrors)) {
      errors.push({
        path: issue.path.join("."),
        field: issue.path[issue.path.length - 1]?.toString() || "",
        message: this.formatMessage(issue.message),
        code: issue.code,
        value: this.options.includeRawData
          ? "input" in issue
            ? issue.input
            : undefined
          : undefined,
        expectedType: "expected" in issue ? String(issue.expected) : undefined,
      });
    }

    if (error.issues.length > maxErrors) {
      errors.push({
        path: "",
        field: "",
        message: `...and ${error.issues.length - maxErrors} more errors`,
        code: "TRUNCATED",
      });
    }

    return errors;
  }

  formatJsonError(
    error: Error,
    filePath: string,
    content?: string,
  ): FormattedValidationError[] {
    const match = error.message.match(/at position (\d+)/);
    const position = match?.[1] ? parseInt(match[1], 10) : undefined;

    return [
      {
        path: filePath,
        field: "",
        message:
          this.options.mode === "development"
            ? error.message
            : "Invalid JSON syntax in configuration file",
        code: "JSON_PARSE_ERROR",
        line:
          position && content
            ? this.getLineFromPosition(content, position)
            : undefined,
        column:
          position && content
            ? this.getColumnFromPosition(content, position)
            : undefined,
      },
    ];
  }

  formatFileError(error: Error, filePath: string): FormattedValidationError {
    return {
      path: filePath,
      field: "",
      message:
        this.options.mode === "development"
          ? error.message
          : "Failed to read configuration file",
      code: error.name,
    };
  }

  formatValidationErrors(
    errors: LlmFieldValidationError[],
  ): FormattedValidationError[] {
    return errors.map((error) => ({
      path: error.fieldId,
      field: error.fieldId,
      message: error.message,
      code: error.code,
      value: this.options.includeRawData ? error.value : undefined,
    }));
  }

  createDeveloperMessage(errors: FormattedValidationError[]): string {
    const lines = ["Configuration validation failed:"];

    errors.forEach((error) => {
      const location = error.line
        ? ` (line ${error.line}, column ${error.column})`
        : "";
      lines.push(`  - ${error.path || "root"}${location}: ${error.message}`);

      if (error.expectedType) {
        lines.push(`    Expected: ${error.expectedType}`);
      }

      if (this.options.includeRawData && error.value !== undefined) {
        lines.push(`    Received: ${JSON.stringify(error.value)}`);
      }
    });

    return lines.join("\n");
  }

  createUserMessage(errors: LlmFieldValidationError[]): string {
    if (errors.length === 0) return "Validation successful";

    if (errors.length === 1) {
      return errors[0]?.message || "Validation error";
    }

    return `Configuration has ${errors.length} validation errors. Please check the following fields: ${errors
      .map((e) => e.fieldId)
      .join(", ")}`;
  }

  private formatMessage(message: string): string {
    if (this.options.mode === "production") {
      return message
        .replace(/Expected .+, received .+/, "Invalid value type")
        .replace(
          /String must contain at least .+ character\(s\)/,
          "Value is too short",
        )
        .replace(/Invalid input/, "Invalid value");
    }
    return message;
  }

  private getLineFromPosition(content: string, position: number): number {
    const substring = content.substring(0, position);
    return substring.split("\n").length;
  }

  private getColumnFromPosition(content: string, position: number): number {
    const substring = content.substring(0, position);
    const lines = substring.split("\n");
    const lastLine = lines[lines.length - 1];
    return (lastLine?.length ?? 0) + 1;
  }
}
