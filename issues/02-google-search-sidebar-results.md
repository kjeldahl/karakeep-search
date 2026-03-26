## Parent PRD

[prd.md](../prd.md)

## What to build

Detect Google web searches and display Karakeep results in a native Firefox sidebar. Query Extractor parses the search query from Google URLs across all country domains (web search only, not images/shopping/news). Background script listens for tab updates, extracts the query, calls Karakeep Client, and sends results to the sidebar. Sidebar UI shows a loading skeleton while fetching, then displays results as cards with title (linked), URL, description, and tags. Results sorted by relevance, capped at 10. Sidebar updates when the user performs a new search.

## Acceptance criteria

- [ ] Sidebar opens via `sidebar_action` in manifest
- [ ] Query Extractor correctly extracts `q` param from `google.com`, `google.dk`, `google.co.uk`, etc.
- [ ] Query Extractor rejects non-web-search Google URLs (images, maps, shopping)
- [ ] Background script detects Google searches on tab update and triggers Karakeep search
- [ ] Sidebar shows loading skeleton while API call is in flight
- [ ] Results display title (clickable link), URL, description, and tags
- [ ] Results capped at 10, sorted by relevance
- [ ] Sidebar updates when navigating to a new Google search

## Blocked by

- Blocked by [01-scaffold-options-ping.md](01-scaffold-options-ping.md)

## User stories addressed

- User story 1
- User story 4
- User story 5
- User story 6
- User story 7
- User story 8
- User story 9
- User story 14
- User story 15
- User story 16
