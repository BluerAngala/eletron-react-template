# ADR-001: Use Workspace Feature Packages

## Status

Accepted

## Date

2026-08-07

## Context

The desktop template needs optional functionality without retaining its UI, IPC handlers, credentials, and third-party dependencies in every generated project. The original AI implementation lived in the host application and used generated switches to expose or hide it. That kept the implementation coupled to the template and did not support independent feature updates.

## Decision

Optional functionality is implemented as a pnpm workspace package under `packages/`.

- `packages/feature-contract` defines the stable host-to-feature registration interfaces.
- A feature package owns its renderer UI, main-process handlers, preload bridge, locales, and feature-only dependencies.
- The host only imports feature registration functions through generated entries in `app/renderer/features/`, `app/electron/main/features.ts`, and `app/electron/preload/features.ts`.
- `pnpm feature:add <id>` enables the registration entries and adds the workspace dependency to the host package.
- `pnpm feature:remove <id>` removes the registration entries and host dependency. The feature is excluded from the host build after `pnpm install`.

## Alternatives Considered

### Host-resident feature switches

Rejected because the host still owns feature source code and dependencies, preventing independent versioning and clean removal.

### Runtime-loaded Electron plugins

Rejected because arbitrary main-process plugin code needs signing, sandboxing, permissions, compatibility, and rollback mechanisms. That is a plugin platform, not a template feature system.

## Consequences

- Feature packages can be extracted and published to a private npm registry later.
- Upgrading a feature becomes a package-version change instead of a host-wide refactor.
- Host code stays free of feature-specific IPC channels and SDK dependencies.
- Features that expose Electron capabilities must continue to use only the registration contract and their own narrow preload API.