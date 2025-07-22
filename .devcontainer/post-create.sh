#!/bin/bash
set -e

echo "Setting up Tauri development environment..."

# Install pnpm globally
npm install -g pnpm@10.13.1

# Install Tauri CLI
cargo install tauri-cli --locked

# Install WebDriver dependencies for testing
cargo install tauri-driver

# Install frontend dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies with pnpm..."
    pnpm install
fi

# Install additional cargo tools
cargo install cargo-watch

# Setup virtual display for headless testing
echo "Setting up virtual display for testing..."
export DISPLAY=:99

echo "Development environment setup complete!"
echo "You can now run 'pnpm dev:desktop' to start development"
echo "Run 'pnpm test:e2e:desktop:container' for end-to-end testing with WebDriver"
echo "Run 'pnpm container:setup' to start virtual display for testing"