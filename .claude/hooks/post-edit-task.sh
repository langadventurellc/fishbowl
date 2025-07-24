#!/bin/bash

# Post-tool use hook for file edits
# Runs lint after editing files

echo "🔧 Running post-edit checks..."

# Change to project root
cd "$(git rev-parse --show-toplevel)"

echo "📝 Running lint checks..."
if ! pnpm lint; then
    echo "❌ Lint checks failed - consider fixing issues before continuing" >&2
    exit 2
fi

echo "✅ Lint checks passed"

echo "📝 Running type checks..."
if ! pnpm type-check; then
    echo "❌ Type checks failed - consider fixing issues before continuing" >&2
    exit 2
fi

echo "✅ Type checks passed"
exit 0
