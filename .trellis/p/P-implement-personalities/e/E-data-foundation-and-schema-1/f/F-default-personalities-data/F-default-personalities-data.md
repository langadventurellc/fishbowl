---
id: F-default-personalities-data
title: Default Personalities Data Creation
status: open
priority: medium
parent: E-data-foundation-and-schema-1
prerequisites:
  - F-persistence-schema-and-type
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:03:21.488Z
updated: 2025-08-15T18:03:21.488Z
---

# Default Personalities Data Creation

## Purpose

Create comprehensive default personality data with 3-5 example personalities that demonstrate diverse Big Five trait combinations and behavior patterns to provide users with immediate examples on first launch.

## Key Components to Implement

### Default Data File (`packages/shared/src/data/`)

- `defaultPersonalities.json` - JSON file with 3-5 diverse example personalities
- Comprehensive Big Five trait variations
- Rich behavior trait examples covering all supported behaviors
- Realistic custom instructions for each personality type

### Data Loading Utilities

- Integration with `createDefaultPersonalitiesSettings.ts`
- Proper JSON loading and validation
- Error handling for corrupted default data

## Detailed Acceptance Criteria

### Default Personalities Content

- [ ] 3-5 distinct personality examples with diverse trait combinations
- [ ] Each personality has unique Big Five trait profile (no duplicates)
- [ ] All behavior traits included with varied values (0-100)
- [ ] Custom instructions under 500 characters per personality
- [ ] Realistic names and descriptions that reflect personality types
- [ ] Professional, appropriate content suitable for all users

### Personality Diversity Requirements

- [ ] Cover full spectrum of Big Five traits (low, medium, high values)
- [ ] Include introverted and extraverted examples
- [ ] Balance of creative vs analytical personalities
- [ ] Mix of formal vs casual communication styles
- [ ] Various professional archetypes represented

### Data Quality Standards

- [ ] All personalities validate against persistence schema
- [ ] JSON structure matches exact schema requirements
- [ ] No syntax errors or malformed JSON
- [ ] Consistent formatting and indentation
- [ ] All required fields present for each personality

### Integration Requirements

- [ ] File loads correctly through `createDefaultPersonalitiesSettings`
- [ ] Default data appears on first application launch
- [ ] No conflicts with user-created personalities
- [ ] Schema validation passes for all default personalities

## Implementation Guidance

### Personality Examples Structure

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

### Recommended Personality Archetypes

1. **Creative Thinker** - High openness, creative behaviors
2. **Analytical Strategist** - High conscientiousness, logical behaviors
3. **Empathetic Supporter** - High agreeableness, supportive behaviors
4. **Dynamic Leader** - High extraversion, decisive behaviors
5. **Thoughtful Advisor** - Balanced traits, patient and wise behaviors

## Testing Requirements

- [ ] All default personalities validate against schema
- [ ] JSON file loads without errors
- [ ] Factory function integrates default data correctly
- [ ] No duplicate IDs across personalities
- [ ] All behavior traits properly populated
- [ ] Character limits respected for all text fields

## Security Considerations

- No sensitive or personally identifiable information
- Appropriate content suitable for professional environments
- No hardcoded credentials or API keys
- Safe default values that don't expose system information

## Performance Requirements

- JSON file loads within 50ms
- Efficient parsing with minimal memory usage
- No blocking operations during default data loading
- File size under 10KB for quick loading

## User Experience Considerations

- Personalities provide clear examples of feature capabilities
- Diverse enough to appeal to different user preferences
- Professional tone appropriate for business and personal use
- Custom instructions demonstrate best practices for the field
