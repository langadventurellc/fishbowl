---
kind: task
id: T-remove-over-engineered-service
title: Remove over-engineered service coordination test files
status: open
priority: high
prerequisites: []
created: "2025-07-29T11:36:53.391705"
updated: "2025-07-29T11:36:53.391705"
schema_version: "1.1"
---

# Remove Over-Engineered Service Coordination Test Files

## Context

Based on the BDD specification analysis, several test files contain over-engineered service coordination patterns that are not essential for the core agent configuration functionality. These tests focus on enterprise-grade infrastructure concerns rather than business requirements.

## Files to Remove

### Service Coordination Tests

- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-service-coordination.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-multi-service-orchestration.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-workflow-coordination.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-service-communication.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-system-consistency.integration.spec.ts`

### Error Handling and Recovery Tests

- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-error-handling-recovery.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/configuration-service-integration/configuration-transaction-consistency.integration.spec.ts`

### Agent Configuration Over-Engineering

- `packages/shared/src/__tests__/integration/features/agent-configuration/agent-references-dependency-tracking.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/agent-configuration/agent-creation-workflow.integration.spec.ts`
- `packages/shared/src/__tests__/integration/features/agent-configuration/agent-creation-error-handling.integration.spec.ts`

### Personality Management Service Coordination

- `packages/shared/src/__tests__/integration/features/personality-management/personality-management-service-coordination.integration.spec.ts`

## Rationale

These tests focus on:

- Circuit breaker patterns
- Complex error propagation
- Multi-service orchestration
- Enterprise-grade fault tolerance
- Advanced workflow coordination

The core business need is simple CRUD operations for agent configurations, not enterprise service architecture.

## Acceptance Criteria

- [ ] All identified over-engineered test files are deleted
- [ ] No broken imports or references remain
- [ ] Essential functionality tests remain intact
- [ ] Test suite runs successfully after cleanup

### Log
