export function extractLineNumber(error: Error): number | undefined {
  const match = error.message.match(/line (\d+)/i);
  return match?.[1] ? parseInt(match[1], 10) : undefined;
}
