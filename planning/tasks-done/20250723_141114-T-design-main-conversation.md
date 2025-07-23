---
kind: task
id: T-design-main-conversation
status: done
title: Design main conversation interface UI mockup
priority: high
prerequisites: []
created: "2025-07-22T23:33:50.805287"
updated: "2025-07-23T12:35:05.753863"
schema_version: "1.1"
worktree: null
---

Create a React page with plain HTML and Tailwind CSS styling for the main conversation interface within the Electron app. This is a design iteration focused on visual layout and styling for rapid prototyping - the final design will later be converted to proper React components.

## Context

This task implements the core conversation interface described in the desktop UX specification ASCII mockup. The interface consists of a sidebar for conversations, an agent labels bar, a scrollable chat messages area, and an input area. We're creating a React page that renders within the actual Electron app interface but uses plain HTML and Tailwind CSS for quick design iteration.

Key documentation references:

- `/Users/zach/code/fishbowl/docs/specifications/desktop-ux-specification.md` - ASCII mockup and detailed UI specification
- `/Users/zach/code/fishbowl/packages/ui-theme/src/claymorphism-theme.css` - Theme design with CSS variables
- `/Users/zach/code/fishbowl/docs/specifications/feature-stories-v0.md` - Acceptance criteria for UI elements
- `/Users/zach/code/fishbowl/docs/fishbowl-product-description.md` - Product context and features
- `/Users/zach/code/fishbowl/docs/specifications/chat-room-mechanics-spec.md` - Message types and states

## IMPLEMENTATION STATUS

### ✅ COMPLETED WORK

**Core Implementation:**

1. **Created `apps/desktop/src/pages/DesignPrototype.tsx`** - Complete React component with conversation interface
2. **Updated `apps/desktop/src/App.tsx`** - Added navigation button to access design prototype
3. **Fixed CSS/Theme Integration** - Added theme CSS custom properties directly to `apps/desktop/index.html`
4. **Removed Title Bar** - Eliminated redundant Electron window controls, moved theme toggle to agent labels bar
5. **Expanded Chat Width** - Removed max-width constraint for better space utilization

**Working Features:**

- Main layout matching ASCII mockup (sidebar + content area without title bar)
- 3 distinct agents with unique colors (Technical Advisor: blue, Project Manager: green, Creative Director: purple)
- 15 realistic conversation messages about microservices architecture
- Light/dark theme toggle (🌙/☀️ button in agent labels bar)
- Scrollable chat area with proper message formatting
- Functional input area with textarea, send button, Manual/Auto mode toggle
- Conversation sidebar with sample conversations
- Active/inactive message states (some messages at 50% opacity)
- CSS-in-JS styling using theme custom properties (NOT Tailwind - not configured)

### ❌ REMAINING WORK

**High Priority:**

1. **Message Toggle Functionality** - Interactive checkboxes on hover to include/exclude messages from context
   - **CRITICAL**: Previous attempt failed due to React Rules of Hooks violation (useState inside map function)
   - Need proper implementation with component-level state management
   - Should show checkbox on message hover, click to toggle active/inactive state

**Medium Priority:** 2. **UX Enhancements** from original specs:

- Long message collapse/expand ("Show more..." for messages >3 lines)
- Message hover actions (copy, regenerate, delete buttons)
- Manual mode pending responses preview
- Responsive sidebar collapse for narrow windows

## Technical Implementation Notes

**IMPORTANT - Actual Implementation Differs from Original Spec:**

- **NO Tailwind CSS** - Used CSS-in-JS with React style objects instead (Tailwind not configured)
- **CSS Custom Properties** - Embedded directly in index.html due to Vite import issues
- **Layout Structure** - Title bar removed as inappropriate for Electron context
- **Styling Approach** - Uses `var(--background)`, `var(--foreground)` etc. from theme system

**File Structure:**

- `apps/desktop/src/pages/DesignPrototype.tsx` - Main component (✅ EXISTS)
- `apps/desktop/src/App.tsx` - Navigation integration (✅ UPDATED)
- `apps/desktop/index.html` - Theme CSS embedded (✅ UPDATED)

