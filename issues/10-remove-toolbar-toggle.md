# Issue #10: Remove toolbar toggle

## Parent PRD

prd-overlay.md

## What to build

Remove the toolbar button and toggle persistence logic. This includes removing `browser_action` from the manifest, removing badge text/color logic, removing the toggle state from `browser.storage.local`, and removing the click handler. The sidebar remains accessible via Firefox's View → Sidebar menu. Background script no longer checks toggle state before fetching results.

## Acceptance criteria

- [ ] No toolbar button appears when the extension is installed
- [ ] No badge text or color logic in background script
- [ ] Toggle state no longer read from or written to `browser.storage.local`
- [ ] Background script always fetches results when on a Google search page (no toggle gate)
- [ ] Sidebar still accessible via Firefox sidebar menu

## Blocked by

None - can start immediately

## User stories addressed

- User story 17
