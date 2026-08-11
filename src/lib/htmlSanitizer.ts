import sanitizeHtmlLib from 'sanitize-html';

/**
 * Attributes that can trigger navigation or resource loading and therefore
 * must have their URI schemes validated (sanitize-html only checks href/src by default).
 */
const URI_ATTRIBUTES = [
  'href',
  'src',
  'srcset',
  'action',
  'formaction',
  'data',
  'poster',
  'background',
  'cite',
  'longdesc',
  'xlink:href',
];

const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel'];

const BASE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'span', 'div', 'section', 'article', 'header', 'footer',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    '*': ['id', 'class', 'lang', 'dir'],
  },
  allowedSchemes: ALLOWED_SCHEMES,
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: URI_ATTRIBUTES,
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  enforceHtmlBoundary: false,
  transformTags: {
    a: (tagName, attribs) => {
      const next: Record<string, string> = { ...attribs };
      if (next.target === '_blank') {
        next.rel = 'noopener noreferrer';
      }
      return { tagName, attribs: next };
    },
  },
};

/**
 * Sanitizes generated HTML before it is rendered with dangerouslySetInnerHTML
 * or written to an exported file. Strips scripts, styles, event handlers,
 * and any javascript:/data:/vbscript: URI in navigational attributes.
 */
export function sanitizeGeneratedHtml(html: unknown): string {
  if (typeof html !== 'string' || html.length === 0) return '';
  return sanitizeHtmlLib(html, BASE_OPTIONS);
}

/**
 * Sanitizes plain-text-ish content (e.g. markdown export) by removing all markup.
 */
export function sanitizeToPlainText(input: unknown): string {
  if (typeof input !== 'string' || input.length === 0) return '';
  return sanitizeHtmlLib(input, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Returns true when a URL is safe to use as a link/resource target.
 */
export function isSafeUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  // Protocol-relative URLs are treated as unsafe (scheme is inherited).
  if (trimmed.startsWith('//') || trimmed.startsWith('\\\\')) return false;
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(
    // Strip control characters/whitespace used to smuggle schemes: "java\0script:"
    trimmed.replace(/[\u0000-\u0020]/g, '')
  );
  if (!schemeMatch) return true; // relative URL
  return ALLOWED_SCHEMES.includes(schemeMatch[1].toLowerCase());
}

export const SANITIZER_URI_ATTRIBUTES = URI_ATTRIBUTES;
export const SANITIZER_ALLOWED_SCHEMES = ALLOWED_SCHEMES;
