// Content Script — injects Karakeep overlay into Google search results

let shadowHost = null;
let shadowRoot = null;
let dismissed = false;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function ensureRhs() {
  let rhs = document.getElementById("rhs");
  if (rhs) return rhs;
  // Create #rhs if missing — insert after #center_col
  rhs = document.createElement("div");
  rhs.id = "rhs";
  const center = document.getElementById("center_col");
  if (center && center.parentElement) {
    center.parentElement.insertBefore(rhs, center.nextSibling);
  } else {
    document.body.appendChild(rhs);
  }
  return rhs;
}

function buildOverlay(results) {
  const cards = results.map((r) => {
    const tags = r.tags.length
      ? `<div class="karakeep-tags">${r.tags.map((t) => `<span class="karakeep-tag">${escapeHtml(t)}</span>`).join("")}</div>`
      : "";
    const desc = r.description
      ? `<p class="karakeep-result-desc">${escapeHtml(r.description)}</p>`
      : "";
    return `<div class="karakeep-result">
      <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a>
      <div class="karakeep-result-url">${escapeHtml(r.url)}</div>
      ${desc}
      ${tags}
    </div>`;
  }).join("");

  return `<div class="karakeep-overlay">
    <div class="karakeep-header">
      <span class="karakeep-header-title">Karakeep</span>
      <button class="karakeep-dismiss" aria-label="Dismiss">&times;</button>
    </div>
    ${cards}
  </div>`;
}

function injectOverlay(results) {
  if (dismissed) return;

  const rhs = ensureRhs();

  if (!shadowHost) {
    shadowHost = document.createElement("div");
    shadowHost.id = "karakeep-overlay-host";
    shadowRoot = shadowHost.attachShadow({ mode: "closed" });
    rhs.prepend(shadowHost);
  }

  // Fetch CSS and inject into shadow DOM
  const cssUrl = browser.runtime.getURL("content/overlay.css");
  shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssUrl}">${buildOverlay(results)}`;

  // Dismiss handler
  shadowRoot.querySelector(".karakeep-dismiss").addEventListener("click", () => {
    dismissed = true;
    shadowHost.remove();
    shadowHost = null;
    shadowRoot = null;
  });
}

function removeOverlay() {
  if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
    shadowRoot = null;
  }
}

// Listen for results from background script
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "karakeep-results") {
    dismissed = false; // new search resets dismiss
    injectOverlay(msg.results);
  }
});
