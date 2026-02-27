import type { BlogListResult, BlogPagination, BlogPost } from "@/types/blog";
import { MOCK_BLOG_POSTS } from "@/lib/blogs/mockData";

const BLOG_CACHE_TAG = "crm-blogs";
const DEFAULT_PAGE_SIZE = 6;
const DEFAULT_REVALIDATE_SECONDS = 300;
const DEFAULT_LIST_ENDPOINT = "/blogs";
const DEFAULT_DETAIL_ENDPOINT = "/blogs/:slug";
const DEFAULT_PAGE_PARAM = "page";
const DEFAULT_LIMIT_PARAM = "limit";
const DEFAULT_SORT_PARAM = "sort";
const DEFAULT_SORT_VALUE = "publishedAt:desc";
const DEFAULT_SLUG_PARAM = "slug";

type JsonObject = Record<string, unknown>;

export const FALLBACK_BLOG_IMAGE =
  "https://via.placeholder.com/1200x675.png?text=Stockology+Blog";

export class CrmApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CrmApiError";
    this.status = status;
  }
}

function shouldUseMockBlogs(): boolean {
  const hasApiBaseUrl = Boolean(process.env.CRM_BLOG_API_BASE_URL?.trim());
  if (!hasApiBaseUrl) {
    return true;
  }

  const configured = process.env.CRM_BLOG_USE_MOCK?.trim().toLowerCase();

  if (configured === "true" || configured === "1" || configured === "yes") {
    return true;
  }

  if (configured === "false" || configured === "0" || configured === "no") {
    return false;
  }

  return false;
}

function shouldFallbackToMockOnApiError(): boolean {
  const configured = process.env.CRM_BLOG_FALLBACK_TO_MOCK?.trim().toLowerCase();
  return configured !== "false" && configured !== "0" && configured !== "no";
}

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonObject;
}

function readByPath(source: unknown, path: string): unknown {
  let current: unknown = source;

  for (const segment of path.split(".")) {
    const obj = asObject(current);
    if (!obj || !(segment in obj)) {
      return undefined;
    }
    current = obj[segment];
  }

  return current;
}

