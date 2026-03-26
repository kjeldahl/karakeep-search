## Parent PRD

[prd.md](../prd.md)

## What to build

Set up Vitest and write unit tests for the Karakeep Client and Query Extractor modules per the testing decisions in the PRD.

**Karakeep Client tests:** successful search returns normalized results, error handling for network failure / 401 / 429 / 500, timeout behavior. Mock `fetch` at the boundary.

**Query Extractor tests:** extracts query from various Google domains (google.com, google.dk, google.co.uk), rejects non-web-search URLs (images, maps, shopping), rejects non-Google URLs, handles URL encoding. Pure function — no mocks needed.

## Acceptance criteria

- [ ] Vitest configured and runnable via `npm test`
- [ ] Karakeep Client: test successful search returns normalized array of results
- [ ] Karakeep Client: test 401 returns auth error
- [ ] Karakeep Client: test 500 / network failure returns appropriate error
- [ ] Karakeep Client: test timeout behavior
- [ ] Query Extractor: test extracts `q` from google.com, google.dk, google.co.uk
- [ ] Query Extractor: test rejects Google image/maps/shopping URLs
- [ ] Query Extractor: test rejects non-Google URLs
- [ ] Query Extractor: test handles URL-encoded queries
- [ ] All tests pass in CI-compatible manner (no browser required)

## Blocked by

- Blocked by [02-google-search-sidebar-results.md](02-google-search-sidebar-results.md)

## User stories addressed

- Quality gate — no direct user story
