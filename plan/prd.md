# PRD: Karakeep Search Mixin for Firefox

## Problem Statement

When searching Google, relevant bookmarks saved in Karakeep are invisible. The user has to separately open Karakeep and search again to check if they've already saved something related. This context switch breaks flow and means saved knowledge often goes unused.

## Solution

A Firefox browser extension that automatically searches the user's Karakeep instance whenever they perform a Google web search, displaying matching bookmarks in a native Firefox sidebar alongside the Google results. Results appear asynchronously with a loading skeleton, and the sidebar can be toggled on/off persistently.

## User Stories

1. As a Karakeep user, I want to see my saved bookmarks alongside Google results, so that I can quickly find things I've already saved without leaving Google.
2. As a user, I want to configure my Karakeep server URL in the extension options, so that it works with any self-hosted Karakeep instance.
3. As a user, I want to enter my Karakeep API key in the extension options, so that the extension can authenticate with my instance.
4. As a user, I want the extension to automatically search Karakeep when I perform a Google web search, so that I don't have to manually trigger it.
5. As a user, I want results to appear in a native Firefox sidebar, so that they feel integrated and persist across page navigations.
6. As a user, I want to see a loading skeleton while Karakeep results are being fetched, so that I know the extension is working.
7. As a user, I want each result to show title, URL, description, and tags, so that I can quickly assess relevance.
8. As a user, I want result titles to be clickable links, so that I can navigate directly to the bookmarked page.
9. As a user, I want results sorted by relevance and capped at 10, so that I only see the most useful matches.
10. As a user, I want to see "No bookmarks found" when there are no matches, so that I know the extension is active but found nothing.
11. As a user, I want to see an error message with a retry button when the API call fails, so that I can recover without reloading the page.
12. As a user, I want to toggle the sidebar on/off, so that I can hide it when I don't need it.
13. As a user, I want the toggle state to persist across browser restarts, so that I don't have to re-enable it every session.
14. As a user, I want the extension to work on all Google country domains (google.dk, google.co.uk, etc.), so that it works regardless of my locale.
15. As a user, I want the extension to only activate on Google web search (not images, shopping, news), so that it doesn't clutter irrelevant pages.
16. As a user, I want the sidebar to update when I perform a new Google search, so that results always match my current query.
17. As a user, I want the extension to bypass CORS via host_permissions, so that I don't need to configure my Karakeep server.

## Implementation Decisions

### Architecture

Six modules:

- **Config Manager** — reads/writes server URL, API key, and toggle state from `browser.storage`. Sync storage for credentials (syncs across Firefox instances), local storage for toggle state.
- **Karakeep Client** — wraps `GET /api/v1/bookmarks/search`. Accepts query string, returns normalized results array. Sends `Authorization: Bearer <key>` header. Handles timeouts and HTTP errors. Parameters: `q`, `limit=10`, `sortOrder=relevance`.
- **Query Extractor** — pure function that takes a URL string, determines if it's a Google web search across any Google domain, and extracts the `q` parameter. Returns `null` for non-matching URLs.
- **Background Script** — orchestrator. Listens for `tabs.onUpdated` events, uses Query Extractor to detect Google searches, checks toggle state via Config Manager, calls Karakeep Client, sends results to Sidebar UI via `runtime.sendMessage`.
- **Sidebar UI** — HTML/CSS/JS rendered in Firefox's native sidebar panel (`sidebar_action`). Three states: loading skeleton, results list, error with retry button. Receives data via `runtime.onMessage`.
- **Options Page** — simple form for server URL + API key. Validates input, writes to Config Manager.

### Technical Decisions

- Firefox WebExtensions Manifest V3 (or V2 if `sidebar_action` requires it — Firefox MV3 support for sidebar_action needs verification)
- Google domain matching: `*://www.google.*/search*` in manifest permissions
- `host_permissions` with user-configured Karakeep domain (use `<all_urls>` or prompt for permission on first use)
- Communication between background script and sidebar via `runtime.sendMessage` / `runtime.onMessage`
- No external dependencies for v1 — vanilla JS, CSS

### API Contract (Karakeep)

```
GET {serverUrl}/api/v1/bookmarks/search?q={query}&limit=10&sortOrder=relevance
Authorization: Bearer {apiKey}

Response: { bookmarks: [...], nextCursor: string|null }
Bookmark shape: { id, title, content: { url, description, type }, tags: [{ name }] }
```

## Testing Decisions

Good tests verify external behavior through the module's public interface, not implementation details. Mock external dependencies (fetch, browser.storage) at the boundary.

### Modules to test:

- **Karakeep Client** — test successful search returns normalized results, test error handling (network failure, 401, 429, 500), test timeout behavior. Mock `fetch` at the boundary.
- **Query Extractor** — test extracts query from google.com, google.dk, google.co.uk URLs. Test rejects non-search Google URLs (images, maps). Test rejects non-Google URLs. Test handles URL encoding. Pure function, no mocks needed.

### Test runner

Vitest or Jest — lightweight, no browser needed for these unit tests.

## Out of Scope

- Chrome/Safari support (Firefox only for v1)
- Relevance score cutoff (Karakeep API doesn't expose scores)
- Inline injection into Google results DOM (sidebar only for v1)
- OAuth or SSO authentication
- Caching of search results
- Keyboard shortcuts
- Dark mode / theme matching
- Result expansion (showing full summary/note on click)
- Pagination beyond 10 results

## Further Notes

- The sidebar result card design (title + URL + description + tags) is a starting point — will iterate once running.
- If Firefox MV3 doesn't fully support `sidebar_action`, fall back to MV2. Firefox has historically had better sidebar API support than Chrome.
- Future iteration may add relevance cutoff if Karakeep/Meilisearch exposes scoring.
