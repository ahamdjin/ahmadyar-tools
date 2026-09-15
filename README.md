# Ahmad Yar Tools

Practical automation architecture and operations tools for AhmadYar.co.

Public product surface: `https://ahmadyar.co/tools`

This repository is the independently deployable tools application. It is intentionally separate from the portfolio so the decision engine, product UI, scenario tests, and future AI/cost layers can evolve without turning the portfolio into a product monolith.

## Development

```bash
npm install
npm run dev
```

Because the app uses `basePath: '/tools'`, open `http://localhost:3000/tools`.

## Quality

```bash
npm run check
```

The decision model is documented in `docs/decision-model.md`. Any change that materially affects platform selection should be covered by a benchmark scenario in `engine/scenarios.ts`.

## Product boundary

- `ahmadyar` — portfolio, content, SEO, public routing.
- `ahmadyar-tools` — interactive tools, deterministic recommendation engine, product tests, and later optional AI assistance.
