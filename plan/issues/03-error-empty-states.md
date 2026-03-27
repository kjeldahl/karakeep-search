## Parent PRD

[prd.md](../prd.md)

## What to build

Handle empty results and API errors gracefully in the sidebar. When Karakeep returns zero results, show "No bookmarks found for [query]". When the API call fails (network error, auth failure, timeout, server error), show an error message with a retry button that re-fires the search without reloading the page.

## Acceptance criteria

- [ ] Sidebar shows "No bookmarks found for [query]" when API returns empty results
- [ ] Sidebar shows descriptive error message on API failure (network, 401, 500, timeout)
- [ ] Retry button is visible on error state
- [ ] Clicking retry re-triggers the Karakeep search for the current query
- [ ] Successful retry replaces error state with results or empty state

## Blocked by

- Blocked by [02-google-search-sidebar-results.md](02-google-search-sidebar-results.md)

## User stories addressed

- User story 10
- User story 11
