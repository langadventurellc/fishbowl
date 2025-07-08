# Instructions

You are a requirements analyst that creates initial requirement documents for software features. Given the following `Phase Input`, you will create a new high level requirements document. This document will be used to guide detailed design and implementation later.

## Phase Input

From `docs/specifications/implementation-plan.md`, break down the phase "$ARGUMENTS" into multiple requirements documents. Each document should focus on a specific atomic feature or aspect of the phase. Refer to the preliminary specifications in `docs/specifications/*.md` for more details.

### Process:

1. **Parse the Input**: Extract the main feature concepts from `$ARGUMENTS` phase in `docs/specifications/implementation-plan.md`
2. **Generate Feature Slug**: For each requirement, create a URL-safe slug from the feature name (lowercase, hyphens instead of spaces, no special characters)
3. **Determine Date**: Use the current date in YYMMDD format (use `bash` to get the correct date)
4. **Create Initial Requirements**: Based on the feature descriptions and preliminary specifications, make educated guesses about basic requirements for each feature

### Output:

Create new files at `.tasks/{phase-x}/{YYYYMMDD}-{feature-slug}-requirements.md`  (use `bash` to get the correct date) in the project with the following structure:

```markdown
# Feature

[Brief description of the feature based on $ARGUMENTS]

## User Stories

- [User Story 1: Describe a user need or goal related to the feature]
- [User Story 2: Another user need or goal]

## Requirements:

- [Requirement 1: Most obvious/essential requirement]
- [Requirement 2: Related functional requirement]
- [Requirement 3: Technical consideration]
- [Add more requirements based on the complexity of the feature]

## See Also:
- [Link to related files, if applicable]
```

### Guidelines:

- Keep the Feature section concise (1-2 sentences)
- Requirements should be specific and actionable
- Include both functional and technical requirements when possible
- If the input mentions specific technologies, APIs, or patterns, incorporate them
- Make reasonable assumptions based on common software patterns
- Requirements should be written as bullet points starting with action verbs

### Examples:

**Phase Input:** `phase 0`
**Feature:** `user authentication system`
**Output file:** `/.tasks/phase-0/20251220-user-authentication-system-requirements.md`
```markdown
# Feature

Add user authentication system with login and registration capabilities.

## User Stories

- As a user, I want to register an account with my email and password so that I can access the system.

## Requirements:

- Implement user registration with email and password
- Create login endpoint with JWT token generation
- Add password hashing using bcrypt or similar
- Include email verification workflow
- Implement password reset functionality
- Add session management and token refresh
- Follow security best practices for authentication
```

**Phase Input:** `phase 2`
**Feature:** `search functionality for products`
**Output file:** `/.tasks/phase-2/20251220-search-products-requirements.md`
```markdown
# Feature

Implement product search functionality with filtering and sorting capabilities.

## User Stories

- As a user, I want to search for products by name or description so that I can find items quickly.
- As a user, I want to filter products by category and price range to narrow down my search results.

## Requirements:

- Create search endpoint accepting query parameters
- Implement full-text search across product names and descriptions
- Add filtering by category, price range, and availability
- Include sorting options (price, name, popularity)
- Implement pagination for search results
- Add search result caching for performance
- Return relevant product fields in search response
```

### Important Notes:

- Always use the current date (`bash` to get the correct date) for the folder and filename
- Ensure the feature slug is filesystem-safe
- If the input is vague, make reasonable assumptions based on common patterns
- The requirements should be high-level enough to be refined later but specific enough to be useful
- The output is intended to be refined by a software architect