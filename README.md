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

- **Framework**: Electron with Vite build system ✅
- **Frontend**: React 18+ with TypeScript (strict mode) ✅
- **Styling**: CSS Modules with CSS Variables for theming ✅
- **Security**: Secure IPC with context isolation ✅
- **Build Tools**: ESLint, Prettier, Husky pre-commit hooks ✅
- **Development**: Hot reload, TypeScript strict mode, comprehensive tooling ✅
- **State Management**: Zustand with persistence 📋 _Planned Phase 2_
- **Database**: SQLite via better-sqlite3 📋 _Planned Phase 2_
- **AI Integration**: Vercel AI SDK 📋 _Planned Phase 2_

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
npm run dev               # Start both processes with nodemon
npm run dev:main         # Main process only
npm run dev:renderer     # Renderer process only
npm run dev:concurrent   # Concurrent development mode

# Code Quality
npm run lint            # Run ESLint with custom rules
npm run lint:fix       # Auto-fix ESLint issues
npm run type-check     # TypeScript strict mode check
npm run format          # Run Prettier formatting
npm run format:check    # Check Prettier formatting

# Building
npm run build          # Production build
npm run build:verify   # Build with verification
npm run dist           # Package for current platform
npm run dist:all       # Package for all platforms
npm run preview        # Preview production build

# Security & Analysis
npm run security:audit # Comprehensive security audit
npm audit              # Basic dependency audit

# Icon Generation
npm run generate:icon  # Generate app icon
npm run generate:icons # Generate platform icons

# Note: Testing framework planned for Phase 2
```

### Project Structure

```
src/
├── main/                    # Electron main process ✅
│   ├── index.ts            # Main process entry point
│   ├── window.ts           # Window management
│   ├── menu.ts             # Application menu
│   └── ipc/               # IPC handlers and events
├── renderer/               # React application ✅
│   ├── components/        # Feature-based components
│   │   ├── Home/          # Landing page
│   │   ├── Settings/      # Settings interface
│   │   ├── Chat/          # Chat interface placeholder
│   │   ├── UI/            # Reusable UI components
│   │   ├── DevTools/      # Development tools
│   │   └── ErrorBoundary/ # Error handling
│   ├── hooks/             # Custom React hooks
│   └── styles/            # CSS themes and globals
├── preload/               # Secure IPC bridge ✅
└── shared/                # Shared types/utils ✅
    ├── types/             # TypeScript interfaces
    └── utils/             # Utility functions

assets/                    # Application assets ✅
scripts/                   # Build and utility scripts ✅
```

## Current Features (Phase 1 Complete)

### ✅ Working Features

- **Electron Application**: Fully functional desktop app with secure architecture
- **React 18+ Interface**: Modern React with TypeScript strict mode
- **Theme System**: Light/dark mode toggle with CSS custom properties
- **Secure IPC**: Type-safe communication between processes
- **Development Tools**: Hot reload, comprehensive linting, formatting
- **Component Architecture**: Feature-based organization with reusable UI components
- **Error Handling**: Comprehensive error boundaries and development tools
- **Build System**: Production builds with cross-platform packaging
- **Security**: Context isolation, input sanitization, comprehensive auditing

### 🔄 Demo Pages

- **Home**: Welcome screen with feature overview and navigation
- **Settings**: Configuration interface (placeholder for Phase 2)
- **Chat**: Conversation interface (placeholder for Phase 2)
- **Dev Tools**: IPC testing and system information panel

## Planned Features (Future Phases)

### Phase 2 - Core Functionality

- Database integration (SQLite)
- AI provider services
- Agent management system
- Basic conversation functionality

### Phase 3 - Advanced Features

- Multi-agent conversations
- Personality system implementation
- Role-based behavior
- Auto/manual conversation modes

## Usage

### Current Usage (Phase 1)

1. **Start Application**: Run `npm run dev` to launch the development version
2. **Explore Interface**: Navigate between Home, Settings, and Chat pages
3. **Test Features**: Use the Dev Tools page to test IPC communication
4. **Toggle Theme**: Switch between light and dark modes
5. **Development**: Hot reload works for both main and renderer processes

### Demo Features Available

- **Navigation**: React Router with multiple pages
- **Theme Toggle**: Light/dark mode switching
- **IPC Testing**: Comprehensive communication testing
- **Window Controls**: Minimize, maximize, close functionality
- **Error Handling**: Error boundaries with helpful development information
- **System Info**: Platform and application version display

### Planned Usage (Future Phases)

- AI agent creation and management
- Multi-agent conversations
- Personality and role customization
- API key management and provider configuration

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: See [docs/](docs/) for detailed guides
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

## Development Status

### ✅ Phase 1 Complete - Electron Project Setup

- ✅ Complete Electron foundation with React 18+
- ✅ TypeScript strict mode configuration
- ✅ Secure IPC bridge implementation
- ✅ Development tooling and build system
- ✅ Theme system and component architecture
- ✅ Security configurations and audit tools
- ✅ Cross-platform packaging setup

### 🔄 Current Phase - Documentation & Preparation

- 🔄 Updating documentation with completed features
- 🔄 Preparing specifications for Phase 2

### 📋 Next Phase - Core Functionality (Phase 2)

- 📋 Database integration and schema design
- 📋 AI provider service implementation
- 📋 Basic agent and conversation management
- 📋 Testing framework setup

### Getting Started

The application is now in a working state with a complete Electron foundation. You can:

1. Run the development server and explore the interface
2. Test the secure IPC communication system
3. Experiment with the theme system and component architecture
4. Review the comprehensive build and development tooling

Check the [implementation plan](docs/specifications/implementation-plan.md) for detailed progress and next steps.

---

**Note**: This project is built incrementally with working features at each milestone. Phase 1 provides a solid foundation for the multi-agent AI conversation features coming in Phase 2.
