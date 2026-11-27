import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

/* Markdown → safe HTML. Raw HTML in bodies is sanitised on *input* (API) and
 * again on *render*: defence in depth against any row that bypassed the API. */

export type TocItem = { id: string; text: string; level: 2 | 3 };

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "blockquote", "strong", "em", "del", "code", "pre",
    "hr", "br", "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption", "details", "summary", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    h2: ["id"], h3: ["id"], h4: ["id"],
    details: ["class"], summary: ["class"], span: ["class"], th: ["align"], td: ["align"],
  },
  allowedSchemes: ["https", "http", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (_tag, attribs) => {
      const external = /^https?:\/\//.test(attribs.href ?? "");
      return {
        tagName: "a",
        attribs: external ? { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" } : attribs,
      };
    },
    img: (_tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
  },
};

/** Strip all HTML from a short text field. */
export function plainText(s: string) {
  return sanitizeHtml(s, { allowedTags: [], allowedAttributes: {}, parser: { decodeEntities: false } }).trim();
}

/**
 * Sanitise a markdown body on intake. Disallowed raw HTML (script, iframe,
 * style, on* handlers, javascript: URLs) is removed; markdown text survives.
 */
export function sanitizeMarkdownInput(md: string) {
  const cleaned = sanitizeHtml(md, { ...SANITIZE, parser: { decodeEntities: false } });
  return cleaned.replace(/\]\(\s*(javascript|vbscript|data):[^)]*\)/gi, "](#)");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** `:::spoiler Title` … `:::` → collapsible spoiler block. */
function expandSpoilers(md: string) {
  return md.replace(/^:::spoiler[ \t]*(.*)\n([\s\S]*?)\n:::[ \t]*$/gm, (_m, title: string, inner: string) => {
    const t = sanitizeHtml(title || "Spoiler", { allowedTags: [] });
    return `<details class="up-spoiler"><summary class="up-spoiler-summary">${t}</summary>\n\n${inner}\n\n</details>`;
  });
}

export function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const textOnly = sanitizeHtml(inner, { allowedTags: [] });
        let id = slugify(textOnly) || "section";
        while (used.has(id)) id += "-x";
        used.add(id);
        const level = Math.min(Math.max(depth, 2), 4);
        if (level === 2 || level === 3) toc.push({ id, text: textOnly, level });
        return `<h${level} id="${id}">${inner}</h${level}>\n`;
      },
    },
  });
  const raw = marked.parse(expandSpoilers(md), { async: false }) as string;
  return { html: sanitizeHtml(raw, SANITIZE), toc };
}
