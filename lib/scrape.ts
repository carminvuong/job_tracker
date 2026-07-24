import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

export type ExtractedJobDetails = {
  company: string;
  role: string;
  location: string | null;
};

async function fetchHtml(url: string): Promise<string> {
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

  return res.text();
}

// Most ATS platforms (Greenhouse, Lever, Workday, etc.) embed schema.org
// JobPosting JSON-LD for Google/LinkedIn indexing — read that directly
// rather than guessing from visible page text.
function extractFromJsonLd($: CheerioAPI): ExtractedJobDetails | null {
  const scripts = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).text())
    .get();

  for (const raw of scripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const graph = parsed as { "@graph"?: unknown[] };
    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(graph?.["@graph"])
        ? graph["@graph"]!
        : [parsed];

    for (const item of candidates) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const type = obj["@type"];
      const isJobPosting = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
      if (!isJobPosting) continue;

      const role = typeof obj.title === "string" ? obj.title.trim() : "";

      let company = "";
      const org = obj.hiringOrganization as { name?: unknown } | string | undefined;
      if (typeof org === "string") company = org.trim();
      else if (org && typeof org.name === "string") company = org.name.trim();

      let location: string | null = null;
      const rawLocation = obj.jobLocation;
      const jobLocation = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
      const address = (jobLocation as { address?: Record<string, unknown> } | undefined)?.address;
      if (address) {
        location =
          [address.addressLocality, address.addressRegion, address.addressCountry]
            .filter((part): part is string => typeof part === "string" && part.length > 0)
            .join(", ") || null;
      }
      if (!location && obj.jobLocationType === "TELECOMMUTE") location = "Remote";

      if (role || company) {
        return { company, role, location };
      }
    }
  }

  return null;
}

// Fallback for sites without structured data: pull the OpenGraph/page
// title and split on common "Role at Company" / "Role - Company" patterns.
function extractFromMeta($: CheerioAPI): ExtractedJobDetails {
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() ?? "";
  const ogSiteName = $('meta[property="og:site_name"]').attr("content")?.trim() ?? "";
  const pageTitle = $("title").text().trim();

  const text = ogTitle || pageTitle;
  let role = text;
  let company = ogSiteName;

  const separators = [" at ", " - ", " | ", " :: ", " — "];
  for (const sep of separators) {
    if (text.includes(sep)) {
      const [first, second] = text.split(sep);
      role = first.trim();
      if (!company) company = second?.trim() ?? "";
      break;
    }
  }

  return { company, role, location: null };
}

export async function fetchJobInfo(url: string): Promise<ExtractedJobDetails> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const fromJsonLd = extractFromJsonLd($);
  if (fromJsonLd && (fromJsonLd.role || fromJsonLd.company)) {
    return fromJsonLd;
  }

  const fromMeta = extractFromMeta($);
  if (!fromMeta.role && !fromMeta.company) {
    throw new Error("Could not find job details on this page — enter them manually");
  }
  return fromMeta;
}
