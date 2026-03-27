// Background Script — orchestrator
import { getConfig } from "./src/config.js";
import { searchBookmarks } from "./src/karakeep-client.js";
import { extractQuery } from "./src/query-extractor.js";

let lastQuery = null;

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
