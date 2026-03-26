import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchBookmarks } from "./karakeep-client.js";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("searchBookmarks", () => {
  it("returns normalized results on success", async () => {
    const mockResponse = {
      bookmarks: [
        {
          id: "1",
          title: "My Bookmark",
          content: { url: "https://example.com", description: "A site", type: "link" },
          tags: [{ name: "dev" }, { name: "tools" }],
        },
        {
          id: "2",
          title: null,
          content: { title: "Fallback Title", url: "https://other.com" },
          tags: [],
          summary: "A summary",
        },
      ],
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const results = await searchBookmarks("https://karakeep.example.com", "key123", "test");

    expect(fetch).toHaveBeenCalledOnce();
    const callUrl = fetch.mock.calls[0][0];
    expect(callUrl).toContain("/api/v1/bookmarks/search?q=test&limit=10");

    expect(results).toEqual([
      { id: "1", title: "My Bookmark", url: "https://example.com", description: "A site", tags: ["dev", "tools"] },
      { id: "2", title: "Fallback Title", url: "https://other.com", description: "A summary", tags: [] },
    ]);
  });

  it("encodes spaces in query parameter", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookmarks: [] }),
    }));

    await searchBookmarks("https://karakeep.example.com", "key123", "ruby on rails");

    const callUrl = fetch.mock.calls[0][0];
    expect(callUrl).toContain("/api/v1/bookmarks/search?");
    expect(callUrl).toContain("q=ruby+on+rails");
    // Should NOT contain raw spaces
    expect(callUrl).not.toContain("q=ruby on rails");
  });

  it("throws on 401 auth error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }));

    await expect(searchBookmarks("https://k.example.com", "bad-key", "q"))
      .rejects.toThrow("Karakeep API error: 401");
  });

  it("throws on 500 server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    await expect(searchBookmarks("https://k.example.com", "key", "q"))
      .rejects.toThrow("Karakeep API error: 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(searchBookmarks("https://k.example.com", "key", "q"))
      .rejects.toThrow("Failed to fetch");
  });

  it("aborts on timeout", async () => {
    vi.useFakeTimers();

    vi.stubGlobal("fetch", vi.fn().mockImplementation((url, opts) => {
      return new Promise((_, reject) => {
        opts.signal.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });
    }));

    const promise = searchBookmarks("https://k.example.com", "key", "q");
    vi.advanceTimersByTime(10000);

    await expect(promise).rejects.toThrow("aborted");

    vi.useRealTimers();
  });
});
