// Sidebar UI — displays Karakeep search results
const content = document.getElementById("content");
let currentQuery = null;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderSkeleton() {
  const cards = Array.from({ length: 3 }, () =>
    `<div class="skeleton-card">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line url"></div>
      <div class="skeleton-line desc"></div>
      <div class="skeleton-line tags"></div>
    </div>`
  ).join("");
  content.innerHTML = cards;
}

function renderResults(query, results) {
  if (results.length === 0) {
    content.innerHTML = `<p class="empty">No bookmarks found for &ldquo;${escapeHtml(query)}&rdquo;</p>`;
    return;
  }
  content.innerHTML = results.map((r) => {
    const tags = r.tags.length
      ? `<div class="result-tags">${r.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`
      : "";
    const desc = r.description
      ? `<p class="result-desc">${escapeHtml(r.description)}</p>`
      : "";
    return `<div class="result-card">
      <a href="${escapeHtml(r.url)}" target="_blank">${escapeHtml(r.title)}</a>
      <div class="result-url">${escapeHtml(r.url)}</div>
      ${desc}
      ${tags}
    </div>`;
  }).join("");
}

function renderError(error) {
  content.innerHTML = `<div class="error-state">
    <p class="error-msg">${escapeHtml(error)}</p>
    <button id="retry-btn" class="retry-btn">Retry</button>
  </div>`;
  document.getElementById("retry-btn").addEventListener("click", () => {
    renderSkeleton();
    browser.runtime.sendMessage({ type: "retry" }).catch(() => {});
  });
}

// Request search for current tab on sidebar open
browser.runtime.sendMessage({ type: "sidebarOpened" }).catch(() => {});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.query) currentQuery = msg.query;
  if (msg.type === "loading") {
    renderSkeleton();
  } else if (msg.type === "results") {
    renderResults(msg.query || currentQuery, msg.results);
  } else if (msg.type === "error") {
    renderError(msg.error);
  }
});
