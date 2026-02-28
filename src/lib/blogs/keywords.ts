export const BLOG_FILTER_KEYWORDS = [
  "All",
  "Advisory",
  "Best stocks",
  "Business",
  "Featured",
  "Ipo",
  "Market",
  "Mutual funds",
  "News",
  "Price action",
] as const;

export type BlogFilterKeyword = (typeof BLOG_FILTER_KEYWORDS)[number];

export const BLOG_ASSIGNABLE_KEYWORDS = BLOG_FILTER_KEYWORDS.filter(
  (keyword) => keyword !== "All"
) as Exclude<BlogFilterKeyword, "All">[];

const KEYWORD_LOOKUP = new Map(
  BLOG_FILTER_KEYWORDS.map((keyword) => [keyword.toLowerCase(), keyword])
);

export function resolveBlogKeyword(rawValue: string | null | undefined): BlogFilterKeyword {
  if (!rawValue) {
    return "All";
  }

  const normalized = rawValue.trim().toLowerCase();
  return KEYWORD_LOOKUP.get(normalized) ?? "All";
}

export function sanitizeAssignableKeywords(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const allowed = new Set(BLOG_ASSIGNABLE_KEYWORDS);
  const deduped = new Set<string>();

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const resolved = resolveBlogKeyword(value);
    if (resolved === "All") {
      continue;
    }

    if (allowed.has(resolved)) {
      deduped.add(resolved);
    }
  }

  return Array.from(deduped);
}

export function isAllKeyword(keyword: string): boolean {
  return keyword.trim().toLowerCase() === "all";
}
