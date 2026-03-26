// Sidebar UI — placeholder for issue 01, fleshed out in issue 02
const content = document.getElementById("content");

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "loading") {
    content.innerHTML = `<p class="empty">Searching for "${msg.query}"...</p>`;
  } else if (msg.type === "results") {
    if (msg.results.length === 0) {
      content.innerHTML = `<p class="empty">No bookmarks found.</p>`;
    } else {
      content.innerHTML = msg.results
        .map(
          (r) =>
            `<div style="margin-bottom:10px">
              <a href="${r.url}" target="_blank">${r.title}</a>
              <div style="color:#666;font-size:12px">${r.url}</div>
            </div>`
        )
        .join("");
    }
  } else if (msg.type === "error") {
    content.innerHTML = `<p class="error" style="color:#d93025">${msg.error}</p>`;
  }
});
