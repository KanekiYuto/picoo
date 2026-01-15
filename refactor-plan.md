# Refactor Plan (Draft)

Goal: make the codebase easier to navigate, separate concerns (UI vs. server vs. shared), and keep API routes thin.

## Phase 0: Safety & baseline
- Document current structure and critical paths (AI generator flow, auth, credits).
- Ensure path aliases work for new directories.

## Phase 1: Introduce module boundaries
- Create directories:
  - src/server (server-only logic)
  - src/features (business modules)
  - src/shared (cross-cutting UI/types/utils)
- Move server-only modules from src/lib into src/server:
  - auth, db, credit, storage, ai-generator, api-handler
- Update imports in API routes and server utilities.
- Add minimal shared types where client needs them (e.g., Session shape).

## Phase 2: Generator module split (highest ROI)
- Move generator UI into src/features/generator.
- Split large config into:
  - features/generator/models (model definitions)
  - features/generator/api (request builders)
  - features/generator/types
- Keep API calls and server handlers in src/server/ai-generator.

## Phase 3: Thin API routes
- Route files become parameter parsing + calling server services + response.
- Provider-specific logic lives under src/server/ai-generator/providers.

## Phase 4: Page components cleanup
- Route-only components remain in src/app/[locale]/**/_components.
- Reusable components move to src/shared/ui or src/features/*/components.

## Phase 5: Types & config consolidation
- Move shared configs into src/shared/config.
- Centralize common API response types into src/shared/types.

## Execution order
1) Phase 1: server-only moves + import fixes.
2) Phase 2: generator module split.
3) Phase 3: API route thinning.
4) Phase 4: component relocation.
5) Phase 5: types/config consolidation.

## Notes
- Keep changes incremental to avoid large regressions.
- Prefer type-only imports on client side; avoid importing server modules in client components.
