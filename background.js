// Background Script — orchestrator
import { getConfig } from "./src/config.js";
import { searchBookmarks } from "./src/karakeep-client.js";
import { extractQuery } from "./src/query-extractor.js";

let lastQuery = null;

// Match sidebar icon to Firefox theme
function updateSidebarIcon(theme) {
  const dark = theme?.colors?.toolbar
    ? isColorDark(theme.colors.toolbar)
    : false;
  const variant = dark ? "icon-light" : "icon";
  browser.sidebarAction.setIcon({
    path: { 48: `icons/${variant}-48.png`, 96: `icons/${variant}-96.png` },
  });
}

function isColorDark(color) {
  // Parse rgb(r,g,b) or [r,g,b] array
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

browser.theme.getCurrent().then(updateSidebarIcon);
browser.theme.onUpdated.addListener(({ theme }) => updateSidebarIcon(theme));

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  const query = extractQuery(tab.url || "");
  if (!query || query === lastQuery) return;
  lastQuery = query;

  const config = await getConfig();
  if (!config.serverUrl || !config.apiKey) return;

  // Notify sidebar: loading
  browser.runtime.sendMessage({ type: "loading", query }).catch(() => {});

  try {
    const results = await searchBookmarks(config.serverUrl, config.apiKey, query);
    browser.runtime.sendMessage({ type: "results", query, results }).catch(() => {});
    // Send to content script overlay if there are results
    if (results.length > 0) {
      browser.tabs.sendMessage(tabId, { type: "karakeep-results", results, query, serverUrl: config.serverUrl }).catch(() => {});
    }
  } catch (err) {
    browser.runtime.sendMessage({ type: "error", query, error: err.message }).catch(() => {});
    console.error("Karakeep search error:", err);
  }
});

// Listen for manual search requests from sidebar/options
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "testConnection") {
    return searchBookmarks(msg.serverUrl, msg.apiKey, "test", 1)
      .then(() => ({ ok: true }))
      .catch((err) => ({ ok: false, error: err.message }));
  }

  if (msg.type === "sidebarOpened") {
    return (async () => {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return;
      const query = extractQuery(tab.url);
      if (!query) return;
      const config = await getConfig();
      if (!config.serverUrl || !config.apiKey) return;
      lastQuery = query;
      browser.runtime.sendMessage({ type: "loading", query }).catch(() => {});
      try {
        const results = await searchBookmarks(config.serverUrl, config.apiKey, query);
        browser.runtime.sendMessage({ type: "results", query, results }).catch(() => {});
      } catch (err) {
        browser.runtime.sendMessage({ type: "error", query, error: err.message }).catch(() => {});
      }
    })();
  }

  if (msg.type === "retry" && lastQuery) {
    (async () => {
      const config = await getConfig();
      if (!config.serverUrl || !config.apiKey) return;
      try {
        const results = await searchBookmarks(config.serverUrl, config.apiKey, lastQuery);
        browser.runtime.sendMessage({ type: "results", query: lastQuery, results }).catch(() => {});
      } catch (err) {
        browser.runtime.sendMessage({ type: "error", query: lastQuery, error: err.message }).catch(() => {});
      }
    })();
  }
});
