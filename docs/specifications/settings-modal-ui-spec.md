# Settings Modal UI Specification

## Overview

The Settings modal provides a centralized interface for configuring all aspects of AI Collaborators. It uses a two-panel layout with navigation on the left and content on the right.

## Modal Container

### Dimensions and Positioning

- **Width**: 80% of viewport width, max 1000px, min 800px
- **Height**: 80% of viewport height, max 700px, min 500px
- **Position**: Centered both horizontally and vertically
- **Z-index**: Above all other content with semi-transparent overlay
- **Border radius**: 8px
- **Shadow**: 0 10px 25px rgba(0, 0, 0, 0.3)

### Modal Structure

```
┌─────────────────────────────────────────────────────────┐
│ Settings                                           [×]   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┬───────────────────────────────────┐ │
│ │                 │                                   │ │
│ │  Navigation     │      Content Area                 │ │
│ │    Panel        │                                   │ │
│ │                 │                                   │ │
│ │                 │                                   │ │
│ └─────────────────┴───────────────────────────────────┘ │
│                                    [Cancel] [Save]       │
└─────────────────────────────────────────────────────────┘
```

### Header

- **Height**: 50px
- **Background**: Slightly darker than content area
- **Title**: "Settings" - 18px font, left-aligned with 20px padding
- **Close button**: Standard × button, right-aligned, 40x40px hover area

### Footer

- **Height**: 60px
- **Background**: Same as header
- **Border-top**: 1px solid border color
- **Buttons**: Right-aligned with 20px padding
  - Cancel button: Secondary style
  - Save button: Primary style, disabled when no changes
  - Button spacing: 10px between buttons

## Navigation Panel (Left)

### Dimensions

- **Width**: 200px fixed
- **Background**: Slightly different from content area for visual separation
- **Border-right**: 1px solid border color
- **Padding**: 10px

### Navigation Items

Each item is a clickable row with:

- **Height**: 40px
- **Padding**: 12px horizontal, centered vertical
- **Border-radius**: 4px
- **States**:
  - Default: No background
  - Hover: Light background tint
  - Active: Darker background, accent color left border (3px)
  - With unsaved changes: Dot indicator after label

### Navigation Structure

1. **General**
2. **API Keys**
3. **Appearance**
4. **Agents** (with sub-navigation)
5. **Personalities** (with sub-navigation)
6. **Roles** (with sub-navigation)
7. **Advanced**

## Content Area (Right)

### Layout

- **Padding**: 30px
- **Scrollable**: Vertical scroll when content exceeds height
- **Max content width**: 600px (centered if panel is wider)

### Content Organization

Each section follows this pattern:

1. **Section Title**: 24px font, margin-bottom 20px
2. **Section Description**: 14px, gray text, margin-bottom 30px
3. **Form Groups**: Organized subsections with related settings

### Form Group Structure

```
Form Group Title (16px, semi-bold)
├─ Form Group Description (13px, gray)
├─ Setting Item 1
├─ Setting Item 2
└─ Setting Item 3
```

## Section Specifications

### 1. General Section

**Auto Mode Settings**

- Response Delay
  - Label: "Response Delay"
  - Slider: 1-30 seconds
  - Current value display: "5 seconds"
  - Helper text: "Time between agent responses in auto mode"

- Maximum Messages
  - Label: "Maximum Messages (Auto Mode)"
  - Number input: 0-500 (0 = unlimited)
  - Helper text: "Stop auto mode after this many messages"

- Maximum Wait Time
  - Label: "Maximum Wait Time"
  - Number input: 5-120 seconds
  - Helper text: "Maximum time to wait for agent response"

**Conversation Defaults**

- Default Mode
  - Label: "Default Conversation Mode"
  - Radio buttons: Manual / Auto
- Maximum Agents
  - Label: "Maximum Agents per Conversation"
  - Number input: 1-8
  - Helper text: "Limit the number of agents in a conversation"

**Other Settings**

- Check for Updates
  - Toggle switch: "Automatically check for updates"
  - Helper text: "Check for new versions on startup"

### 2. API Keys Section

**Provider Subsections**
Each provider gets its own subsection:

```
OpenAI
├─ API Key: [••••••••••••••••] [Show] [Test]
├─ Status: ✓ Connected
└─ Base URL: [https://api.openai.com/v1] (Advanced)

Anthropic
├─ API Key: [Not configured] [Add] [Test]
├─ Status: ✗ Not connected
└─ Base URL: [https://api.anthropic.com/v1] (Advanced)
```

**Components**:

- Password input field with show/hide toggle
- Test button: 80px, secondary style
- Status indicator: Icon + text (green check or red x)
- Base URL: Collapsed by default, expandable for advanced users

### 3. Appearance Section

**Theme Settings**

- Theme Selection
  - Label: "Theme"
  - Radio buttons arranged vertically:
    - ( ) Light
    - ( ) Dark
    - (•) System
  - Preview area: 200x100px showing theme colors

**Display Settings**

- Message Timestamps
  - Label: "Show Timestamps"
  - Radio buttons: Always / On Hover / Never

