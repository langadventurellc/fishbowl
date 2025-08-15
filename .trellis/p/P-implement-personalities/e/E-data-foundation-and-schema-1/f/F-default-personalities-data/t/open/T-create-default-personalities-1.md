---
id: T-create-default-personalities-1
title: Create default personalities JSON data file
status: open
priority: medium
parent: F-default-personalities-data
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:07:03.362Z
updated: 2025-08-15T18:07:03.362Z
---

# Create Default Personalities JSON Data File

## Context

Create a comprehensive JSON file with 3-5 diverse example personalities that demonstrate the full range of Big Five traits and behavior patterns. This data will provide users with immediate examples on first launch.

## Implementation Requirements

### File: `packages/shared/src/data/defaultPersonalities.json`

Create JSON file with 5 distinct personality archetypes:

1. **Creative Thinker** - High openness, creative and curious behaviors
2. **Analytical Strategist** - High conscientiousness, logical and systematic behaviors
3. **Empathetic Supporter** - High agreeableness, supportive and understanding behaviors
4. **Dynamic Leader** - High extraversion, decisive and enthusiastic behaviors
5. **Thoughtful Advisor** - Balanced traits, patient and wise behaviors

### Data Structure Requirements

```json
{
  "schemaVersion": "1.0.0",
  "personalities": [
    {
      "id": "creative-thinker",
      "name": "Creative Thinker",
      "bigFive": {
        "openness": 85,
        "conscientiousness": 60,
        "extraversion": 70,
        "agreeableness": 75,
        "neuroticism": 40
      },
      "behaviors": {
        "analytical": 65,
        "empathetic": 80,
        "decisive": 55,
        "curious": 90,
        "patient": 70,
        "humorous": 75,
        "formal": 30,
        "optimistic": 85,
        "cautious": 45,
        "creative": 95,
        "logical": 60,
        "supportive": 80,
        "direct": 50,
        "enthusiastic": 75
      },
      "customInstructions": "Focus on innovative solutions and think outside the box",
      "createdAt": null,
      "updatedAt": null
    }
  ],
  "lastUpdated": "2025-01-15T10:30:00.000Z"
}
```

### Behavior Traits to Include

All personalities should include these 14 behavior traits with varied values (0-100):

- analytical, empathetic, decisive, curious, patient, humorous, formal, optimistic, cautious, creative, logical, supportive, direct, enthusiastic

## Acceptance Criteria

- [ ] File created at: `packages/shared/src/data/defaultPersonalities.json`
- [ ] Exactly 5 distinct personalities with unique Big Five profiles
- [ ] Each personality covers different trait spectrum (low/medium/high values)
- [ ] All 14 behavior traits included for each personality with meaningful variations
- [ ] Custom instructions under 500 characters and reflect personality type
- [ ] Professional, appropriate content suitable for all users
- [ ] No duplicate IDs or names across personalities
- [ ] JSON syntax is valid and properly formatted
- [ ] All timestamps set to null for manual editing capability
- [ ] Schema version matches current version (1.0.0)
- [ ] File validates against persistence schema
- [ ] File size under 10KB for performance

## Testing Requirements (include in this task)

- Test JSON file parses without syntax errors
- Test all personalities validate against persistence schema
- Test no duplicate IDs or names exist
- Test all behavior traits are within 0-100 range
- Test custom instructions are under 500 characters
- Test Big Five traits are within 0-100 range and diverse across personalities
