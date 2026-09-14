# Product architecture

## Boundary

`ahmadyar-tools` owns the interactive product experience. The portfolio repository owns the main AhmadYar.co content, work, articles, and the public route that proxies `/tools` to this application.

The app is built with `basePath: '/tools'`, so the deployment can sit behind `https://ahmadyar.co/tools` without exposing a second product domain.

## Layering

- `app/` — routing, metadata, and page composition only.
- `components/` — interface components. UI must not own recommendation rules.
- `engine/` — deterministic architecture decisions, platform profiles, constraints, confidence, safeguards, and benchmarks.
- `lib/` — stable product registry and site constants.
- `tests/` — scenario/regression coverage for the engine and product contract.

## Rules

1. Hard constraints eliminate options before weighted scoring.
2. Simple workflows must not be punished for being simple or pushed toward technical platforms.
3. Platform recommendations are contextual, not universal rankings.
4. Native automation is a valid recommendation. The product should recommend less software when that is the better architecture.
5. Custom code is a boundary decision, not a prestige option.
6. AI may parse descriptions and explain results later, but deterministic code owns scoring, constraints, and repeatable recommendations.
7. Every meaningful scoring change should add or update benchmark scenarios.
