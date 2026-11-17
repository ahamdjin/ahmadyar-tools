# Ahmad Yar Tools

Practical automation architecture and operations tools for AhmadYar.co.

Public product surface: `https://www.ahmadyar.co/tool`

This repository is the independently deployable tools application. It is intentionally separate from the portfolio so the decision engine, product UI, scenario tests, and future AI/cost layers can evolve without turning the portfolio into a product monolith.

## Development

```bash
npm install
npm run dev
```

Because the app uses `basePath: '/tool'`, open `http://localhost:3000/tool`.

## Quality

```bash
npm run check
```

The decision model is documented in `docs/decision-model.md`. Any change that materially affects platform selection should be covered by a benchmark scenario in `engine/scenarios.ts`.

## Product boundary

- `ahmadyar` — portfolio, content, SEO, public routing.
- `ahmadyar-tools` — interactive tools, deterministic recommendation engine, product tests, and later optional AI assistance.

## Browser Utilities (Local Development)

Seven additional tools use shared workbench components in `components/utilities`, with a separate typed engine in `lib/utilities`. The original six planning tools remain unchanged. The utility catalog drives routes, index links, sitemap and machine-readable discovery. New utility metadata stays noindex outside Vercel production.

- JSON comparison uses two strict JSON documents, position-based arrays and JSON Pointer paths. Reports stop at 500 differences; they are not executable patches.
- Timestamp conversion uses explicit seconds/milliseconds/ISO input formats, rejects invalid calendar dates and offset-free ISO input, and displays one instant in UTC and a selected IANA zone.

Run `npm run dev -- --port 3004`, then open `http://localhost:3004/tool`. No credentials or API accounts are required. Input is processed in disposable Web Workers, never placed into URLs/localStorage or submitted to a server. Existing hosting analytics and the site badge still load; this is not an offline application. Input is capped at 200,000 characters, worker execution at three seconds, and regex at 1,000 matches. Copy/download actions create user-controlled copies.

- JSON repair proposes syntactic fixes, preserves original input for comparison and lists up to 500 field paths. Numeric precision follows JavaScript; this is not lossless or schema validation.
- Cron previews eight runs in two IANA zones. Five-field and fixed-zero-second six-field formats are supported; Quartz/AWS syntax and ambiguous restricted DOM/DOW combinations are rejected.
- Request conversion supports an explicit cURL subset and generates JavaScript, Python or an n8n node template. Unsupported flags fail; no HTTP request is sent. Recognized sensitive fields get placeholders, but automatic redaction is not exhaustive.
- CSV mapping defaults to strings and supports nested object paths, explicit types/empty rules and batches. Invalid/duplicate headers, overlapping paths, prototype keys and unsafe number conversions are rejected.
- Regex extraction uses browser JavaScript semantics, records capture groups and indices, and escapes spreadsheet formulas in CSV export. It never runs a user regex on the main thread.

UI guidance: ibelick `baseline-ui`, preserving the existing Geist/light-dark system with native labeled controls, quiet panels, visible errors and no new animations. Library source references are visible below each tool. Run `npm run check` and test actual worker cancellation/timeouts in a browser before release.

### Design And Metadata

The utility index uses equal-height rows; inner pages align their header, workbench and two-column reading sections. Input and output editors share sizing, while technical data handling and result limitations use native disclosures. The Fazier badge is rendered only by the index, never the shared route frame.

`lib/tools-seo.ts` supplies intent-specific utility titles/descriptions and consistent absolute social URLs. `/tool/share-image?tool=<registered-slug>` generates 1200x630 PNGs for all thirteen tools; unknown slugs return 404. The index uses the same endpoint without a query. The share endpoint never reads private tool inputs and is excluded from the sitemap. Descriptive application/breadcrumb schema contains no invented ratings or reviews and does not imply Google rich-result eligibility. Validate actual metadata and public social previews after an approved release; no indexing or traffic outcome is guaranteed by these changes.

`lib/related-tools.ts` bridges planning tools and their relevant browser utilities. All utilities link to one another and back to the index; contextual planning links are reciprocal. `/tool/sitemap.xml` lists the index and all thirteen tools.
