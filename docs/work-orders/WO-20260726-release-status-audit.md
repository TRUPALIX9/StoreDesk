# WO-20260726-release-status-audit

- **Status:** done
- **Management:** delegated
- **Priority:** P1
- **Requester:** user
- **Primary owner:** docs-scribe
- **Reviewers:** qa-verifier, eng-manager
- **Modules:** parent, store-desk-electron, store-desk-worker, store-desk-mobile, store-desk-web, store-desk-cloud-backend, docs

## Goal

Audit the parent and all five submodules, conservatively clean disposable workspace junk, and publish one canonical release-status snapshot covering versions, source revisions, CI, artifacts, deployments, packaging, shipped modules, compatibility, and blockers.

## Acceptance criteria

- [x] Parent and five submodules have branch, SHA, version, CI, release, artifact, deployment, and packaging status recorded.
- [x] `docs/release-status.md` uses Ready / Partial / Blocked / Not built labels and includes compatibility plus exact Android artifact paths.
- [x] Parent documentation links to the release-status snapshot.
- [x] Clearly disposable generated junk is removed without touching source, secrets, user data, or release artifacts.
- [x] Focused validation and final repository status are recorded.

## Out of scope

- Product source changes, plan-file edits, new builds, releases, deployments, and pushes.
- Deleting uncertain generated files or any APK/AAB.

## Touch list (expected)

- `docs/release-status.md`
- `README.md`
- `docs/AGENTS.md`
- `docs/work-orders/WO-20260726-release-status-audit.md`

## Dependencies / blockers

- GitHub release and deployment state must be available through repository APIs.
- Private submodule checkout currently affects parent CI.

## Notes

Completed without submodule source or pointer changes. Removed only the untracked `store-desk-mobile/.DS_Store`; preserved the required legacy download artifact `store-desk-worker/downloads/storedesk-buddy.apk`.

Validation: release-status labels and README links were checked, `git diff --check` passed, APK copies were SHA-256 matched, GitHub CI/deployments were inspected, and all five submodules ended clean on `production`. Parent-only documentation changes remain uncommitted for review.

## Handoff log

- 2026-07-26: `docs-scribe` accepted the audit and documentation work from `eng-manager`.
- 2026-07-26: `docs-scribe` handed the completed parent-doc changes back to `eng-manager`: `README.md`, `docs/AGENTS.md`, `docs/release-status.md`, and this Work Order.
