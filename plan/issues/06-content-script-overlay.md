# Issue #06: Content script scaffold + basic overlay injection

## Parent PRD

prd-overlay.md

## What to build

Add a content script injected on Google search pages that receives Karakeep results from the background script and renders them as a styled card in the right column (`#rhs`). The background script sends results to the content script via `browser.tabs.sendMessage()` in addition to the existing sidebar messaging. The overlay card shows a Karakeep-branded header and a list of result cards (title as clickable link, URL, description, tags). Styled to match Google's knowledge panel aesthetic (light mode only for this slice). CSS isolated via shadow DOM or prefixed classes per the PRD.

## Acceptance criteria

- [ ] Manifest includes `content_scripts` entry targeting `*://www.google.*/search*`
- [ ] Content script receives results from background script via `runtime.onMessage`
- [ ] Overlay card injected into `#rhs` (created if missing)
- [ ] Each result shows title (clickable link), URL, description, and tags
- [ ] Overlay has a header clearly branded as Karakeep
- [ ] Styles are isolated from Google's page CSS (shadow DOM or prefixed)
- [ ] Works on google.com, google.dk, google.co.uk
- [ ] Does not appear on Google Images, Shopping, News (inherited from content_scripts match + query extractor)

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 2
- User story 6
- User story 7
- User story 8
- User story 9
- User story 14
- User story 15
