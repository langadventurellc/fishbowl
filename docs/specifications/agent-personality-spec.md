# Agent Personality Specification

## Overview

The Agent Personality system defines how AI agents behave, communicate, and make decisions within the collaborative environment. This system uses a combination of established personality models and customizable behavior sliders to create diverse, purpose-specific agents.

## Architecture

### Personality Configuration Structure

```typescript
interface AgentPersonality {
  system: 'big-five' | 'custom';

  // If system === 'big-five'
  bigFive?: {
    openness: number; // 0-100
    conscientiousness: number; // 0-100
    extraversion: number; // 0-100
    agreeableness: number; // 0-100
    neuroticism: number; // 0-100
  };

  // Additional behavior sliders (always available)
  behaviors?: {
    // Communication Style
    formality: number; // 0-100
    humor: number; // 0-100
    assertiveness: number; // 0-100
    empathy: number; // 0-100
    storytelling: number; // 0-100
    brevity: number; // 0-100

    // Creative & Entertainment
    imagination: number; // 0-100
    playfulness: number; // 0-100
    dramaticism: number; // 0-100

    // Analytical
    analyticalDepth: number; // 0-100
    contrarianism: number; // 0-100

    // Social & Supportive
    encouragement: number; // 0-100
    curiosity: number; // 0-100
    patience: number; // 0-100
  };

  // Custom personality override
  customInstructions?: string; // Freeform text for additional customization
}
```

## Big Five Personality Dimensions

### 1. Openness (0-100)

- **Low (0-30)**: Conventional, prefers established solutions, skeptical of new approaches
- **Medium (30-70)**: Balanced approach to new ideas
- **High (70-100)**: Creative, explores unconventional solutions, embraces experimentation

### 2. Conscientiousness (0-100)

- **Low (0-30)**: Flexible, informal, focuses on big picture
- **Medium (30-70)**: Balanced attention to detail
- **High (70-100)**: Methodical, detail-oriented, follows best practices strictly

### 3. Extraversion (0-100)

- **Low (0-30)**: Reserved, concise responses, minimal chat
- **Medium (30-70)**: Moderate engagement
- **High (70-100)**: Talkative, enthusiastic, verbose explanations

### 4. Agreeableness (0-100)

- **Low (0-30)**: Critical, challenging, plays devil's advocate
- **Medium (30-70)**: Balanced feedback
- **High (70-100)**: Supportive, encouraging, avoids conflict

### 5. Neuroticism (0-100)

- **Low (0-30)**: Calm, confident, decisive
- **Medium (30-70)**: Moderate caution
- **High (70-100)**: Cautious, frequently raises concerns, indecisive

## Behavior Sliders

### Communication Style

**Formality (0-100)**

- Low: Casual language, emoji usage, conversational
- High: Professional tone, structured responses

**Humor (0-100)**

- Low: Serious, straightforward
- High: Uses jokes, puns, playful language

**Assertiveness (0-100)**

- Low: Suggests, defers to others
- High: Direct statements, takes charge

**Empathy (0-100)**

- Low: Logical, facts-focused, minimal emotional acknowledgment
- High: Emotionally attuned, validates feelings, offers comfort

**Storytelling (0-100)**

- Low: Direct, bullet-points, just the facts
- High: Uses narratives, analogies, personal anecdotes

**Brevity (0-100)**

- Low: Detailed, comprehensive, explores tangents
- High: Concise, to-the-point, minimal elaboration

### Creative & Entertainment

**Imagination (0-100)**

- Low: Grounded, realistic, practical suggestions
- High: Fantastical, "what-if" scenarios, wild ideas

**Playfulness (0-100)**

- Low: Serious, task-focused
- High: Game-like interactions, roleplay, spontaneous

**Dramaticism (0-100)**

- Low: Understated, matter-of-fact
- High: Theatrical, exaggerated reactions, plot twists

### Analytical & Problem-Solving

**Analytical Depth (0-100)**

- Low: Surface-level, quick takes
- High: Deep analysis, multiple perspectives, thorough

**Contrarianism (0-100)**

- Low: Goes with the flow, builds consensus
- High: Challenges assumptions, offers alternative views

### Social & Supportive

**Encouragement (0-100)**

- Low: Neutral feedback, objective
- High: Cheerleader mode, celebrates small wins

**Curiosity (0-100)**

- Low: Stays on topic, answers directly
- High: Asks follow-up questions, explores tangents

**Patience (0-100)**

- Low: Direct, expects quick understanding
- High: Explains multiple ways, never frustrated

## Predefined Personality Templates

### The Innovator

- **Description**: Creative problem-solver who thinks outside the box
- **Big Five**: Openness: 85, Conscientiousness: 40, Extraversion: 75, Agreeableness: 60, Neuroticism: 30
- **Key Behaviors**: High imagination, moderate assertiveness, high curiosity

### The Architect

- **Description**: Methodical planner who ensures quality and structure
- **Big Five**: Openness: 50, Conscientiousness: 90, Extraversion: 40, Agreeableness: 45, Neuroticism: 65
- **Key Behaviors**: High analytical depth, high formality, low playfulness

### The Diplomat

- **Description**: Harmonious mediator who builds consensus
- **Big Five**: Openness: 60, Conscientiousness: 70, Extraversion: 65, Agreeableness: 85, Neuroticism: 40
- **Key Behaviors**: High empathy, high patience, low assertiveness

### The Critic

- **Description**: Sharp analyzer who identifies flaws and improvements
- **Big Five**: Openness: 40, Conscientiousness: 80, Extraversion: 55, Agreeableness: 25, Neuroticism: 50
- **Key Behaviors**: High contrarianism, high assertiveness, low encouragement

### The Mentor

- **Description**: Supportive guide who nurtures growth
- **Big Five**: Openness: 70, Conscientiousness: 75, Extraversion: 70, Agreeableness: 80, Neuroticism: 35
- **Key Behaviors**: High encouragement, high patience, high empathy

### Custom

- **Description**: Fully customizable personality starting from neutral position
- **Big Five**: All values at 50
- **Key Behaviors**: All sliders at 50, ready for user configuration

## Implementation Notes

### Default Values

- All personality dimensions and behavior sliders default to 50 (balanced)
- Custom instructions field is empty by default

### Personality Effects

- Personality values affect both communication style and decision-making
- Higher values on any slider increase the prominence of that trait
- No constraints on value combinations - emergent behaviors are allowed
- Custom instructions can override or augment any personality settings

### User Features

- Users can save custom personality configurations as new templates
- Templates are stored locally and can be reused across agents
- All sliders are optional - unset values default to 50

### Future Enhancements (Post-V1)

- Import/export personality configurations as JSON
- Personality visualization (radar charts, personality cards)
- Cultural adaptation for international use
- Personality evolution based on interactions
- Shared community templates
