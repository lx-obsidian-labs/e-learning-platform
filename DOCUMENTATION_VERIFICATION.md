# Edu Learn — Verification and Release Guide

**Review date:** 2026-11-07  
**Status:** Documentation review; source and live feature verification pending.  
**Purpose:** Convert the detailed README's feature inventory into reproducible engineering evidence.

## Reproducible commands

The root package manifest declares npm and the following commands:

```bash
npm ci
npm run lint
npm run test
npm run test:coverage
npm run build
```

The manifest also includes `npm run dev` for local development. These commands are documented but **not executed or certified by this guide**. Record Node version, environment configuration names and the commit SHA for every run.

## Architecture verification

Inspect and document:

1. Next.js route boundaries and client/server rendering.
2. Supabase authentication, migrations, row-level security and service-role access.
3. AI model/provider integrations, request limits, prompt injection boundaries and data sharing.
4. Learning records, assessment scores, enrolment permissions and administrative roles.
5. Notification, media and payment paths, if implemented.
6. Offline cache and service-worker behavior.

## Feature acceptance matrix

| Feature claim | Required proof | Status |
| --- | --- | --- |
| Student/instructor/admin roles | Role-specific tests and authorization denial cases | Unverified |
| Courses, lessons and progress | Persistence, ownership and regression tests | Unverified |
| AI tutoring and content generation | Provider integration tests, error/timeout handling, privacy review | Unverified |
| Gamification and spaced repetition | Deterministic progression and scheduling tests | Unverified |
| Certificates | Recompute hash, tamper tests, issuer authenticity and independent verification | Unverified |
| Blockchain anchoring | Chain/network, contract/transaction ID and independent on-chain proof | **Not established by SHA-256 hashing alone** |
| Paid enrolment | Verified payment reconciliation, refunds and access control | Unverified |
| PWA/offline | Browser/device offline tests and cache invalidation | Unverified |
| Accessibility | WCAG testing with keyboard and assistive technology | Unverified |
| Multilingual UI | Coverage and fallback tests for each supported locale | Unverified |

## Security and privacy review

- Never expose Supabase service-role keys or AI provider secrets to browser bundles.
- Verify row-level security for students, teachers and administrators.
- Test malicious uploads, course content injection and AI prompt-injection attempts safely.
- Review handling of learner data, consent, retention and deletion.
- Confirm certificate issuer identity and tamper resistance.
- Verify that test fixtures contain no real learner records.

## Release evidence record

```md
Reviewed commit:
Review date:
Node/npm versions:
Environment variable names configured:
Lint result and CI URL:
Test result and CI URL:
Coverage result and artifact:
Build result and CI URL:
Database migration / RLS verification:
Deployed URL and smoke-test result:
Accessibility result:
Known blockers:
Reviewer:
```

## Publishing standard

Until independently verified, describe the product as **an education platform with documented AI, gamification and certificate workflows under review**, not as fully tested, WCAG-conformant, blockchain-verified or zero-configuration production software.

[Main README](README.md) · [Portfolio](https://github.com/lx-obsidian-labs/lx-obsidian-labs)
