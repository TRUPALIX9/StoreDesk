# Hybrid LAN + Atlas Org Sync Work Order

**Date:** 2026-08-02

## Overview
Update documentation, implement architecture changes, and prepare rollout for Hybrid LAN + Atlas organization synchronization.

## Phases
- **Phase A:** Hub AppUser sessions + Worker outbound presence.
- **Phase B:** Hub RPC relay for Mobile/remote Electron.
- **Phase C:** Atlas org DB creation on license creation, Worker delta publishing.
- **Phase D:** Optional Hub reads from Atlas when sync lag acceptable.

## Tasks
- Update docs/architecture.md, docs/storedesk-gemini-project-brief.md, docs/mobile-flow.md, docs/system-map.md.
- Create work order file.
- Verify diagrams render.
- Run markdownlint.

## Risks
- Worker must stay connected for live reads.
- Atlas lag may affect read paths.
- Ensure no prohibited stock features are added.

## Verification
- Manual review of updated docs.
- CI passes markdownlint.

## Acceptance Criteria
- Docs reflect new architecture.
- No stock‑related content introduced.
- Work order documented under `docs/work-orders/`.
