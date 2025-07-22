#!/bin/bash

# Pre-tool use hook for Trellis Complete Task
# Runs lint and test before completing tasks

echo "🔧 Running pre-completion checks for Trellis task..."

# Change to project root
cd /Users/zach/code/fishbowl

echo "📝 Running lint..."
if ! pnpm lint; then
    echo "❌ Lint failed - fix issues before completing task"
    exit 2
fi

echo "✅ Lint passed"

echo "🧪 Running tests..."
if ! pnpm test; then
    echo "❌ Tests failed - fix issues before completing task"
    exit 2
fi

echo "✅ Tests passed"
echo "🎉 Pre-completion checks successful - proceeding with task completion"