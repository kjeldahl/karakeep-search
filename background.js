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
  if (!config.sidebarEnabled || !config.serverUrl || !config.apiKey) return;

  // Notify sidebar: loading
  browser.runtime.sendMessage({ type: "loading", query }).catch(() => {});

  try {
    const results = await searchBookmarks(config.serverUrl, config.apiKey, query);
    browser.runtime.sendMessage({ type: "results", query, results }).catch(() => {});
  } catch (err) {
    browser.runtime.sendMessage({ type: "error", query, error: err.message }).catch(() => {});
  }
});

// Listen for manual search requests from sidebar/options
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "testConnection") {
    return searchBookmarks(msg.serverUrl, msg.apiKey, "test", 1)
      .then(() => ({ ok: true }))
      .catch((err) => ({ ok: false, error: err.message }));
  }
});
