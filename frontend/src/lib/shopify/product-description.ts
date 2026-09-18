import sanitizeHtml from "sanitize-html";

// Preserve Shopify's rich-text editor output, without executable content or
// positioning rules that could escape the description card.
export function sanitizeProductDescription(html: string) {
  const color = [/^#[\da-f]{3,8}$/i, /^[a-z]+$/i, /^(?:rgb|hsl)a?\([\d\s.,%/+-]+\)$/i];
  const length = [/^(?:0|\d*\.?\d+(?:px|pt|em|rem|%))$/i];
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "u", "s", "del", "sub", "sup"]),
    allowedAttributes: {
      "*": ["style", "title", "dir", "lang"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      ol: ["start", "reversed", "type"],
      li: ["value"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowedStyles: {
      "*": {
        color,
        "background-color": color,
        "font-family": [/^[\w\s,'"-]+$/],
        "font-size": [...length, /^(?:xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)$/],
        "font-weight": [/^(?:normal|bold|bolder|lighter|[1-9]00)$/],
        "font-style": [/^(?:normal|italic|oblique)$/],
        "line-height": [...length, /^(?:normal|\d*\.?\d+)$/],
        "text-align": [/^(?:left|right|center|justify|start|end)$/],
        "text-decoration": [/^(?:none|underline|line-through|overline)(?:\s+(?:underline|line-through|overline))*$/],
        "text-transform": [/^(?:none|uppercase|lowercase|capitalize)$/],
        "letter-spacing": [...length, /^normal$/],
        "text-indent": length,
        "padding-left": length,
        "margin-left": length,
        "list-style-type": [/^(?:disc|circle|square|decimal|lower-alpha|upper-alpha|lower-roman|upper-roman|none)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }),
    },
  });
}
