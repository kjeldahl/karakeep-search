// Background Script — orchestrator
import { getConfig } from "./src/config.js";
import { searchBookmarks } from "./src/karakeep-client.js";
import { extractQuery } from "./src/query-extractor.js";

let lastQuery = null;

// Update toolbar icon based on Firefox theme
function updateActionIcon(theme) {
  const toolbarColor = theme?.colors?.toolbar;
  let dark;
  
  if (toolbarColor) {
    dark = isColorDark(toolbarColor);
  } else {
    // Fallback: use prefers-color-scheme
    dark = globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  }
  
  // dark theme = use light colored icon, light theme = use dark colored icon
  const iconPath = dark ? "icons/icon" : "icons/icon-light";
  browser.action.setIcon({
    path: { 48: `${iconPath}-48.png`, 96: `${iconPath}-96.png` },
  }).catch(() => {});
}

function isColorDark(color) {
  let r, g, b;
  if (Array.isArray(color)) {
    [r, g, b] = color;
  } else if (typeof color === "string") {
    const m = color.match(/\d+/g);
    if (!m) return false;
    [r, g, b] = m.map(Number);
  } else {
    return false;
  }
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// Set initial icon and listen for theme changes
browser.theme.getCurrent().then(updateActionIcon);
browser.theme.onUpdated.addListener(({ theme }) => updateActionIcon(theme));

// Also listen for system preference changes
if (globalThis.matchMedia) {
  globalThis.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    browser.theme.getCurrent().then(updateActionIcon);
  });
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  const query = extractQuery(tab.url || "");
  if (!query || query === lastQuery) return;
  lastQuery = query;

  const config = await getConfig();
  if (!config.serverUrl || !config.apiKey) return;

  try {
    const results = await searchBookmarks(config.serverUrl, config.apiKey, query);
    // Send to content script overlay if there are results
    if (results.length > 0) {
      browser.tabs.sendMessage(tabId, { type: "karakeep-results", results, query, serverUrl: config.serverUrl }).catch(() => {});
    }
  } catch (err) {
    console.error("Karakeep search error:", err);
  }
});

// Toolbar icon click opens options page
browser.action.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

// Listen for manual search requests from options page
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "testConnection") {
    return searchBookmarks(msg.serverUrl, msg.apiKey, "test", 1)
      .then(() => ({ ok: true }))
      .catch((err) => ({ ok: false, error: err.message }));
  }
});
