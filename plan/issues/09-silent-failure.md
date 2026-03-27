# Issue #09: Silent failure + no-results hiding

## Parent PRD

prd-overlay.md

## What to build

Modify the background script so it only sends messages to the content script when results are non-empty. On API errors, log the error to the browser console but do not send any message to the content script (overlay simply won't appear). This ensures the overlay is invisible when there's nothing useful to show.

## Acceptance criteria

- [ ] Overlay does not appear when Karakeep returns zero results
- [ ] Overlay does not appear when the API call fails
- [ ] API errors are logged to the browser console with useful detail
- [ ] Sidebar continues to receive all messages (results, empty, errors) as before

## Blocked by

- Blocked by issues/06-content-script-overlay.md

## User stories addressed

- User story 3
- User story 4
- User story 5
