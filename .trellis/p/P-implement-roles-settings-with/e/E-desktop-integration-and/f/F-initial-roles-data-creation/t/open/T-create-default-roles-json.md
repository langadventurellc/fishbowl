---
id: T-create-default-roles-json
title: Create default roles JSON file with example roles
status: open
priority: high
parent: F-initial-roles-data-creation
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T04:17:18.085Z
updated: 2025-08-12T04:17:18.085Z
---

# Create Default Roles JSON File

## Context

Create a static JSON file containing default/example roles that will be loaded when the app starts for new users. This replaces the current approach of returning empty roles and provides immediate value to new users.

## Implementation Requirements

### File Location

Create: `packages/shared/src/data/defaultRoles.json`

### JSON Structure

Follow the exact `PersistedRolesSettingsData` structure from the schema:

```json
{
  "schemaVersion": "1.0.0",
  "roles": [
    {
      "id": "project-manager",
      "name": "Project Manager",
      "description": "A strategic planning assistant focused on project coordination and team management",
      "systemPrompt": "You are a project management expert. Help with planning, task coordination, resource allocation, and team communication. Focus on practical solutions and clear action items.",
      "createdAt": null,
      "updatedAt": null
    },
    {
      "id": "code-reviewer",
      "name": "Code Reviewer",
      "description": "A technical assistant specializing in code quality and best practices",
      "systemPrompt": "You are a senior code reviewer. Analyze code for quality, security, performance, and maintainability. Provide constructive feedback following industry best practices and clean code principles.",
      "createdAt": null,
      "updatedAt": null
    },
    {
      "id": "creative-writer",
      "name": "Creative Writer",
      "description": "A creative writing assistant for storytelling and content creation",
      "systemPrompt": "You are a creative writing assistant. Help with storytelling, character development, plot structure, and engaging content creation. Be imaginative, inspiring, and focus on narrative craft.",
      "createdAt": null,
      "updatedAt": null
    },
    {
      "id": "data-analyst",
      "name": "Data Analyst",
      "description": "An analytical assistant for data insights and decision support",
      "systemPrompt": "You are a data analyst. Help interpret data, identify patterns, create insights, and support data-driven decision making. Focus on clear explanations and actionable recommendations.",
      "createdAt": null,
      "updatedAt": null
    }
  ],
  "lastUpdated": null
}
```

## Acceptance Criteria

- [ ] JSON file created at correct location
- [ ] Contains 4 diverse example roles demonstrating different use cases
- [ ] Each role has high-quality, professional content (no placeholder text)
- [ ] System prompts are 100-300 words, well-crafted and specific
- [ ] Role names are under 100 characters
- [ ] Descriptions are under 500 characters
- [ ] JSON is properly formatted and valid
- [ ] Uses null for timestamps (will be set when roles are saved to user data)
- [ ] Includes proper schema version

## Quality Guidelines

### Role Selection

- Cover diverse professional use cases
- Demonstrate different prompting styles and techniques
- Avoid generic or low-value examples
- Each role should be immediately useful to users

### System Prompts

- Clear instructions about the role's expertise
- Specific guidance on how to respond
- Professional tone appropriate for the role
- Include behavioral directives (e.g., "focus on", "prioritize")

## Testing Requirements

- Create a simple unit test that loads and validates the JSON against the schema
- Verify all required fields are present
- Test that the JSON structure matches `PersistedRolesSettingsData` exactly

## Dependencies

- Must validate against `persistedRolesSettingsSchema` from `packages/shared/src/types/settings/rolesSettingsSchema.ts`
- References feature F-initial-roles-data-creation for context
