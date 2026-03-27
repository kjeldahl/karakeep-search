# Karakeep Search

A Firefox extension that shows your Karakeep bookmarks alongside Google search results.

## What it does

When you search Google, this extension automatically searches your Karakeep instance and displays matching bookmarks in an overlay on the right side of the search results page.

## Features

- **Automatic overlay** — appears on Google search results when bookmarks match your query
- **Dark mode support** — follows your system/browser preference
- **Click to visit** — click any result to open the bookmarked page
- **Alt/Shift+Click** — opens the bookmark in Karakeep's preview page instead
- **Collapsible** — minimize the overlay to just show the count

## Setup

1. Install the extension in Firefox
2. Click the toolbar icon → Settings
3. Enter your Karakeep server URL and API key
4. Test the connection

## Usage

Search on Google. If you have matching bookmarks in Karakeep, they'll appear in the right column. No sidebar needed.

## Development

### Building

```bash
npm install
npm run build
```

This creates `karakeep-search-1.0.xpi` for distribution.

### Signing (for distribution)

To create a signed extension for regular Firefox:

1. Get API keys from https://addons.mozilla.org/en-US/developers/addon/api/key/
2. Set environment variables:
   ```bash
   export WEB_EXT_API_KEY=your-jwt-issuer
   export WEB_EXT_API_SECRET=your-jwt-secret
   ```
3. Run: `npm run sign`

The signed .xpi will be in `web-ext-artifacts/`.

### Linting

```bash
npm run lint
```

## License

MIT
