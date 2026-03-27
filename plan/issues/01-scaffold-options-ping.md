## Parent PRD

[prd.md](../prd.md)

## What to build

Scaffold the Firefox extension with manifest, Config Manager, Options Page, and Karakeep Client. The user enters their Karakeep server URL and API key in the options page. The extension stores these in `browser.storage.sync` and verifies the connection by performing a test search against the Karakeep API. No sidebar yet — this slice proves the auth and API integration work end-to-end.

## Acceptance criteria

- [ ] Firefox extension loads without errors (manifest, background script, options page)
- [ ] Options page has fields for server URL and API key
- [ ] Saving options persists values to `browser.storage.sync`
- [ ] Options page performs a test API call and shows success/failure feedback
- [ ] Karakeep Client sends correct auth header and query params per API contract in PRD
- [ ] `host_permissions` configured so fetch bypasses CORS

## Blocked by

None - can start immediately

## User stories addressed

- User story 2
- User story 3
- User story 17
