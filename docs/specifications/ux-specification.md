# User Interface (UX) Specification

## Overview
The application provides a desktop chat interface for multi-agent AI collaboration. The design emphasizes clarity, ease of use, and efficient management of multiple AI agents in conversations.

## Main Application Layout

### Window Structure
```
┌─────────────────────────────────────────────────────────┐
│ [≡] AI Collaborators                              [─][□][×]│
├─────────────┬───────────────────────────────────────────┤
│             │  [Agent Labels Bar]                        │
│ Conversations│  ┌─────────────────────────────────────┐  │
│ Sidebar     │  │                                     │  │
│             │  │         Chat Messages Area          │  │
│ - Chat 1    │  │                                     │  │
│ - Chat 2    │  │                                     │  │
│ + New Chat  │  └─────────────────────────────────────┘  │
│             │  [Input Area]                              │
└─────────────┴───────────────────────────────────────────┘
```

### Responsive Design
- Sidebar collapses on narrow windows
- Chat area maintains readable width (max ~800px centered)
- Minimum window size: 600x400px

## Chat Room Interface

### Message Display
Each message shows:
```
[Agent Name | Role] ─ 2:34 PM
Message content goes here...
```

**Message Features:**
- **Color coding**: Each agent has a unique color matching their label
- **Timestamps**: Shown on right, visible on hover
- **Long message handling**: 
  - Messages over 3 lines show "Show more..." link
  - Click to expand/collapse
  - First line preview when collapsed
- **Hover actions**:
  - Copy message
  - Regenerate (manual mode only)
  - Delete message

### Agent Labels Bar
Located above chat area:
```
[Technical Advisor | Technical Advisor] [Project Manager | Project Manager] [+]
```

**Features:**
- Pills/badges with agent name and role
- Background color unique to each agent
- Hover shows [×] button to remove agent
- [+] button opens agent selector dropdown
- Visual indicator for agents currently "thinking" (pulsing dot)

### Input Area
**Components:**
- Multi-line text field (auto-expanding, max 5 lines)
- Submit button (paper plane icon)
- Mode toggle switch: "Manual | Auto"

**Behavior:**
- Enter sends message, Shift+Enter for new line
- Submit button disabled when empty
- In manual mode, shows pending agent responses above input

### Manual Mode Preview
When agents have responses ready:
```
┌─ Pending Agent Responses ────────────────────┐
│ ☑ [Technical Advisor]                        │
│   "Based on the requirements..."             │
│                                              │
│ ☐ [Project Manager]                          │
│   "What's the timeline for..."               │
└──────────────────────────────────────────────┘
```

**Features:**
- Stacked cards with checkboxes
- Shows first 2 lines of each response
- Click card to expand/collapse full message
- "Select All" / "Clear" buttons
- Selected messages added when user hits submit

## Conversation Sidebar

### Structure
```
Conversations
├─ 🗨 Project Planning (2h ago)
├─ 🗨 Creative Writing (Yesterday)
├─ 🗨 Code Review (Dec 15)
└─ + New Conversation
```

### Features
- **Collapsible**: Toggle button to hide/show
- **Conversation Items**:
  - Show title and last activity time
  - Right-click menu: Rename, Delete
  - Click to switch conversations
  - Current conversation highlighted
- **New Conversation**: Always at bottom

## Settings Modal

### Layout
```
┌─ Settings ─────────────────────────────────────┐
│ ┌──────────┬─────────────────────────────────┐ │
│ │ General   │  [Settings Content Area]       │ │
│ │ APIs      │                                 │ │
│ │ Agents    │                                 │ │
│ │ Personalities│                              │ │
│ │ Roles     │                                 │ │
│ └──────────┴─────────────────────────────────┘ │
│                            [Cancel] [Save]      │
└─────────────────────────────────────────────────┘
```

### Settings Sections

**General:**
- Theme: Light / Dark / System
- Auto mode response delay: [slider] 0-5 seconds
- Default conversation mode: Manual / Auto
- Message timestamp display: Always / On Hover

**APIs:**
- Provider sections (OpenAI, Anthropic, Google)
- API key input fields (password type)
- Test connection button per provider
- Base URL override (advanced)

**Agents:**
- List of configured agents
- Add/Edit/Delete buttons
- Agent configuration form:
  - Name, Role selection, Personality selection
  - Model provider and specific model
  - Temperature and other parameters

**Personalities:**
- List of saved personalities
- Create from template / Create custom
- Edit personality sliders and custom instructions
- Delete (with confirmation)

**Roles:**
- List of available roles
- Add custom role
- Edit role details
- Cannot delete predefined roles

## Visual Design

### Color Scheme
**Light Mode:**
- Background: #FFFFFF
- Surface: #F5F5F5  
- Text: #1A1A1A
- Borders: #E0E0E0
- Agent colors: Automatically assigned from palette

**Dark Mode:**
- Background: #1A1A1A
- Surface: #2D2D2D
- Text: #FFFFFF
- Borders: #404040
- Agent colors: Adjusted for dark backgrounds

### Typography
- System font stack
- Message text: 14px
- UI elements: 13px
- Monospace for code blocks

### Status Indicators
- **Loading**: Pulsing ellipsis (...) 
- **Error**: Red background with error message
- **Thinking**: Animated dots next to agent label
- **Queue (auto mode)**: "3 agents waiting..." indicator

## Keyboard Shortcuts

### Global
- **Cmd/Ctrl + N**: New conversation
- **Cmd/Ctrl + M**: Toggle Manual/Auto mode
- **Cmd/Ctrl + ,**: Open settings
- **Esc**: Close modals

### Chat
- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Cmd/Ctrl + K**: Clear conversation (with confirmation)

## Error States

### API Errors
Show inline in chat:
```
⚠️ [Technical Advisor] Failed to respond
Error: Rate limit exceeded. Please try again later.
[Retry]
```

### Connection Issues
Toast notification at bottom:
```
🔌 Connection lost. Attempting to reconnect...
```

## Empty States

### No Agents Selected
Center of chat area:
```
No agents selected
Add agents using the [+] button above to start collaborating
```

### New Conversation
```
Start a new conversation
Add agents and type a message to begin
```

## Implementation Notes

### State Management
- Conversation state persisted to SQLite
- UI state (sidebar visibility, theme) in preferences
- Agent responses cached until accepted/rejected

### Performance
- Virtual scrolling for long conversations
- Lazy load conversation history
- Debounce typing indicators

### Accessibility
- Full keyboard navigation
- Screen reader friendly labels
- High contrast mode support
- Focus indicators on all interactive elements