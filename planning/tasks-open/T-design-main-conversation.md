---
kind: task
id: T-design-main-conversation
title: Design main conversation interface UI mockup
status: open
priority: high
prerequisites: []
created: "2025-07-22T23:33:50.805287"
updated: "2025-07-22T23:33:50.805287"
schema_version: "1.1"
---

Create a React page with plain HTML/CSS styling (or shadcn components) for the main conversation interface within the Electron app. This is a design iteration focused on visual layout and styling for rapid prototyping - the final design will later be converted to proper React components.

## Context

This task implements the core conversation interface described in the desktop UX specification ASCII mockup. The interface consists of a sidebar for conversations, an agent labels bar, a scrollable chat messages area, and an input area. We're creating a React page that renders within the actual Electron app interface but uses simple HTML/CSS or shadcn components for quick design iteration.

Key documentation references:

- `/Users/zach/code/fishbowl/docs/specifications/desktop-ux-specification.md` - ASCII mockup and detailed UI specification
- `/Users/zach/code/fishbowl/docs/specifications/style.css` - Design system with CSS variables
- `/Users/zach/code/fishbowl/docs/specifications/feature-stories-v0.md` - Acceptance criteria for UI elements
- `/Users/zach/code/fishbowl/docs/fishbowl-product-description.md` - Product context and features
- `/Users/zach/code/fishbowl/docs/specifications/chat-room-mechanics-spec.md` - Message types and states

## Technical Approach

1. **Create HTML structure** matching the ASCII layout:

   ```
   ┌────────────────────────────────────────────────────────────┐
   │ [≡] AI Collaborators                              [─][□][×]│
   ├──────────────┬─────────────────────────────────────────────┤
   │              │ [Agent Labels Bar]                          │
   │[Conversations│─────────────────────────────────────────────│
   │ Sidebar]     │                                             │
   │              │           Chat Messages Area                │
   │ - Chat 1     │ [Agent msg]                                 │
   │ - Chat 2     │                                  [User msg] │
   │ + New Chat   │─────────────────────────────────────────────│
   │              │  [Input Area]                               │
   └──────────────┴─────────────────────────────────────────────┘
   ```

2. **Implement styling using latest Tailwind CSS v4 and shadcn/ui components** with design system integration:
   - Use latest shadcn/ui components for consistent, accessible UI elements (Button, Input, Textarea, Sidebar, etc.)
   - Apply Tailwind utility classes for rapid prototyping and layout
   - Integrate CSS custom properties from style.css for colors, shadows, fonts
   - Support both light and dark themes via Tailwind's dark mode classes
   - Leverage Tailwind's responsive utilities for layout adaptations

3. **Create fake conversation content** with:
   - Multiple agents with different colored labels (Technical Advisor, Project Manager, Creative Director)
   - Mix of user and agent messages
   - Long messages demonstrating scrolling
   - Different message types (regular, system messages)
   - Active/inactive message states (50% opacity for inactive)

4. **Implement responsive design**:
   - Sidebar collapses on narrow windows
   - Chat area maintains readable width (max ~800px centered)
   - Minimum window size considerations

## Detailed Implementation Requirements

### File Structure

- Create `apps/desktop/src/pages/DesignPrototype.tsx` (React component)
- Create associated styling files or use existing Tailwind/shadcn setup
- Integrate with existing Electron app routing to view within the actual interface
- Use the existing shadcn/ui setup in the desktop app
- Ensure using current shadcn/ui component versions from the project

### React Component Structure

- Create React functional component with JSX returning the interface layout
- Use plain div elements with Tailwind classes or shadcn/ui components for structure
- Left sidebar with conversation list (plain HTML structure or shadcn Sidebar)
- Main content area with agent labels bar, chat area, and input section
- Focus on HTML/CSS layout over React component logic - minimal state/props
- Apply Tailwind responsive classes (sm:, md:, lg:) for different screen sizes

### Agent Labels Bar