- Conversation List
  - Toggle: "Show last activity time"
  - Toggle: "Compact conversation list"

**Chat Display**

- Font Size
  - Label: "Message Font Size"
  - Slider: 12px - 18px
  - Live preview text below slider

- Message Spacing
  - Label: "Message Spacing"
  - Radio buttons: Compact / Normal / Relaxed

### 4. Agents Section (with sub-nav)

**Sub-navigation tabs**:

```
[Library] [Templates] [Defaults]
```

**Library Tab**:

- Search bar: "Search agents..."
- Agent list (scrollable):
  ```
  ┌────────────────────────────────┐
  │ 🤖 Technical Advisor          │
  │    GPT-4 • Technical Expert   │
  │                    [Edit] [×] │
  ├────────────────────────────────┤
  │ 💡 Creative Director          │
  │    Claude • Creative Role     │
  │                    [Edit] [×] │
  └────────────────────────────────┘
  ```
- Empty state: "No agents configured. Create your first agent!"
- Add button: "+ Create New Agent" (primary button at bottom)

**Templates Tab**:

- Pre-configured agent templates in card layout
- Each card: Icon, name, description, "Use Template" button

**Defaults Tab**:

- Default Temperature: Slider 0-2
- Default Max Tokens: Number input
- Default Top P: Slider 0-1

### 5. Personalities Section (with sub-nav)

**Sub-navigation tabs**:

```
[Saved] [Create New]
```

**Saved Tab**:

- List of saved personalities with preview:
  ```
  ┌────────────────────────────────┐
  │ The Analyst                    │
  │ O:70 C:85 E:40 A:45 N:30     │
  │                 [Edit] [Clone] │
  ├────────────────────────────────┤
  │ Friendly Helper                │
  │ O:60 C:70 E:80 A:90 N:20     │
  │                 [Edit] [Clone] │
  └────────────────────────────────┘
  ```

**Create New Tab**:

- Name input: "Personality Name"
- Big Five Sliders (each with value display):
  - Openness (0-100)
  - Conscientiousness (0-100)
  - Extraversion (0-100)
  - Agreeableness (0-100)
  - Neuroticism (0-100)
- Behavior Sliders (collapsible section):
  - All 14 behavior sliders
- Custom Instructions: Textarea (4 rows)
- Save button at bottom

### 6. Roles Section (with sub-nav)

**Sub-navigation tabs**:

```
[Predefined] [Custom]
```

**Predefined Tab**:

- Grid of predefined roles (2 columns):
  ```
  ┌─────────────┐ ┌─────────────┐
  │ 📊 Analyst  │ │ 💼 Manager  │
  │ Data-driven │ │ Organized   │
  └─────────────┘ └─────────────┘
  ```
- Each card shows: Icon, name, brief description
- Non-editable, but shows "View Details" on hover

**Custom Tab**:

- List of custom roles
- Add button: "+ Create Custom Role"
- Each role shows:
  - Name
  - First line of description
  - Edit and Delete buttons

### 7. Advanced Section

**Data Management**

- Export Settings
  - Button: "Export All Settings"
  - Helper text: "Export settings as JSON file"

- Import Settings
  - Button: "Import Settings"
  - Helper text: "Import settings from JSON file"

- Clear Data
  - Button: "Clear All Conversations" (danger style)
  - Helper text: "This cannot be undone"

**Developer Options**

- Debug Mode
  - Toggle: "Enable debug logging"
  - Helper text: "Show detailed logs in developer console"

- Experimental Features
  - Toggle: "Enable experimental features"
  - Warning text in amber: "May cause instability"

## Interactive States

### Unsaved Changes

- Dot indicator on navigation item
- Save button becomes enabled
- Cancel button shows confirmation if clicked with unsaved changes

### Loading States

- Test buttons show spinner when testing
- Disable interaction during save

### Validation

- Invalid inputs show red border
- Error message appears below field
- Save button disabled until valid

### Empty States

Each list/grid shows appropriate empty state:

- Friendly icon
- Descriptive message
- Clear call-to-action

## Responsive Behavior

### Narrow Screens (< 1000px)

- Modal takes 95% width
- Navigation panel becomes 180px
- Content area padding reduces to 20px

### Very Narrow (< 800px)

- Navigation becomes collapsible hamburger menu
- Full width content area when navigation hidden

## Keyboard Navigation

- **Tab**: Navigate through form elements
- **Arrow keys**: Navigate between navigation items
- **Enter**: Activate focused button/link
- **Escape**: Close modal (with unsaved changes warning)
- **Cmd/Ctrl + S**: Save changes

## Theme Considerations

### Light Mode

- Background: White/very light gray
- Borders: Light gray
- Text: Dark gray/black
- Accent: Blue for active states

### Dark Mode

- Background: Dark gray/black
- Borders: Medium gray
- Text: Light gray/white
- Accent: Blue for active states

## Accessibility

- All interactive elements have focus states
- Proper ARIA labels for screen readers
- Sufficient color contrast ratios
- Clear visual hierarchy
- Logical tab order
