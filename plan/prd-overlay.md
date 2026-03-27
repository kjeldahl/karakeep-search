# PRD: Karakeep Overlay on Google Search Results

## Problem Statement

The existing sidebar shows Karakeep results but requires the user to have the sidebar open — it doesn't surface results automatically on the search page itself. Users may not notice or bother opening the sidebar, so saved bookmarks remain invisible during the most relevant moment: while scanning Google results.

## Solution

Inject an overlay panel directly into the Google search results page, positioned in the right column (where Google shows knowledge panels). The overlay displays Karakeep bookmark matches for the current query, styled to blend with Google's UI while clearly branded as Karakeep. The overlay supports light and dark mode automatically. It is dismissible per-search but reappears on the next search. The existing sidebar remains unchanged as a secondary view.

## User Stories

1. As a user, I want to see my Karakeep bookmarks in the right column of Google search results, so that I notice relevant saved content without any extra action.
2. As a user, I want the overlay to appear automatically when there are matching bookmarks, so that I don't have to manually trigger anything.
3. As a user, I want the overlay to not appear when there are no matching bookmarks, so that it doesn't waste screen space.
4. As a user, I want the overlay to silently not appear when the API call fails, so that errors don't disrupt my search experience.
5. As a user, I want API errors logged to the browser console, so that I can debug issues if needed.
6. As a user, I want each result in the overlay to show title, URL, description, and tags, so that I can assess relevance at a glance.
7. As a user, I want result titles to be clickable links, so that I can navigate directly to the bookmarked page.
8. As a user, I want the overlay styled to match Google's knowledge panel aesthetic, so that it feels native to the page.
9. As a user, I want the overlay clearly marked as coming from Karakeep, so that I can distinguish it from Google's own results.
10. As a user, I want to dismiss the overlay with an X button, so that I can hide it when I don't need it for this search.
11. As a user, I want the overlay to reappear when I perform a new Google search after dismissing it, so that I still see results for future queries.
12. As a user, I want the overlay to support dark mode, following Google's theme / browser / system preference automatically, so that it doesn't look jarring in dark mode.
13. As a user, I want the overlay to support light mode, matching the default Google appearance.
14. As a user, I want the overlay to work on all Google country domains (google.dk, google.co.uk, etc.), so that it works regardless of my locale.
15. As a user, I want the overlay to only appear on Google web search (not images, shopping, news), so that it doesn't clutter irrelevant pages.
16. As a user, I want the overlay to update when I perform a new search on the same tab, so that results always match my current query.
17. As a user, I want the existing sidebar to continue working as before, so that I have a secondary way to view results.

## Implementation Decisions

### Architecture

Add two new concerns, modify one, keep rest as-is:

- **Content Script (new)** — injected on Google search pages via manifest `content_scripts`. Receives Karakeep results from the background script via `tabs.sendMessage`. Builds and injects the overlay DOM into Google's right column (`#rhs` or creates one). Handles dismiss button. Scopes all CSS to avoid clashing with Google's styles (shadow DOM or prefixed classes). Detects color scheme via `prefers-color-scheme` media query or Google's dark mode DOM signals.

- **Background Script (modify)** — after fetching Karakeep results, sends them to the active tab's content script via `browser.tabs.sendMessage()` in addition to the existing sidebar messaging. Remove toolbar toggle logic (badge text/color, toggle state storage, browser action click handler). Only send to content script when there are results (non-empty array). Log errors to console but do not send error messages to content script.

- **Manifest (modify)** — add `content_scripts` entry targeting `*://www.google.*/search*` with the content script JS and CSS. Remove `browser_action` / toolbar button configuration.

- **Sidebar, Options Page, Config Manager, Karakeep Client, Query Extractor** — no changes.

### Overlay Injection Details

- Target container: Google's `#rhs` (right-hand side) element. If it doesn't exist, create it and insert it into the page layout.
- The overlay is a card with: Karakeep branding header, result list, dismiss (X) button.
- Dismiss state is held in-memory only (JS variable in content script). Resets on page navigation / new search.
- On SPA-style Google navigations (where the page doesn't fully reload), the content script should listen for messages from background to update results.

### Dark Mode Detection

- Use `window.matchMedia('(prefers-color-scheme: dark)')` to detect system/browser preference.
- Additionally check for Google's dark mode class on the body/html element as a signal.
- Apply appropriate color tokens (background, text, borders, tag colors) based on detected mode.
- Listen for changes via `matchMedia.addEventListener('change', ...)` to react to live toggles.

### Communication Flow

1. User navigates to Google search → `tabs.onUpdated` fires in background script
2. Background script extracts query, fetches Karakeep results
3. If results exist: `browser.tabs.sendMessage(tabId, { type: 'karakeep-results', results, query })`
4. If no results or error: do not message content script (overlay won't appear). Log errors to console.
5. Content script receives message, injects/updates overlay in right column
6. Sidebar continues to receive messages as before (including empty/error states)

### Toolbar Toggle Removal

- Remove `browser_action` from manifest
- Remove badge text/color logic from background script
- Remove toggle state from `browser.storage.local`
- Remove click handler for toolbar button
- The sidebar remains accessible via Firefox's sidebar menu (View → Sidebar)

## Testing Decisions

Good tests verify external behavior through the module's public interface, not implementation details. Mock external dependencies at the boundary.

### Modules to test

No new unit tests needed for this feature. The new code is primarily DOM manipulation in the content script, which is difficult to unit test without a browser environment and provides low value relative to the effort.

Existing tests remain:
- **Karakeep Client** — 6 tests covering search, encoding, errors, timeout
- **Query Extractor** — 13 tests covering domains, verticals, edge cases

### Manual testing checklist

- Overlay appears in right column on google.com search with matching bookmarks
- Overlay does not appear when no bookmarks match
- Overlay does not appear when API fails (check console for error log)
- Dismiss button hides overlay for current search
- New search after dismiss shows overlay again
- Dark mode displays correctly (toggle system theme to verify)
- Light mode displays correctly
- Works on google.dk, google.co.uk
- Does not appear on Google Images, Shopping, News
- Sidebar still works independently

## Out of Scope

- Chrome/Safari support (Firefox only)
- Manual dark/light mode toggle (auto-detect only)
- Caching of search results
- Keyboard shortcuts
- Result expansion (full notes on click)
- Pagination beyond 10 results
- Drag/resize of the overlay
- Toolbar toggle (being removed)
- Loading skeleton in overlay (overlay only appears when results are ready)

## Further Notes

- Shadow DOM is the preferred approach for CSS isolation to avoid Google's styles bleeding in or the overlay's styles leaking out.
- If Google's `#rhs` container layout changes, the injection logic may need updating — this is inherently fragile but standard for content script extensions.
- The sidebar continues to show loading skeletons, empty states, and error states as before. The overlay is a simpler, results-only surface.
