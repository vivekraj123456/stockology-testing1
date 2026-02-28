import sanitizeHtml from "sanitize-html";

const BLOG_ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "i",
  "strong",
  "em",
  "u",
  "s",
  "blockquote",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
];

const BLOG_ALLOWED_ATTRIBUTES = {
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  span: ["class", "style"],
  p: ["class", "style"],
  div: ["class", "style"],
  "*": ["class"],
};

const BLOG_ALLOWED_STYLES = {
  "*": {
    "font-size": [/.*/],
    "font-family": [/.*/],
    "color": [/.*/],
    "background-color": [/.*/],
    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
    "font-weight": [/.*/],
    "font-style": [/.*/],
    "text-decoration": [/.*/],
    "line-height": [/.*/],
    "margin": [/.*/],
    "padding": [/.*/],
  },
};

export function sanitizeBlogHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: BLOG_ALLOWED_TAGS,
    allowedAttributes: BLOG_ALLOWED_ATTRIBUTES,
    allowedStyles: BLOG_ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName: string, attribs: Record<string, string>) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  }).trim();
}

export function sanitizePlainText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}
