# Issue #07: Dismiss button + new-search reappearance

## Parent PRD

prd-overlay.md

## What to build

Add a dismiss (X) button to the overlay card. Clicking it hides the overlay for the current search. Dismiss state is held in-memory only (JS variable). When the user performs a new Google search (full page load or SPA-style navigation), the dismiss state resets and the overlay reappears if there are results. The content script should handle both fresh page loads and in-tab navigation updates from the background script.

## Acceptance criteria

- [ ] Overlay has a visible X/dismiss button in the header
- [ ] Clicking dismiss hides the overlay immediately
- [ ] Performing a new Google search after dismissing shows the overlay again (if results exist)
- [ ] Works for both full page reloads and SPA-style Google navigations
- [ ] Dismiss state is not persisted to storage

## Blocked by

- Blocked by issues/06-content-script-overlay.md

## User stories addressed

- User story 10
- User story 11
- User story 16
