// Background Script — orchestrator
import { getConfig, setSidebarEnabled } from "./src/config.js";
import { searchBookmarks } from "./src/karakeep-client.js";
import { extractQuery } from "./src/query-extractor.js";

let lastQuery = null;

// Update toolbar badge to reflect toggle state
async function updateBadge(enabled) {
  const text = enabled ? "" : "OFF";
  const color = enabled ? "#1967d2" : "#999";
  await browser.action.setBadgeText({ text });
  await browser.action.setBadgeBackgroundColor({ color });
  await browser.action.setTitle({
    title: enabled ? "Karakeep Search (on)" : "Karakeep Search (off)",
  });
}

// Init badge on startup
getConfig().then((c) => updateBadge(c.sidebarEnabled));

// Toggle on toolbar button click
browser.action.onClicked.addListener(async () => {
  const config = await getConfig();
  const newState = !config.sidebarEnabled;
  await setSidebarEnabled(newState);
  await updateBadge(newState);
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  const query = extractQuery(tab.url || "");
  if (!query || query === lastQuery) return;
  lastQuery = query;

  const config = await getConfig();
  if (!config.sidebarEnabled || !config.serverUrl || !config.apiKey) return;

  // Notify sidebar: loading
  browser.runtime.sendMessage({ type: "loading", query }).catch(() => {});

  try {
    const results = await searchBookmarks(config.serverUrl, config.apiKey, query);
    browser.runtime.sendMessage({ type: "results", query, results }).catch(() => {});
    // Send to content script overlay if there are results
    if (results.length > 0) {
      browser.tabs.sendMessage(tabId, { type: "karakeep-results", results, query }).catch(() => {});
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
