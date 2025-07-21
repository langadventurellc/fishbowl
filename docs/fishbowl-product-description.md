# Fishbowl AI - Product Features Documentation

## Product Overview

Fishbowl AI is a desktop and mobile application that enables users to create and manage conversations with multiple AI agents simultaneously. Each agent can have unique personalities, specialized roles, and connect to different AI services, creating a dynamic environment for brainstorming, problem-solving, and creative exploration.

## Core Features

### Multi-Agent Conversations

#### Simultaneous Agent Participation

- Create conversations with multiple AI agents participating at the same time
- Each agent maintains its own context and perspective within the conversation
- Agents can see and respond to messages from other agents, not just the user
- No fixed limit on the number of agents in a single conversation (configurable maximum)

#### Agent Awareness

- Agents are aware of other participants in the conversation
- Each message clearly identifies which agent or user sent it
- Agents can reference and respond to specific messages from other agents
- Conversation history includes all participants' contributions

### Agent Configuration

#### Personality System

- **Big Five Personality Model**: Configure agents using five core personality dimensions
  - Openness: Creativity and willingness to explore new ideas
  - Conscientiousness: Attention to detail and methodical approach
  - Extraversion: Verbosity and enthusiasm in responses
  - Agreeableness: Supportiveness versus critical analysis
  - Neuroticism: Confidence versus cautiousness in responses

- **Behavioral Traits**: Fine-tune agent behavior with additional sliders
  - Formality: Professional to casual communication style
  - Humor: Serious to playful responses
  - Assertiveness: Suggestive to directive communication
  - Empathy: Logical to emotionally aware responses
  - Storytelling: Factual to narrative-driven explanations
  - Brevity: Concise to detailed responses
  - Imagination: Practical to creative suggestions
  - Playfulness: Task-focused to spontaneous interactions
  - Dramaticism: Matter-of-fact to theatrical expressions
  - Analytical Depth: Surface-level to comprehensive analysis
  - Contrarianism: Consensus-building to challenging assumptions
  - Encouragement: Neutral to supportive feedback
  - Curiosity: Direct answers to exploratory questions
  - Patience: Direct to accommodating explanations

- **Custom Instructions**: Override or augment personality settings with free-form text instructions
- **Personality Templates**: Save and reuse custom personality configurations
- **Predefined Personalities**: Quick-start templates like "The Innovator", "The Critic", "The Mentor"

#### Role System

- **Specialized Expertise**: Assign specific roles that define an agent's area of focus
- **Predefined Roles**: Ready-to-use roles including:
  - Project Manager: Focus on timelines and coordination
  - Technical Advisor: Provide technical expertise
  - Creative Director: Guide creative vision
  - Storyteller: Craft narratives and engaging content
  - Analyst: Data-driven insights and logical reasoning
  - Coach: Personal development and goal achievement
  - Critic: Identify weaknesses and potential issues
  - Business Strategist: Market and business insights
  - Financial Advisor: Financial planning guidance
  - Generalist: Versatile contributor

- **Custom Roles**: Create entirely new roles with custom system prompts
- **Role-Specific Behaviors**: Each role includes tailored interaction patterns and focus areas

#### Model Selection

- **Multiple AI Providers**: Connect to different AI services (OpenAI, Anthropic, Google, etc.)
- **Model Choice**: Select specific models from each provider
- **Per-Agent Configuration**: Each agent can use a different AI model
- **Parameter Control**: Adjust temperature, max tokens, and other model-specific settings
- **Provider Management**: Add, test, and manage API connections

### Conversation Modes

#### Manual Mode

- **Response Preview**: See all agent responses before they're added to the conversation
- **Selective Inclusion**: Choose which agent responses to include
- **Response Comparison**: View multiple perspectives side-by-side
- **Message Control**: Full control over conversation flow
- **Edit Capability**: Modify your own messages before sending

#### Auto Mode

- **Automatic Turn-Taking**: Agents respond in sequence without manual intervention
- **Intelligent Participation**: Agents evaluate whether they have valuable input
- **Skip Detection**: Agents can skip their turn if nothing relevant to add
- **Configurable Delays**: Set time between agent responses
- **Stop Conditions**: Automatic stopping when all agents skip or message limit reached
- **Pause/Resume**: Interrupt and continue auto mode at any time

#### @ Mention System

- **Directed Questions**: Use @AgentName to direct questions to specific agents
- **Queue Management**: Mentioned agents get priority in response order
- **Multiple Mentions**: Can mention multiple agents in one message
- **Agent-to-Agent**: Agents can mention each other for clarification
- **Natural Flow**: After mentioned agent responds, normal turn order resumes

### Message Management

#### Message States

- **Active/Inactive Toggle**: Mark any message as active or inactive
- **Visual Distinction**: Inactive messages appear with reduced opacity
- **Context Control**: Only active messages are included in agent context
- **Retroactive Editing**: Change message states at any time
- **Bulk Management**: Select multiple messages to activate/deactivate

#### Message Features

- **Timestamps**: Track when each message was sent
- **Copy Function**: Easy copying of message content
- **Collapse/Expand**: Minimize long messages to show only first line
- **Hover Actions**: Quick access to message functions
- **Message Threading**: Visual connection between related messages

### Conversation Management

#### Organization

- **Multiple Conversations**: Maintain numerous separate conversations
- **Easy Switching**: Quick navigation between conversations
- **Rename Capability**: Update conversation titles as needed
- **Delete Function**: Remove conversations when no longer needed
- **Last Activity Tracking**: See when conversations were last active

