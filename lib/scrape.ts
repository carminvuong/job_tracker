import * as cheerio from "cheerio";

const MAX_CHARS = 8000;

export async function fetchPageText(url: string): Promise<string> {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("URL must be http or https");
  }

  const res = await fetch(parsed.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch job posting (status ${res.status})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const jsonLd = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).text())
    .get()
    .join("\n");

  const title = $("title").text();
  const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
  const ogSiteName = $('meta[property="og:site_name"]').attr("content") ?? "";

  $("script, style, noscript, svg").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  const combined = [
    `Page title: ${title}`,
    ogTitle ? `OG title: ${ogTitle}` : "",
    ogSiteName ? `OG site name: ${ogSiteName}` : "",
    jsonLd ? `JSON-LD:\n${jsonLd}` : "",
    `Body text:\n${bodyText}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (!combined.trim()) {
    throw new Error("Page returned no readable content");
  }

  return combined.slice(0, MAX_CHARS);
}