**Data Structures:**

- Static Message[] array with interface (id, agent, role, content, timestamp, type, isActive, agentColor)
- Agent interface with name, role, color, isThinking
- Component state: isDark, inputText, isManualMode

## Original Technical Approach (Modified During Implementation)

1. **Create HTML structure** matching the ASCII layout:

   ```
   ┌────────────────────────────────────────────────────────────┐
   │ REMOVED - Title bar inappropriate for Electron             │
   ├──────────────┬─────────────────────────────────────────────┤
   │              │ [Agent Labels Bar] [Theme Toggle]           │
   │[Conversations│─────────────────────────────────────────────│
   │ Sidebar]     │                                             │
   │              │           Chat Messages Area                │
   │ - Chat 1     │ [Agent msg]                                 │
   │ - Chat 2     │                                  [User msg] │
   │ + New Chat   │─────────────────────────────────────────────│
   │              │  [Input Area]                               │
   └──────────────┴─────────────────────────────────────────────┘
   ```

2. **Styling implementation** (ACTUAL):
   - CSS-in-JS with React style objects (NOT Tailwind)
   - CSS custom properties integration from theme system
   - Light/dark theme support via `dark` CSS class
   - Full-width chat messages (no max-width constraint)

3. **Fake conversation content** (✅ IMPLEMENTED):
   - 3 agents with distinct personalities and colors
   - 15 realistic messages about software architecture
   - Mix of user/agent/system message types
   - Some inactive messages (50% opacity)

## Detailed Implementation Requirements

### File Structure

- Create `apps/desktop/src/pages/DesignPrototype.tsx` (React component)
- Use existing Tailwind CSS setup from the desktop app
- Integrate with existing Electron app routing to view within the actual interface

### React Component Structure

- Create React functional component with JSX returning the interface layout
- Use plain HTML div elements with Tailwind classes for structure
- Left sidebar with conversation list (plain HTML structure)
- Main content area with agent labels bar, chat area, and input section
- Focus on HTML/CSS layout over React component logic - minimal state/props
- Apply Tailwind responsive classes (sm:, md:, lg:) for different screen sizes

### Agent Labels Bar

- Pills/badges using simple div elements styled with Tailwind classes for "Agent Name | Role" format
- Unique background colors for each agent using custom CSS variables + Tailwind bg utilities
- Visual "thinking" indicators (pulsing dots) using Tailwind animate-pulse
- Add agent button (+) using plain HTML button element with Tailwind styling and plus icon

### Chat Messages Area

- Scrollable container using plain HTML div with Tailwind overflow-y-auto
- Message format: `[Agent Name | Role] ─ 2:34 PM` using Tailwind typography classes
- Different message types using simple div elements with Tailwind styling:
  - User messages (distinct styling with Tailwind background/border classes)
  - Agent messages (color-coded by agent using CSS variables + Tailwind classes)
  - System messages (gray, italic using Tailwind text-gray-500 italic)
- Active/inactive message states using Tailwind opacity-50 for inactive messages
- Message collapse/expand indicators using Tailwind transitions
- Hover actions using plain HTML buttons with Tailwind styling for icons

### Input Area

- Multi-line text area using plain HTML textarea element with Tailwind styling and proper sizing
- Submit button (paper plane icon) using plain HTML button element with Tailwind styling and icon
- Mode toggle switch "Manual | Auto" using simple styled HTML elements with Tailwind
- Disabled state styling using Tailwind disabled: variants

### Theme Toggle (Prototype Only)

- Add a light/dark mode toggle button in the top-right corner of the interface
- Use plain HTML button element with Tailwind styling and sun/moon icon to indicate current theme
- Position near window controls for easy access during design review
- Include simple JavaScript or CSS-only toggle to switch between light/dark classes
- This is temporary for design iteration - will be moved to settings in final version

### Conversation Sidebar

- Use plain HTML div as the sidebar container with Tailwind styling
- List of conversations using plain HTML list elements with timestamps
- Current conversation highlight using Tailwind background/border utilities
- New conversation button at bottom using plain HTML button element with Tailwind styling
- Collapsible functionality using simple CSS classes and minimal JavaScript

