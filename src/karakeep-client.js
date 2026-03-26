// Karakeep Client — wraps GET /api/v1/bookmarks/search

export async function searchBookmarks(serverUrl, apiKey, query, limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const url = `${serverUrl}/api/v1/bookmarks/search?${params}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`Karakeep API error: ${resp.status}`);
    }

    const data = await resp.json();
    return normalizeResults(data.bookmarks || []);
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeResults(bookmarks) {
  return bookmarks.map((b) => ({
    id: b.id,
    title: b.title || b.content?.title || "(untitled)",
    url: b.content?.url || "",
    description: b.content?.description || b.summary || "",
    tags: (b.tags || []).map((t) => t.name),
  }));
}
