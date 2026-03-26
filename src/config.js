// Config Manager — reads/writes server URL, API key, and toggle state from browser.storage

export async function getConfig() {
  const sync = await browser.storage.sync.get(["serverUrl", "apiKey"]);
  const local = await browser.storage.local.get(["sidebarEnabled"]);
  return {
    serverUrl: sync.serverUrl || "",
    apiKey: sync.apiKey || "",
    sidebarEnabled: local.sidebarEnabled !== false,
  };
}

export async function saveCredentials(serverUrl, apiKey) {
  await browser.storage.sync.set({ serverUrl: serverUrl.replace(/\/+$/, ""), apiKey });
}

export async function setSidebarEnabled(enabled) {
  await browser.storage.local.set({ sidebarEnabled: enabled });
}
