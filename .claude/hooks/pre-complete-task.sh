#!/bin/bash

# Pre-tool use hook for Trellis Complete Task
# Runs lint and test before completing tasks

echo "🔧 Running pre-completion checks for Trellis task..."

# Change to project root
cd "$(git rev-parse --show-toplevel)"

echo "📝 Running quality checks..."
QUALITY_OUTPUT=$(pnpm quality 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Quality checks failed - fix issues before completing task" >&2
    echo "$QUALITY_OUTPUT" | grep -E "(error|warning)" >&2
    exit 2
fi

echo "✅ Quality checks passed"

echo "🧪 Running tests..."
TEST_OUTPUT=$(pnpm test 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ Tests failed - fix issues before completing task" >&2
    echo "$TEST_OUTPUT" | grep -E "(error|warning|failed|FAIL|Summary of all failing tests|●.*›|Test Suites:.*failed|Failed:)" >&2
    exit 2
fi

echo "✅ Tests passed"
echo "🎉 Pre-completion checks successful - proceeding with task completion"
exit 0