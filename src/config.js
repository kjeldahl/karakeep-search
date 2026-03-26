// Config Manager — reads/writes server URL and API key from browser.storage

export async function getConfig() {
  const sync = await browser.storage.sync.get(["serverUrl", "apiKey"]);
  return {
    serverUrl: sync.serverUrl || "",
    apiKey: sync.apiKey || "",
  };
}

export async function saveCredentials(serverUrl, apiKey) {
  await browser.storage.sync.set({ serverUrl: serverUrl.replace(/\/+$/, ""), apiKey });
}
