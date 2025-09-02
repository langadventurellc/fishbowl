---
id: T-fix-personality-e2e-tests
title: Fix Personality E2E Tests After Dynamic Behaviors and Default
  Personalities Changes
status: in-progress
priority: high
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T21:45:37.676Z
updated: 2025-09-01T21:45:37.676Z
---

## Context

Recent changes to the personalities system have broken E2E tests. The main changes include:

1. **Dynamic Behaviors System**: Previously static traits/behaviors are now dynamic with extensive personality definitions from `resources/personality_definitions.json`
2. **Updated Default Personalities**: Changed from 5 personalities to 14+ with completely different names (e.g., "The Enthusiast", "The Sage" vs old "Analytical Strategist")
3. **Modal System Refactoring**: Similar to LLM setup tests, modal selectors need updating to content-based targeting

## Reference Implementation

Follow the pattern established in commit `29bb03da45f8aade5d01ee72f23af7f70eb5069a` which fixed LLM setup E2E tests:

- Replace CSS class selectors with content-based targeting
- Update button text patterns to match current implementation
- Use `[role="dialog"]:has([specific-content])` pattern for modal identification

## Implementation Requirements

### Phase 1: Fix Default Personalities Loading Tests

**File**: `tests/desktop/features/settings/personalities/personalities-default-loading.spec.ts`

1. **Update count expectations**:
   - Change hardcoded expectation from 5 to actual count (14)
   - Use dynamic count verification instead of hardcoded numbers
   - Reference: `packages/shared/src/data/defaultPersonalities.json`

2. **Replace hardcoded personality names**:
   - Remove references to "Analytical Strategist" and other old names
   - Use current names: "The Enthusiast", "The Sage", "The Straight Shooter", etc.
   - Get first personality dynamically instead of hardcoding names

3. **Fix storage file structure validation**:
   - Update expected personality data structure to match new format
   - Verify new behaviors structure with dynamic traits (30+ behaviors vs old limited set)
   - Handle new schema version and personality ID format

### Phase 2: Fix Modal Selectors (Creation/Editing)

**Files**:

- `tests/desktop/features/settings/personalities/personalities-creation.spec.ts`
- `tests/desktop/features/settings/personalities/personalities-editing.spec.ts`

Apply LLM setup test pattern:

1. **Replace modal selectors**:

   ```javascript
   // From: window.locator('[role="dialog"].personality-modal')
   // To: window.locator('[role="dialog"]:has([name="personality-name"], [name="custom-instructions"])')
   ```

2. **Update button text patterns**:
   - Update save/create button selectors to match current text
   - Use content-based button identification
   - Handle both "Create Personality" and "Update Personality" button states

3. **Fix form field selectors**:
   - Update trait slider selectors for dynamic behaviors system
   - Test slider rendering without hardcoding specific trait names
   - Focus on form functionality, not specific trait values

### Phase 3: Fix Trait/Behavior System Tests

**All test files**

1. **Remove BigFive assumptions**:
   - Don't assume specific trait names or values
   - Test dynamic slider rendering generically
   - Use behavior structure from `resources/personality_definitions.json`

2. **Update behavior validation**:
   - Handle new 0-100 scale behaviors
   - Test presence of sliders without testing specific values
   - Verify form submission works with dynamic traits

### Phase 4: Fix Deletion Tests

**File**: `tests/desktop/features/settings/personalities/personalities-deletion.spec.ts`

1. **Update personality references**:
   - Use current default personality names
   - Test deletion with actual existing personalities
   - Fix modal confirmation dialog selectors

## Technical Approach

### Step 1: Analyze Current Default Personalities

```bash
# Reference the actual default personalities structure
cat packages/shared/src/data/defaultPersonalities.json | jq '.personalities | length'  # Should be 14
cat packages/shared/src/data/defaultPersonalities.json | jq '.personalities[0].name'   # Get first name
```

### Step 2: Apply Modal Selector Pattern

Follow the established pattern from LLM setup tests:

- Use content-based modal identification
- Replace CSS class dependencies with form content detection
- Update button text to match current implementation

### Step 3: Test Incrementally

Run specific test files after each phase:

```bash
pnpm test:e2e:desktop -- tests/desktop/features/settings/personalities/personalities-default-loading.spec.ts
pnpm test:e2e:desktop -- tests/desktop/features/settings/personalities/personalities-creation.spec.ts
# etc.
```

## Detailed Acceptance Criteria

### Default Loading Tests

- [ ] `loads 5 default personalities on first visit` → Update to expect 14 personalities
- [ ] `displays correct personality names and basic traits` → Use actual personality names from defaults
- [ ] `persists default personalities to storage file` → Verify new data structure format
- [ ] `displays personality trait indicators correctly` → Remove hardcoded "Analytical Strategist" lookup

### Creation Tests

- [ ] Modal opens reliably with content-based selectors
- [ ] Form fields (name, custom instructions) are accessible
- [ ] Trait sliders render without requiring specific trait names
- [ ] Form submission works with dynamic behaviors
- [ ] Modal closes properly after creation

### Editing Tests

- [ ] Personality editing modal opens with current data
- [ ] Form updates work with new behaviors structure
- [ ] Save functionality works with updated button text patterns

### Deletion Tests

- [ ] Deletion works with current default personality names
- [ ] Confirmation dialogs use proper content-based selectors
- [ ] Multiple personality deletion handles new personality count

## Files to Modify

**Primary (test fixes only):**

- `tests/desktop/features/settings/personalities/personalities-default-loading.spec.ts`
- `tests/desktop/features/settings/personalities/personalities-creation.spec.ts`
- `tests/desktop/features/settings/personalities/personalities-editing.spec.ts`
- `tests/desktop/features/settings/personalities/personalities-deletion.spec.ts`

**Reference files:**

- `packages/shared/src/data/defaultPersonalities.json` (for current personality names/count)
- `resources/personality_definitions.json` (for behavior structure understanding)
- `.trellis/t/closed/T-fix-llm-setup-e2e-test.md` (for modal selector pattern)

## Testing Requirements

- All personality E2E tests must pass: `pnpm test:e2e:desktop -- tests/desktop/features/settings/personalities/`
- Tests should work reliably without flakiness
- No implementation logic should be changed - only test selectors and expectations
- Tests should be resilient to future personality additions/changes

## Security Considerations

- Ensure test data doesn't expose real user data
- Verify tests clean up properly after execution
- No credentials or sensitive data in test assertions

## Out of Scope

- Changing personality implementation logic
- Adding new personality features
- Modifying the dynamic behaviors system
- Performance optimizations
- Adding data attributes to components (unless content-based selectors fail)

## Dependencies

None - this is a standalone test fix task that can be completed independently.
