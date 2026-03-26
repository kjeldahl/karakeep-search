import { getConfig, saveCredentials } from "../src/config.js";

const serverUrlEl = document.getElementById("serverUrl");
const apiKeyEl = document.getElementById("apiKey");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

// Load saved values
(async () => {
  const config = await getConfig();
  serverUrlEl.value = config.serverUrl;
  apiKeyEl.value = config.apiKey;
})();

saveBtn.addEventListener("click", async () => {
  const serverUrl = serverUrlEl.value.trim();
  const apiKey = apiKeyEl.value.trim();

  if (!serverUrl || !apiKey) {
    statusEl.textContent = "Both fields are required.";
    statusEl.className = "error";
    return;
  }

  statusEl.textContent = "Saving & testing...";
  statusEl.className = "";

  await saveCredentials(serverUrl, apiKey);

  // Test connection via background script
  const response = await browser.runtime.sendMessage({
    type: "testConnection",
    serverUrl,
    apiKey,
  });

  if (response.ok) {
    statusEl.textContent = "Connected successfully!";
    statusEl.className = "success";
  } else {
    statusEl.textContent = `Connection failed: ${response.error}`;
    statusEl.className = "error";
  }
});