#### Persistence

- **Auto-Save**: All conversations automatically saved
- **Full History**: Complete conversation history preserved
- **State Preservation**: Agent configurations saved with conversations
- **Resume Anywhere**: Pick up conversations exactly where left off

### Agent Management

#### Real-Time Control

- **Add/Remove Agents**: Modify agent lineup during conversations
- **Pause Participation**: Temporarily disable specific agents
- **Visual Indicators**: See which agents are active, thinking, or paused
- **Color Coding**: Each agent has a unique color for easy identification
- **Status Display**: Real-time status updates for each agent

#### Agent Library

- **Save Configurations**: Store commonly used agent setups
- **Quick Deploy**: Add pre-configured agents to new conversations
- **Template Management**: Organize and maintain agent templates
- **Configuration Copying**: Duplicate existing agents with modifications

### Context Management

#### Token Awareness

- **Usage Display**: See current token consumption
- **Limit Warnings**: Alerts when approaching context limits
- **Active Message Count**: Track tokens for active messages only
- **Model Limits**: Respect each AI model's context window

#### Context Optimization

- **Selective History**: Use message active/inactive states to manage context
- **Smart Truncation**: Intelligent handling of long conversations
- **Priority Preservation**: Keep most relevant messages in context

### User Interface

#### Visual Design

- **Theme Support**: Light and dark mode options
- **System Integration**: Follow system theme preferences
- **Responsive Layout**: Adapts to different window sizes
- **Accessibility**: Keyboard navigation and screen reader support

#### Layout Elements

- **Conversation Sidebar**: Easy access to all conversations
- **Agent Label Bar**: Visual representation of active agents
- **Chat Area**: Central space for conversation display
- **Input Area**: Multiline text input with formatting preview
- **Settings Modal**: Comprehensive configuration interface

### Settings & Configuration

#### API Management

- **Secure Storage**: Safe storage of API credentials
- **Connection Testing**: Verify API connections before use
- **Multiple Providers**: Support for various AI service providers
- **Usage Tracking**: Monitor API usage and costs

#### Customization Options

- **Interface Preferences**: Adjust UI elements to preference
- **Behavior Defaults**: Set default settings for new agents
- **Conversation Defaults**: Configure default conversation settings
- **Keyboard Shortcuts**: Quick access to common functions

### Advanced Features

#### Conversation Intelligence

- **Smart Turn-Taking**: Agents respond based on relevance
- **Context Awareness**: Agents understand conversation flow
- **Inter-Agent Dynamics**: Agents can build on each other's ideas
- **Conflict Resolution**: Agents can respectfully disagree and debate

#### Workflow Optimization

- **Quick Start**: Begin conversations with minimal setup
- **Batch Operations**: Manage multiple agents efficiently
- **Preset Scenarios**: Common agent combinations for specific tasks
- **Conversation Templates**: Reusable conversation structures

### Export & Sharing

#### Data Portability

- **Conversation Export**: Save conversations in standard formats
- **Configuration Export**: Share agent and personality settings
- **Import Capability**: Load exported configurations
- **Cross-Device Sync**: Maintain consistency across devices

### Performance Features

#### Optimization

- **Streaming Responses**: See agent responses as they generate
- **Efficient Updates**: Smooth UI performance with many messages
- **Resource Management**: Intelligent handling of system resources
- **Background Processing**: Non-blocking operations for better responsiveness

#### Reliability

- **Error Recovery**: Graceful handling of API failures
- **Rate Limit Management**: Intelligent request distribution
- **Offline Capability**: Access existing conversations without internet
- **Auto-Recovery**: Resume interrupted operations automatically

### Privacy & Security

#### Data Protection

- **Local Storage**: Conversations stored on user's device
- **Encrypted Credentials**: Secure storage of sensitive information
- **No Cloud Dependency**: Full functionality without cloud services
- **User Control**: Complete control over data retention

#### API Security

- **Credential Isolation**: API keys never exposed to UI
- **Secure Communication**: Protected communication with AI services
- **Provider Isolation**: Credentials separated by provider
- **Access Control**: Fine-grained control over API usage

## Use Case Examples

### Creative Writing

- Multiple agents with different creative perspectives
- Storyteller for narrative, Critic for feedback, Editor for refinement
- Collaborative story development with diverse viewpoints

### Technical Problem Solving

- Technical Advisor for implementation details
- Architect for system design
- Project Manager for practical constraints
- Analyst for performance considerations

### Business Strategy

- Business Strategist for market analysis
- Financial Advisor for budget considerations
- Marketing Expert for go-to-market strategy
- Risk Analyst for potential challenges

### Personal Development

- Coach for motivation and goal-setting
- Analyst for progress tracking
- Mentor for wisdom and guidance
- Challenger for pushing boundaries

### Educational Exploration

- Teacher for explanations
- Student for questions
- Expert for deep knowledge
- Simplifier for accessibility

## Future Extensibility

### Planned Capabilities

- Mobile device support for on-the-go access
- Tool integration for agents to perform actions
- Document collaboration with multi-agent editing
- Project management with agent task assignment
- Advanced memory systems for long-term agent knowledge
- Community sharing of agent configurations
- Voice interaction capabilities
- Visual content generation and analysis

### Platform Evolution

- Desktop application as primary platform
- Mobile applications for iOS and Android
- Potential web access for limited functionality
- Cross-platform synchronization
- Offline-first architecture with sync capabilities