- Pills/badges using simple div elements styled with Tailwind classes for "Agent Name | Role" format
- Unique background colors for each agent using custom CSS variables + Tailwind bg utilities
- Visual "thinking" indicators (pulsing dots) using Tailwind animate-pulse
- Add agent button (+) using shadcn/ui Button component with plus icon

### Chat Messages Area

- Scrollable container using shadcn/ui Scroll-area component
- Message format: `[Agent Name | Role] ─ 2:34 PM` using Tailwind typography classes
- Different message types using simple div elements with Tailwind styling:
  - User messages (distinct styling with Tailwind background/border classes)
  - Agent messages (color-coded by agent using CSS variables + Tailwind classes)
  - System messages (gray, italic using Tailwind text-muted-foreground italic)
- Active/inactive message states using Tailwind opacity-50 for inactive messages
- Message collapse/expand indicators using Tailwind transitions
- Hover actions using shadcn/ui Button variants (ghost/outline) for icons with shadcn/ui Tooltip

### Input Area

- Multi-line text area using shadcn/ui Textarea component with proper sizing
- Submit button (paper plane icon) using shadcn/ui Button component with icon
- Mode toggle switch "Manual | Auto" using simple styled elements (shadcn/ui doesn't have Switch component)
- Disabled state styling using Tailwind disabled: variants

### Theme Toggle (Prototype Only)

- Add a light/dark mode toggle button in the top-right corner of the interface
- Use shadcn/ui Button component with sun/moon icon to indicate current theme
- Position near window controls for easy access during design review
- Include simple JavaScript or CSS-only toggle to switch between light/dark classes
- This is temporary for design iteration - will be moved to settings in final version

### Conversation Sidebar

- Use shadcn/ui Sidebar component as the container
- List of conversations using shadcn/ui Navigation Menu with timestamps
- Current conversation highlight using Tailwind background/border utilities
- New conversation button at bottom using shadcn/ui Button component
- Collapsible functionality built into Sidebar component

### Theme Support

- Implement both light and dark mode using Tailwind's dark: modifier classes and shadcn/ui theme system
- Integrate CSS custom properties from style.css with shadcn/ui component theming
- Use shadcn/ui components' built-in dark mode support alongside Tailwind utilities
- Include functional theme toggle button for easy switching during design review
- Test both themes for readability and contrast using shadcn/ui's accessible color system

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
2. **Design System Compliance**: Uses CSS variables from style.css with shadcn/ui components correctly
3. **Theme Support**: Both light and dark modes render properly with functional toggle button
4. **Content Scrolling**: Chat area scrolls smoothly with 15-20+ messages
5. **Responsive Behavior**: Layout adapts using Tailwind responsive breakpoints appropriately
6. **Message Variety**: Shows all different message types and states clearly
7. **Agent Distinction**: Each agent has unique, easily distinguishable styling
8. **Typography**: Proper font sizes, weights, and spacing throughout
9. **Interactive Elements**: shadcn/ui components have proper hover/focus states and accessibility
10. **Accessibility**: Semantic HTML structure with proper contrast ratios

## Notes

- This is a React component that renders within the Electron app for design iteration
- Focus on visual layout using plain HTML/CSS or simple shadcn components
- Minimal React logic - just return JSX with static content for design purposes
- Use existing project setup for Tailwind/shadcn rather than standalone files
- Keep implementation simple - prioritize rapid design iteration over component architecture
- Use realistic content that demonstrates the product's multi-agent capabilities
- This serves as the design reference for future proper React component development
- Test within the actual Electron app interface to see real proportions and behavior
- **Theme toggle is temporary**: Will be removed and moved to settings in final implementation

## Recommended shadcn/ui Components for this Task

Based on current documentation:

- **Sidebar**: Main container for conversation list
- **Scroll-area**: For scrollable chat messages and conversation list
- **Button**: For submit button, add agent button, conversation actions
- **Input/Textarea**: For message input field
- **Navigation Menu**: For conversation list navigation
- **Tooltip**: For hover actions on messages
- **Avatar**: For user/agent profile pictures (if desired)

Keep it simple - use plain HTML/CSS with Tailwind for everything else.

### Log