### Theme Support

- Implement both light and dark mode using Tailwind's dark: modifier classes
- Integrate CSS custom properties from style.css with Tailwind utilities
- Use Tailwind's built-in dark mode support for all styling
- Include functional theme toggle button for easy switching during design review
- Test both themes for readability and contrast using accessible color combinations

### Fake Content Requirements

- At least 15-20 messages to demonstrate scrolling
- 3 different agents with distinct personalities:
  - Technical Advisor (blue): Technical implementation details
  - Project Manager (green): Timeline and coordination focus
  - Creative Director (purple): Creative vision and user experience
- Mix of short and long messages (some requiring collapse)
- Include some inactive messages (faded)
- Add system messages for agent joins/skips
- Show realistic conversation flow about a software project

## Acceptance Criteria

1. **Visual Accuracy**: Matches ASCII mockup layout proportions and structure
2. **Design System Compliance**: Uses CSS variables from style.css with Tailwind utilities correctly
3. **Theme Support**: Both light and dark modes render properly with functional toggle button
4. **Content Scrolling**: Chat area scrolls smoothly with 15-20+ messages
5. **Responsive Behavior**: Layout adapts using Tailwind responsive breakpoints appropriately
6. **Message Variety**: Shows all different message types and states clearly
7. **Agent Distinction**: Each agent has unique, easily distinguishable styling
8. **Typography**: Proper font sizes, weights, and spacing throughout
9. **Interactive Elements**: HTML elements have proper hover/focus states with Tailwind styling
10. **Accessibility**: Semantic HTML structure with proper contrast ratios

## Notes

- This is a React component that renders within the Electron app for design iteration
- Focus on visual layout using plain HTML and Tailwind CSS
- Minimal React logic - just return JSX with static content for design purposes
- Use existing project setup for Tailwind CSS rather than standalone files
- Keep implementation simple - prioritize rapid design iteration over component architecture
- Use realistic content that demonstrates the product's multi-agent capabilities
- This serves as the design reference for future proper React component development
- **DO NOT attempt to execute or run the desktop app** - only create the component files
- **Theme toggle is temporary**: Will be removed and moved to settings in final implementation
- **After completing the implementation, ask the user to verify the changes before marking the task as complete**

## Implementation Notes

Use plain HTML elements with Tailwind CSS styling throughout:

- Use `<div>` elements for layout containers and structure
- Use `<button>` elements for interactive actions
- Use `<textarea>` for message input field
- Use `<ul>` and `<li>` for conversation lists
- Use semantic HTML where appropriate for accessibility
- Apply Tailwind utility classes for all styling needs

## NEXT DEVELOPER INSTRUCTIONS

**For Message Toggle Implementation:**

1. **DO NOT use useState inside map function** - This violates React Rules of Hooks
2. **Proper approach**: Track hover/toggle state at component level, not per message in map
3. **State management**: Convert messages to state with setMessages, implement toggleMessageActive function
4. **UI Pattern**: Show checkbox on hover, 50% opacity for inactive (already working)
5. **Always verify**: Ask user to test before marking complete

**Files to Modify:**

- `apps/desktop/src/pages/DesignPrototype.tsx` - Main implementation file
- No other files should need changes

**Quality Requirements:**

- Run `pnpm quality` - All linting/type-checking must pass
- Test both light/dark themes
- Verify no blank screens or React errors

### Log

**2025-07-23**: Initial implementation completed - core interface working with theme toggle and full-width chat
**2025-07-23**: User requested message toggle functionality - FAILED due to React hook violations, reverted to working state
**2025-07-23**: Task updated with comprehensive status for next developer - READY for proper message toggle implementation

**2025-07-23T19:11:14.125910Z** - Completed comprehensive UI design iteration for main conversation interface with advanced UX features including message context toggles, long message collapse/expand, context menus for messages and conversations, and collapsible sidebar with smooth animations.

- filesChanged: ["apps/desktop/src/pages/DesignPrototype.tsx", "packages/eslint-config/react.js", "packages/eslint-config/package.json"]
