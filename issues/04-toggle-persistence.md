## Parent PRD

[prd.md](../prd.md)

## What to build

Add a toolbar toggle to enable/disable the Karakeep sidebar search. When toggled off, the background script skips API calls on Google searches. Toggle state persists in `browser.storage.local` across browser restarts. When toggled back on, the next Google search triggers normally.

## Acceptance criteria

- [ ] Toolbar button or browser action toggles the extension on/off
- [ ] Toggle state persists in `browser.storage.local`
- [ ] Extension respects toggle state on browser restart
- [ ] When off, no Karakeep API calls are made on Google searches
- [ ] When toggled on, next Google search triggers sidebar results normally

## Blocked by

- Blocked by [02-google-search-sidebar-results.md](02-google-search-sidebar-results.md)

## User stories addressed

- User story 12
- User story 13
