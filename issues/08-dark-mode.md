# Issue #08: Dark mode support

## Parent PRD

prd-overlay.md

## What to build

Add automatic dark/light mode support to the overlay. Detect the active color scheme using `prefers-color-scheme` media query and/or Google's dark mode DOM signals. Apply appropriate color tokens (background, text, borders, tag colors). Listen for live changes via `matchMedia.addEventListener('change', ...)` so the overlay reacts if the user toggles their system theme while on the page.

## Acceptance criteria

- [ ] Overlay renders with light colors when system/browser is in light mode
- [ ] Overlay renders with dark colors when system/browser is in dark mode
- [ ] Overlay reacts to live theme changes without page reload
- [ ] Colors are readable and visually consistent in both modes
- [ ] No manual configuration for color scheme

## Blocked by

- Blocked by issues/06-content-script-overlay.md

## User stories addressed

- User story 12
- User story 13
