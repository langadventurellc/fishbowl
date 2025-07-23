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

Create a static HTML/CSS prototype of the main conversation interface for the Fishbowl AI desktop application. This is a design iteration focused solely on visual layout and styling without any interactivity.

## Context

This task implements the core conversation interface described in the desktop UX specification ASCII mockup. The interface consists of a sidebar for conversations, an agent labels bar, a scrollable chat messages area, and an input area. We're prototyping with plain HTML/CSS to nail down the visual design before implementing React components.

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
   │              │  [Agent Labels Bar]                         │
   │[Conversations│  ┌──────────────────────────────────────┐   │
   │ Sidebar]     │  │                                      │   │
   │              │  │         Chat Messages Area           │   │
   │ - Chat 1     │  │                                      │   │
   │ - Chat 2     │  │                                      │   │
   │ + New Chat   │  └──────────────────────────────────────┘   │
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

- Create `apps/desktop/src/ui-prototype/conversation-interface.html`
- Create `apps/desktop/src/ui-prototype/styles.css` (imports style.css + Tailwind utilities)
- Include latest Tailwind CSS v4 via CDN or local build for rapid iteration
- Include latest shadcn/ui component CSS/JS or copy relevant component styles for standalone prototype
- Ensure using current shadcn/ui component versions from https://ui.shadcn.com/docs/components

### HTML Structure

- Window frame with title bar using basic div elements and Tailwind layout classes
- Left sidebar using shadcn/ui Sidebar component with Scroll-area for conversation list
- Main content area with agent labels bar, chat area, and input section
- Use semantic HTML elements with shadcn/ui components and Tailwind styling for accessibility
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

- This is primarily a visual design prototype with minimal JavaScript for theme toggle only
- **Use latest versions**: Ensure Tailwind CSS v4 and current shadcn/ui components from https://ui.shadcn.com/docs/components
- Focus on rapid iteration using shadcn/ui components with Tailwind utilities
- Keep implementation simple - use shadcn/ui components only where they add clear value
- Use realistic content that demonstrates the product's multi-agent capabilities
- Consider this the reference implementation for future React component development
- Leverage shadcn/ui's pre-built accessible components for consistent UI patterns
- Combine shadcn/ui components with custom styling using CSS variables from style.css
- Test in both light and dark modes using the prototype theme toggle
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
