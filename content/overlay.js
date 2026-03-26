// Content Script — injects Karakeep overlay into Google search results

const OVERLAY_CSS = `
:host {
  all: initial;
  display: block;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #202124;
}
.karakeep-overlay {
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  max-width: 366px;
  box-sizing: border-box;
}
.karakeep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dadce0;
}
.karakeep-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1967d2;
  margin: 0;
}
.karakeep-dismiss {
  background: none;
  border: none;
  font-size: 18px;
  color: #5f6368;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.karakeep-dismiss:hover { color: #202124; }
.karakeep-results { }
.karakeep-overlay.collapsed .karakeep-results { display: none; }
.karakeep-overlay.collapsed .karakeep-header { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.karakeep-count {
  font-size: 12px;
  color: #5f6368;
  margin-left: 6px;
  display: none;
}
.karakeep-overlay.collapsed .karakeep-count { display: inline; }
.karakeep-result {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ebebeb;
}
.karakeep-result:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.karakeep-result a {
  color: #1a0dab;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}
.karakeep-result a:hover { text-decoration: underline; }
.karakeep-result-url {
  color: #006621;
  font-size: 12px;
  margin: 2px 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.karakeep-result-desc {
  color: #4d5156;
  font-size: 13px;
  line-height: 1.4;
  margin: 0 0 4px;
}
.karakeep-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.karakeep-tag {
  background: #e8f0fe;
  color: #1967d2;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Dark mode */
:host(.dark) {
  color: #bdc1c6;
}
:host(.dark) .karakeep-overlay {
  background: #303134;
  border-color: #5f6368;
}
:host(.dark) .karakeep-header {
  border-bottom-color: #5f6368;
}
:host(.dark) .karakeep-header-title {
  color: #8ab4f8;
}
:host(.dark) .karakeep-dismiss {
  color: #9aa0a6;
}
:host(.dark) .karakeep-count {
  color: #9aa0a6;
}
:host(.dark) .karakeep-dismiss:hover {
  color: #bdc1c6;
}
:host(.dark) .karakeep-result {
  border-bottom-color: #3c4043;
}
:host(.dark) .karakeep-result a {
  color: #8ab4f8;
}
:host(.dark) .karakeep-result-url {
  color: #bdc1c6;
}
:host(.dark) .karakeep-result-desc {
  color: #9aa0a6;
}
:host(.dark) .karakeep-tag {
  background: #394457;
  color: #8ab4f8;
}
`;

let shadowHost = null;
let shadowRoot = null;
let collapsed = false;

function isDarkMode() {
  // Check Google's dark mode attribute (html[data-darkmode="true"] or body has dark class)
  if (document.documentElement.getAttribute("data-darkmode") === "true") return true;
  if (document.body?.classList.contains("srp-dark")) return true;
  // Fall back to system/browser preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme() {
  if (!shadowHost) return;
  shadowHost.classList.toggle("dark", isDarkMode());
}

// React to live system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

// React to Google's dark mode attribute changes
new MutationObserver(applyTheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-darkmode"],
});

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

  return `<div class="karakeep-overlay${collapsed ? " collapsed" : ""}">
    <div class="karakeep-header">
      <span class="karakeep-header-title">Karakeep<span class="karakeep-count">(${results.length})</span></span>
      <button class="karakeep-dismiss" aria-label="Toggle">${collapsed ? "&#x25B6;" : "&#x25BC;"}</button>
    </div>
    <div class="karakeep-results">${cards}</div>
  </div>`;
}

function injectOverlay(results) {
  const rhs = ensureRhs();

  // Ensure #rhs has enough width for the overlay
  rhs.style.minWidth = "366px";

  if (!shadowHost) {
    shadowHost = document.createElement("div");
    shadowHost.id = "karakeep-overlay-host";
    shadowHost.style.width = "366px";
    shadowRoot = shadowHost.attachShadow({ mode: "closed" });
    rhs.prepend(shadowHost);
  }

  // Inline CSS into shadow DOM
  shadowRoot.innerHTML = `<style>${OVERLAY_CSS}</style>${buildOverlay(results)}`;

  applyTheme();

  // Toggle collapse handler
  shadowRoot.querySelector(".karakeep-dismiss").addEventListener("click", () => {
    collapsed = !collapsed;
    const overlay = shadowRoot.querySelector(".karakeep-overlay");
    overlay.classList.toggle("collapsed", collapsed);
    shadowRoot.querySelector(".karakeep-dismiss").innerHTML = collapsed ? "&#x25B6;" : "&#x25BC;";
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
    injectOverlay(msg.results);
  }
});
