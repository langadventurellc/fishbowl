# Fishbowl

An Electron-based desktop application for multi-agent AI conversations, enabling natural collaboration between multiple AI personalities in a shared conversation space.

## Overview

Fishbowl allows you to create and manage multiple AI agents with distinct personalities, roles, and capabilities. Watch as they engage in natural conversations, each contributing their unique perspective to discussions, brainstorming sessions, and collaborative problem-solving.

### Key Features

- **Multi-Agent Conversations**: Create conversations with multiple AI agents
- **Personality System**: Configure agents with Big Five personality traits
- **Role-Based Behavior**: Assign specific roles and expertise to agents
- **Multiple AI Providers**: Support for OpenAI, Anthropic, Google, Groq, and Ollama
- **Manual & Auto Modes**: Control conversation flow manually or let agents interact automatically
- **Secure API Management**: Encrypted storage of API keys using keytar
- **Cross-Platform**: Available on Windows, macOS, and Linux

## Technology Stack

- **Framework**: Electron with Vite build system
- **Frontend**: React 18+ with TypeScript (strict mode)
- **State Management**: Zustand with persistence
- **Database**: SQLite via better-sqlite3
- **AI Integration**: Vercel AI SDK
- **Styling**: CSS Modules with CSS Variables for theming
- **Security**: keytar for secure API key storage

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/fishbowl.git
cd fishbowl

# Install dependencies
npm install

# Rebuild SQLite for your platform (if needed)
npm rebuild better-sqlite3

# Start development server
npm run dev
```

## Development

### Available Commands

```bash
# Development (hot reload)
npm run dev               # Start both processes
npm run dev:main         # Main process only
npm run dev:renderer     # Renderer process only

# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix       # Auto-fix issues
npm run type-check     # TypeScript check

# Building
npm run build          # Production build
npm run dist           # Package for current platform
npm run preview        # Preview production build

# Database
npm run db:migrate     # Run migrations
```

### Project Structure

```
src/
├── main/                    # Electron main process
│   ├── database/           # SQLite operations
│   ├── config/            # Config file management
│   ├── security/          # Keytar integration
│   └── ipc/              # IPC handlers
├── renderer/               # React application
│   ├── components/        # Feature-based components
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom React hooks
│   └── services/         # AI provider services
└── shared/                # Shared types/utils
    └── types/            # TypeScript interfaces
```

## Configuration

The application uses JSON configuration files in the `/config` directory:

- `models.json` - AI provider and model configurations
- `personalities.json` - Predefined personality templates
- `roles.json` - Predefined role templates

## Usage

### Basic Usage

1. **Configure API Keys**: Add your AI provider API keys in Settings
2. **Create Agents**: Set up agents with personalities and roles
3. **Start Conversations**: Begin chatting with your AI collaborators
4. **Switch Modes**: Use manual mode for controlled interactions or auto mode for natural flow

### Advanced Features

- **@ Mentions**: Direct specific agents to respond
- **Turn Management**: Control conversation flow and participation
- **Personality Tuning**: Fine-tune agent behavior with personality sliders
- **Role Customization**: Create custom roles with specific system prompts

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: See [docs/](docs/) for detailed guides
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

## Current Status

This project is in active development. The application is being built incrementally with working features at each milestone. Check the [implementation plan](docs/specifications/implementation-plan.md) for current progress.

---

**Note**: This is an early-stage project. Features and API may change significantly during development.
