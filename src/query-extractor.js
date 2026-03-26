// Query Extractor — detects Google web searches and extracts the query

const GOOGLE_HOST_RE = /^www\.google\.[a-z.]+$/;
const NON_WEB_TBM = new Set(["isch", "shop", "nws", "vid"]);

export function extractQuery(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return null;
  }

  if (!GOOGLE_HOST_RE.test(parsed.hostname)) return null;
  if (parsed.pathname !== "/search") return null;

  // Reject non-web search tabs (images, shopping, news, video)
  const tbm = parsed.searchParams.get("tbm");
  if (tbm && NON_WEB_TBM.has(tbm)) return null;

  // MV3 Google also uses `udm` param for verticals
  const udm = parsed.searchParams.get("udm");
  if (udm && udm !== "14") return null; // 14 = web

  const q = parsed.searchParams.get("q");
  return q || null;
}
