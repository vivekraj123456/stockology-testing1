import { createExcerpt } from "@/lib/blogs/content";
import { sanitizeAssignableKeywords } from "@/lib/blogs/keywords";
import { sanitizeBlogHtml, sanitizePlainText } from "@/lib/blogs/sanitize";

export type BlogInputPayload = {
  title?: unknown;
  keywords?: unknown;
  content?: unknown;
  excerpt?: unknown;
  image?: unknown;
  author?: unknown;
};

export type NormalizedBlogPayload = {
  title: string;
  keywords: string[];
  content: string;
  excerpt: string;
  image: string;
  author: string;
};

const MAX_TITLE_LENGTH = 180;
const MAX_AUTHOR_LENGTH = 120;
const MAX_CONTENT_LENGTH = 120_000;
const MAX_EXCERPT_LENGTH = 500;
const MAX_IMAGE_LENGTH = 5_000_000;
const MAX_KEYWORD_COUNT = 8;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isImageValueAllowed(value: string): boolean {
  if (!value) {
    return true;
  }

  return (
    /^https?:\/\//i.test(value) ||
    /^data:image\/[a-zA-Z+.-]+;base64,/i.test(value)
  );
}

export function normalizeBlogPayload(
  payload: BlogInputPayload
):
  | { ok: true; data: NormalizedBlogPayload }
  | { ok: false; error: string } {
  const titleInput = readString(payload.title);
  const keywordsInput = sanitizeAssignableKeywords(payload.keywords);
  const contentInput = readString(payload.content);
  const excerptInput = readString(payload.excerpt);
  const imageInput = readString(payload.image);
  const authorInput = readString(payload.author);

  if (!titleInput || !contentInput || !authorInput) {
    return {
      ok: false,
      error: "Title, content, and author are required.",
    };
  }

  if (
    titleInput.length > MAX_TITLE_LENGTH ||
    authorInput.length > MAX_AUTHOR_LENGTH ||
    contentInput.length > MAX_CONTENT_LENGTH ||
    excerptInput.length > MAX_EXCERPT_LENGTH ||
    imageInput.length > MAX_IMAGE_LENGTH ||
    keywordsInput.length > MAX_KEYWORD_COUNT
  ) {
    return {
      ok: false,
      error: "One or more fields exceed allowed length.",
    };
  }

  if (!isImageValueAllowed(imageInput)) {
    return {
      ok: false,
      error: "Image must be an HTTPS/HTTP URL or a base64 data image.",
    };
  }

  const title = sanitizePlainText(titleInput);
  const author = sanitizePlainText(authorInput);
  const content = sanitizeBlogHtml(contentInput);
  const excerptSanitized = sanitizePlainText(excerptInput);

  if (!title || !author || !content) {
    return {
      ok: false,
      error: "Blog fields contain invalid or unsafe content.",
    };
  }

  const excerpt =
    excerptSanitized || createExcerpt(content, Math.min(MAX_EXCERPT_LENGTH, 180));

  return {
    ok: true,
    data: {
      title,
      keywords: keywordsInput,
      content,
      excerpt,
      image: imageInput,
      author,
    },
  };
}
