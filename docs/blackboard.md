# Agent Blackboard

This document serves as a shared knowledge base for coding agents working on the Fishbowl project. It contains architectural decisions, patterns, and insights to maintain consistency across development.

## Purpose

The blackboard enables coding agents to:

- Share knowledge about architectural decisions
- Document patterns and conventions
- Avoid repeating mistakes
- Maintain consistent code quality
- Track evolution of technical decisions

## Knowledge Categories

### 🏗️ Architecture Decisions

**Format**: `[DATE] [AGENT] Decision: [DESCRIPTION]`

### 🔧 Technical Patterns

**Format**: `[DATE] [AGENT] Pattern: [PATTERN_NAME] - [DESCRIPTION]`

### 🐛 Common Issues & Solutions

**Format**: `[DATE] [AGENT] Issue: [PROBLEM] - Solution: [SOLUTION]`

### 📚 Code Conventions

**Format**: `[DATE] [AGENT] Convention: [AREA] - [RULE]`

---

## Knowledge Entries

### Architecture Decisions

_[No entries yet - agents will add decisions as they make them]_

### Technical Patterns

_[No entries yet - agents will document patterns as they implement them]_

### Common Issues & Solutions

_[No entries yet - agents will document issues and solutions as they encounter them]_

### Code Conventions

_[No entries yet - agents will document conventions as they establish them]_

---

## Contributing Guidelines

### For Coding Agents

1. **Timestamp Format**: Use ISO 8601 format (YYYY-MM-DD)
2. **Agent Attribution**: Include your agent identifier
3. **Clear Descriptions**: Be specific and actionable
4. **Update Existing**: Modify entries rather than duplicate
5. **Cross-Reference**: Link to related code, issues, or specifications

### Entry Template

```markdown
### [Category] - [Title]

**Date**: YYYY-MM-DD  
**Agent**: [Agent Name/ID]  
**Context**: [Brief context or trigger]

**Description**: [Detailed description]

**Impact**: [How this affects the codebase]

**References**:

- [Link to related files]
- [Link to specifications]
- [Link to issues]

---
```

### Example Entry

```markdown
### Architecture Decision - IPC Type Safety

**Date**: 2025-07-08  
**Agent**: Claude-Code-001  
**Context**: Setting up communication between main and renderer processes

**Description**: Implemented strongly-typed IPC channels using shared TypeScript interfaces. All IPC calls must use predefined channel types to ensure type safety and prevent runtime errors.

**Impact**: Eliminates potential runtime errors from IPC communication and provides better developer experience with autocomplete and type checking.

**References**:

- `src/shared/types/ipc.ts`
- `docs/specifications/ipc-communication.md`

---
```

## Maintenance

### Regular Updates

- Review and update entries quarterly
- Archive outdated information
- Consolidate related entries
- Update references as code changes

### Quality Control

- Ensure entries remain relevant
- Verify references are current
- Remove duplicate information
- Maintain consistent formatting

---

## Quick Reference

### Key Project Conventions

_[To be populated as conventions are established]_

### Important Architectural Patterns

_[To be populated as patterns are implemented]_

### Critical Dependencies

_[To be populated as dependencies are added]_

---

_This document is maintained by coding agents working on Fishbowl. Last updated: 2025-07-08_
