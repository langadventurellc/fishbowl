## Component Decomposition Instructions

Create a project that will take an existing prototype of the main conversation screen for this application and decompose it into distinct React components. The primary goal is to follow SOLID principles, with a special emphasis on keeping coupling between components very low.

### Project Phases

1. **Phase 1**: Decompose the prototype into React components
2. **Phase 2**: Integrate shadcn components into the new components

### Project Goal

The target deliverable is a library of React components that will be showcased in a component library screen within the application. Each component should be visually complete and display correctly in isolation.

**Important:** At the end of this project, components are not expected to have functional behavior or work together as a cohesive system. The focus is purely on visual fidelity and individual component presentation for the component library showcase.

### Important Notes

- The light/dark mode toggle button is for prototype purposes only and will eventually be moved to a settings screen. Do not create a component for this feature.
- Components should maintain existing visual functionality (e.g., clicking ellipsis opens context menu, toggling message changes visual state) but without complex behavioral logic.
- Each component should be internally composable - a single logical component can be composed of multiple sub-components for cleaner implementation.
- Create TypeScript props interfaces for each component that requires external data. These interfaces should be placed in the shared package at `@fishbowl-ai/shared/src/types/ui/` so they can be reused by both desktop and mobile implementations, as both platforms will have similar UI data requirements despite different rendering approaches.

### Expected Components

#### Screen-Level Components

- **ConversationScreen** - Root component for the application screen
- **Sidebar** - Left sidebar container (includes SidebarToggle positioning)
- **MainContentPanel** - Primary content area

#### Sidebar Components

- **ConversationItem** - Complete conversation row (internally composed of name/timestamp + ellipsis menu)
- **SidebarToggle** - Expand/collapse button component
- **NewConversationButton** - The "+ New Conversation" component

#### Main Content Panel Components

##### Agent Labels Section

- **AgentLabelsContainer** - Top bar layout container
- **AgentPill** - Individual agent indicator (internally handles thinking indicator)
- **AddAgentButton** - The "+" button
- **ThinkingIndicator** - Pulsing dot animation (used within AgentPill)

##### Chat Area

- **ChatContainer** - Scrollable message area
- **MessageItem** - Complete message row (internally composed of header + content + controls)

##### Input Area

- **InputContainer** - Bottom section layout
- **MessageInput** - Text area + send button (could be 1 or 2 components internally)
- **ModeToggle** - Manual/Auto toggle component

#### Reusable UI Components

- **ContextMenu** - Dropdown menu (used by both MessageItem and ConversationItem)

### Design Principles

Each component should be designed as a logical unit with clear responsibilities and minimal dependencies on other components. Components own their visual states and interactions while maintaining clean boundaries. Internal composition is encouraged to keep implementations clean while preserving logical component boundaries.