function firstString(source: unknown, paths: string[]): string | null {
  for (const path of paths) {
    const value = readByPath(source, path);

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function firstNumber(source: unknown, paths: string[]): number | null {
  for (const path of paths) {
    const value = readByPath(source, path);

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function firstBoolean(source: unknown, paths: string[]): boolean | null {
  for (const path of paths) {
    const value = readByPath(source, path);
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function stripHtmlTags(content: string): string {
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function createExcerpt(content: string, maxLength = 180): string {
  const plainText = stripHtmlTags(content);
  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toIsoDate(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  return new Date(0).toISOString();
}

function getListEndpoint(): string {
  return process.env.CRM_BLOG_LIST_ENDPOINT?.trim() || DEFAULT_LIST_ENDPOINT;
}

function getDetailEndpoint(): string {
  return process.env.CRM_BLOG_DETAIL_ENDPOINT?.trim() || DEFAULT_DETAIL_ENDPOINT;
}

function getPageParamName(): string {
  return process.env.CRM_BLOG_PAGE_PARAM?.trim() || DEFAULT_PAGE_PARAM;
}

function getLimitParamName(): string {
  return process.env.CRM_BLOG_LIMIT_PARAM?.trim() || DEFAULT_LIMIT_PARAM;
}

function getSlugParamName(): string {
  return process.env.CRM_BLOG_SLUG_PARAM?.trim() || DEFAULT_SLUG_PARAM;
}

function getSortParamName(): string {
  return process.env.CRM_BLOG_SORT_PARAM?.trim() || DEFAULT_SORT_PARAM;
}

function getSortValue(): string {
  return process.env.CRM_BLOG_SORT_VALUE?.trim() || DEFAULT_SORT_VALUE;
}

function getRevalidateSeconds(): number {
  const configured = Number(process.env.CRM_BLOG_REVALIDATE_SECONDS);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.floor(configured);
  }

  return DEFAULT_REVALIDATE_SECONDS;
}

export function getBlogPageSize(): number {
  const configured = Number(process.env.CRM_BLOG_PAGE_SIZE);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(Math.floor(configured), 50);
  }

  return DEFAULT_PAGE_SIZE;
}

function resolveCrmUrl(endpoint: string): URL {
  if (/^https?:\/\//i.test(endpoint)) {
    return new URL(endpoint);
  }

  const baseUrl = process.env.CRM_BLOG_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error(
      "Missing CRM_BLOG_API_BASE_URL. Set it in your environment to fetch blog data."
    );
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");
  return new URL(normalizedEndpoint, normalizedBase);
}

function buildRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const authToken = process.env.CRM_BLOG_API_TOKEN?.trim();
  const authHeaderName = process.env.CRM_BLOG_AUTH_HEADER?.trim() || "Authorization";
  if (authToken) {
    headers[authHeaderName] =
      authHeaderName.toLowerCase() === "authorization"
        ? `Bearer ${authToken}`
        : authToken;
  }

  const apiKey = process.env.CRM_BLOG_API_KEY?.trim();
  if (apiKey) {
    const apiKeyHeader = process.env.CRM_BLOG_API_KEY_HEADER?.trim() || "x-api-key";
    headers[apiKeyHeader] = apiKey;
  }

  return headers;
}

async function fetchCrmJson(url: URL, cacheTag: string): Promise<unknown> {
  const response = await fetch(url.toString(), {
    headers: buildRequestHeaders(),
    next: {
      revalidate: getRevalidateSeconds(),
      tags: [BLOG_CACHE_TAG, cacheTag],
    },
  });

  if (!response.ok) {
    throw new CrmApiError(
      `CRM blog request failed (${response.status}) for ${url.pathname}`,
      response.status
    );
  }

  return (await response.json()) as unknown;
}

function extractImageUrl(source: unknown): string | null {
  const direct = firstString(source, [
    "featuredImage",
    "featured_image",
    "thumbnail",
    "image",
    "coverImage",
    "heroImage",
  ]);
  if (direct) {
    return direct;
  }

  return firstString(source, [
    "featuredImage.url",
    "featuredImage.src",
    "featuredImage.secure_url",
    "featured_image.url",
    "thumbnail.url",
    "image.url",
    "coverImage.url",
    "heroImage.url",
    "seo.ogImage",
    "seo.image",
  ]);
}

function normalizeBlog(raw: unknown): BlogPost | null {
  const source = asObject(raw);
  if (!source) {
    return null;
  }

  const title = firstString(source, [
    "title",
    "name",
    "heading",
    "attributes.title",
    "data.title",
  ]);

  if (!title) {
    return null;
  }

  const id = firstString(source, ["id", "_id", "uuid", "slug"]) || toSlug(title) || "blog";
  const slugCandidate =
    firstString(source, [
      "slug",
      "urlSlug",
      "permalink",
      "attributes.slug",
      "seo.slug",
    ]) || title;
  const slug = toSlug(slugCandidate);

  if (!slug) {
    return null;
  }

  const content =
    firstString(source, [
      "content",
      "body",
      "html",
      "description",
      "fullContent",
      "postContent",
      "attributes.content",
      "attributes.body",
    ]) || "";

  const excerpt =
    firstString(source, [
      "excerpt",
      "summary",
      "previewText",
      "shortDescription",
      "attributes.excerpt",
      "attributes.summary",
      "seo.description",
    ]) || createExcerpt(content);

  const publishedAt = toIsoDate(
    firstString(source, [
      "publishedAt",
      "published_at",
      "publishDate",
      "publishedDate",
      "date",
      "createdAt",
      "attributes.publishedAt",
    ])
  );

  const rawUpdatedAt = firstString(source, [
    "updatedAt",
    "updated_at",
    "attributes.updatedAt",
  ]);

  return {
    id,
    slug,
    title,
    excerpt,
    content,
    featuredImage: extractImageUrl(source),
    publishedAt,
    updatedAt: rawUpdatedAt ? toIsoDate(rawUpdatedAt) : null,
    seoTitle: firstString(source, ["seo.title", "meta.title", "seoTitle"]),
    seoDescription: firstString(source, [
      "seo.description",
      "meta.description",
      "seoDescription",
    ]),
    seoImage: firstString(source, [
      "seo.ogImage",
      "seo.image",
      "meta.image",
      "meta.ogImage",
    ]),
  };
}

function extractCollection(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const source = asObject(payload);
  if (!source) {
    return [];
  }

  const candidates: unknown[] = [
    source.data,
    source.items,
    source.results,
    source.blogs,
    readByPath(source, "data.items"),
    readByPath(source, "data.results"),
    readByPath(source, "data.blogs"),
    readByPath(source, "data.data"),
    readByPath(source, "response.items"),
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function extractSingle(payload: unknown): unknown | null {
  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  const source = asObject(payload);
  if (!source) {
    return null;
  }

  const candidates: unknown[] = [
    source.data,
    source.item,
    source.result,
    source.blog,
    readByPath(source, "data.item"),
    readByPath(source, "data.result"),
    readByPath(source, "data.blog"),
    readByPath(source, "data.attributes"),
  ];

  for (const candidate of candidates) {
    if (candidate && !Array.isArray(candidate) && typeof candidate === "object") {
      return candidate;
    }
  }

  const collection = extractCollection(payload);
  return collection[0] ?? null;
}

function sortPostsByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((first, second) => {
    const firstTimestamp = Date.parse(first.publishedAt);
    const secondTimestamp = Date.parse(second.publishedAt);
    return secondTimestamp - firstTimestamp;
  });
}

function getMockPosts(): BlogPost[] {
  return sortPostsByDateDesc(MOCK_BLOG_POSTS);
}

function getMockPagination(page: number, limit: number, total: number): BlogPagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function getMockBlogsPageResult(page: number, limit: number): BlogListResult {
  const posts = getMockPosts();
  const start = (page - 1) * limit;
  const paginatedPosts = posts.slice(start, start + limit);

  return {
    posts: paginatedPosts,
    pagination: getMockPagination(page, limit, posts.length),
  };
}

function getMockBlogBySlug(slug: string): BlogPost | null {
  return getMockPosts().find((post) => post.slug === slug) ?? null;
}

function extractPagination(
  payload: unknown,
  page: number,
  limit: number,
  resultCount: number
): BlogPagination {
  const total = firstNumber(payload, [
    "total",
    "meta.total",
    "pagination.total",
    "data.total",
    "data.meta.total",
    "data.pagination.total",
  ]);

  const totalPagesFromPayload = firstNumber(payload, [
    "totalPages",
    "meta.totalPages",
    "pagination.totalPages",
    "data.totalPages",
    "data.meta.totalPages",
    "data.pagination.totalPages",
  ]);

  const hasNextFromPayload = firstBoolean(payload, [
    "hasNextPage",
    "meta.hasNextPage",
    "pagination.hasNextPage",
    "data.pagination.hasNextPage",
  ]);

  const hasPreviousFromPayload = firstBoolean(payload, [
    "hasPreviousPage",
    "meta.hasPreviousPage",
    "pagination.hasPreviousPage",
    "data.pagination.hasPreviousPage",
  ]);

  const totalPages =
    totalPagesFromPayload !== null
      ? Math.max(1, Math.floor(totalPagesFromPayload))
      : total !== null
        ? Math.max(1, Math.ceil(total / limit))
        : page;

  const hasNextPage =
    hasNextFromPayload !== null ? hasNextFromPayload : resultCount >= limit && page < totalPages;

  const hasPreviousPage =
    hasPreviousFromPayload !== null ? hasPreviousFromPayload : page > 1;

  const inferredTotal = (page - 1) * limit + resultCount + (hasNextPage ? 1 : 0);
  const resolvedTotal = total !== null ? Math.max(0, Math.floor(total)) : inferredTotal;

  return {
    page,
    limit,
    total: resolvedTotal,
    totalPages: hasNextPage ? Math.max(totalPages, page + 1) : Math.max(totalPages, page),
    hasNextPage,
    hasPreviousPage,
  };
}

function buildBlogsListUrl(page: number, limit: number): URL {
  const endpoint = getListEndpoint();
  const url = resolveCrmUrl(endpoint);
  url.searchParams.set(getPageParamName(), String(page));
  url.searchParams.set(getLimitParamName(), String(limit));

  const sortParamName = getSortParamName();
  const sortValue = getSortValue();
  if (sortParamName && sortValue) {
    url.searchParams.set(sortParamName, sortValue);
  }

  const statusParam = process.env.CRM_BLOG_STATUS_PARAM?.trim();
  const statusValue = process.env.CRM_BLOG_STATUS_VALUE?.trim();
  if (statusParam && statusValue) {
    url.searchParams.set(statusParam, statusValue);
  }

  return url;
}

function buildBlogDetailUrl(slug: string): URL {
  const endpoint = getDetailEndpoint();
  if (endpoint.includes(":slug")) {
    return resolveCrmUrl(endpoint.replace(":slug", encodeURIComponent(slug)));
  }

  const url = resolveCrmUrl(endpoint);
  url.searchParams.set(getSlugParamName(), slug);
  return url;
}

export async function getBlogsPage({
  page,
  limit = getBlogPageSize(),
}: {
  page: number;
  limit?: number;
}): Promise<BlogListResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : getBlogPageSize();

  if (shouldUseMockBlogs()) {
    return getMockBlogsPageResult(safePage, safeLimit);
  }

  try {
    const url = buildBlogsListUrl(safePage, safeLimit);
    const payload = await fetchCrmJson(url, `${BLOG_CACHE_TAG}-page-${safePage}`);
    const posts = sortPostsByDateDesc(
      extractCollection(payload).map(normalizeBlog).filter((post): post is BlogPost => Boolean(post))
    );

    return {
      posts,
      pagination: extractPagination(payload, safePage, safeLimit, posts.length),
    };
  } catch (error) {
    if (shouldFallbackToMockOnApiError()) {
      console.warn("CRM blog API unavailable. Falling back to mock blog data.", error);
      return getMockBlogsPageResult(safePage, safeLimit);
    }
    throw error;
  }
}

export async function getBlogBySlug(inputSlug: string): Promise<BlogPost | null> {
  const slug = toSlug(inputSlug);
  if (!slug) {
    return null;
  }

  if (shouldUseMockBlogs()) {
    return getMockBlogBySlug(slug);
  }

  try {
    const detailPayload = await fetchCrmJson(
      buildBlogDetailUrl(slug),
      `${BLOG_CACHE_TAG}-detail-${slug}`
    );
    const normalized = normalizeBlog(extractSingle(detailPayload) ?? detailPayload);
    if (normalized) {
      return normalized;
    }
  } catch (error) {
    if (!(error instanceof CrmApiError) || error.status !== 404) {
      throw error;
    }
  }

  try {
    const listUrl = buildBlogsListUrl(1, getBlogPageSize());
    listUrl.searchParams.set(getSlugParamName(), slug);
    const listPayload = await fetchCrmJson(
      listUrl,
      `${BLOG_CACHE_TAG}-detail-fallback-${slug}`
    );

    const fallbackPost =
      extractCollection(listPayload)
        .map(normalizeBlog)
        .filter((post): post is BlogPost => Boolean(post))
        .find((post) => post.slug === slug) ?? null;

    return fallbackPost;
  } catch (error) {
    if (shouldFallbackToMockOnApiError()) {
      console.warn("CRM blog detail API unavailable. Falling back to mock blog data.", error);
      return getMockBlogBySlug(slug);
    }

    if (error instanceof CrmApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getRelatedBlogs(slug: string, limit = 3): Promise<BlogPost[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 3;
  const { posts } = await getBlogsPage({ page: 1, limit: Math.max(12, safeLimit + 4) });
  return posts.filter((post) => post.slug !== slug).slice(0, safeLimit);
}
