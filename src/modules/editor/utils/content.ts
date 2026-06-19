import type { JSONContent } from "@tiptap/core";

interface TextNode {
  type: "text";
  text: string;
  marks?: Array<{ type: string }>;
}

interface BlockNode {
  type: string;
  content?: ContentNode[];
  attrs?: Record<string, unknown>;
  text?: string;
}

type ContentNode = TextNode | BlockNode;

function isTextNode(node: ContentNode): node is TextNode {
  return node.type === "text";
}

function isBlockNode(node: ContentNode): node is BlockNode {
  return node.type !== "text";
}

function isContentNode(value: unknown): value is ContentNode {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.type === "string";
}

function extractTextFromNode(node: ContentNode): string {
  if (isTextNode(node)) {
    return node.text || "";
  }

  if (isBlockNode(node) && node.content) {
    return node.content.map(extractTextFromNode).join("");
  }

  return "";
}

export function generatePlainText(json: JSONContent): string {
  if (!json || !json.content) return "";

  const parts: string[] = [];

  for (const node of json.content) {
    if (!isContentNode(node)) continue;

    const text = extractTextFromNode(node);
    if (text) {
      parts.push(text);
    }

    if (isBlockNode(node)) {
      switch (node.type) {
        case "paragraph":
        case "heading":
          parts.push("\n");
          break;
        case "bulletList":
        case "orderedList":
        case "taskList":
          parts.push("\n");
          break;
        case "listItem":
        case "taskItem":
          parts.push("\u2022 ");
          break;
        case "blockquote":
          parts.push("\n> ");
          break;
        case "codeBlock":
          parts.push("\n```\n");
          break;
        case "horizontalRule":
          parts.push("\n---\n");
          break;
        case "hardBreak":
          parts.push("\n");
          break;
        default:
          break;
      }
    }
  }

  return parts
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function generateExcerpt(json: JSONContent, maxLength = 160): string {
  const plainText = generatePlainText(json);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength - 20) {
    return `${truncated.slice(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

export function isEmptyContent(json: JSONContent): boolean {
  if (!json) return true;
  if (!json.content || json.content.length === 0) return true;

  for (const node of json.content) {
    if (!isContentNode(node)) continue;

    if (isBlockNode(node)) {
      if (node.type === "paragraph" || node.type === "heading") {
        if (node.content && node.content.length > 0) {
          const hasText = node.content.some(
            (child) => isTextNode(child) && child.text.trim().length > 0,
          );
          if (hasText) return false;
        }
      } else if (node.type !== "horizontalRule" && node.type !== "hardBreak") {
        return false;
      }
    }
  }

  return true;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function jsonToHtmlNode(node: ContentNode): string {
  if (isTextNode(node)) {
    let text = escapeHtml(node.text);
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case "bold":
            text = `<strong>${text}</strong>`;
            break;
          case "italic":
            text = `<em>${text}</em>`;
            break;
          case "underline":
            text = `<u>${text}</u>`;
            break;
          case "strike":
            text = `<del>${text}</del>`;
            break;
          case "code":
            text = `<code>${text}</code>`;
            break;
          case "link":
            text = `<a href="${escapeHtml(((mark as Record<string, unknown>).href as string) || "")}" target="_blank" rel="noopener noreferrer">${text}</a>`;
            break;
          case "highlight":
            text = `<mark>${text}</mark>`;
            break;
          default:
            break;
        }
      }
    }
    return text;
  }

  if (isBlockNode(node)) {
    const content = node.content
      ? node.content.map((child) => jsonToHtmlNode(child)).join("")
      : "";

    switch (node.type) {
      case "paragraph":
        return `<p>${content}</p>`;
      case "heading": {
        const level = (node.attrs?.level as number) || 1;
        return `<h${level}>${content}</h${level}>`;
      }
      case "bulletList":
        return `<ul>${content}</ul>`;
      case "orderedList":
        return `<ol>${content}</ol>`;
      case "listItem":
        return `<li>${content}</li>`;
      case "taskList":
        return `<ul class="task-list">${content}</ul>`;
      case "taskItem": {
        const checked = node.attrs?.checked ? "checked" : "";
        return `<li class="task-item" ${checked}><input type="checkbox" ${checked} disabled /> ${content}</li>`;
      }
      case "blockquote":
        return `<blockquote>${content}</blockquote>`;
      case "codeBlock": {
        const lang = node.attrs?.language || "";
        const firstChild = node.content?.[0];
        const codeText = firstChild && isTextNode(firstChild) ? firstChild.text : content;
        return `<pre><code class="language-${escapeHtml(lang as string)}">${escapeHtml(codeText)}</code></pre>`;
      }
      case "horizontalRule":
        return "<hr />";
      case "hardBreak":
        return "<br />";
      case "image":
        return `<img src="${escapeHtml(
          (node.attrs?.src as string) || "",
        )}" alt="${escapeHtml((node.attrs?.alt as string) || "")}" title="${escapeHtml(
          (node.attrs?.title as string) || "",
        )}" />`;
      case "table":
        return `<table>${content}</table>`;
      case "tableRow":
        return `<tr>${content}</tr>`;
      case "tableCell":
        return `<td>${content}</td>`;
      case "tableHeader":
        return `<th>${content}</th>`;
      case "youtube": {
        const src = node.attrs?.src || "";
        return `<div class="youtube-embed"><iframe src="${escapeHtml(
          src as string,
        )}" width="640" height="360" frameborder="0" allowfullscreen></iframe></div>`;
      }
      case "attachment":
        return `<div class="attachment" data-id="${escapeHtml(
          (node.attrs?.id as string) || "",
        )}"><a href="${escapeHtml(
          (node.attrs?.url as string) || "",
        )}">${escapeHtml((node.attrs?.fileName as string) || "File")}</a></div>`;
      default:
        return content;
    }
  }

  return "";
}

export function contentToHTML(json: JSONContent): string {
  if (!json || !json.content) return "";

  return json.content
    .filter(isContentNode)
    .map((node) => jsonToHtmlNode(node))
    .join("");
}

export function sanitizeHTML(html: string): string {
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  const selfClosingTagPattern = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/>/g;

  const allowedTags = new Set([
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "u",
    "del",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "mark",
    "span",
    "div",
    "input",
  ]);

  const allowedAttributes = new Set([
    "href",
    "src",
    "alt",
    "title",
    "class",
    "target",
    "rel",
    "width",
    "height",
    "type",
    "checked",
    "disabled",
    "data-id",
    "data-type",
    "data-align",
    "data-language",
  ]);

  const allowedProtocols = new Set(["http:", "https:", "mailto:"]);

  let sanitized = html;

  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:text\/html/gi, "data:text/plain");
  sanitized = sanitized.replace(/vbscript:/gi, "");

  sanitized = sanitized.replace(selfClosingTagPattern, (match, tagName) => {
    if (!allowedTags.has(tagName.toLowerCase())) {
      return "";
    }
    return match;
  });

  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    if (!allowedTags.has(tagName.toLowerCase())) {
      return "";
    }

    let cleanAttrs = "";
    const attrRegex =
      /\s([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let attrMatch = attrRegex.exec(match);
    while (attrMatch !== null) {
      const [, attrName, dqValue, sqValue] = attrMatch;
      const value = dqValue ?? sqValue ?? "";

      if (!allowedAttributes.has(attrName.toLowerCase())) {
        attrMatch = attrRegex.exec(match);
        continue;
      }

      if (
        attrName.toLowerCase() === "href" ||
        attrName.toLowerCase() === "src"
      ) {
        try {
          const url = new URL(value, "https://example.com");
          if (!allowedProtocols.has(url.protocol)) {
            attrMatch = attrRegex.exec(match);
            continue;
          }
        } catch {
          if (!value.startsWith("/") && !value.startsWith("#")) {
            attrMatch = attrRegex.exec(match);
            continue;
          }
        }
      }

      if (attrName.toLowerCase() === "target") {
        if (value !== "_blank" && value !== "_self") {
          attrMatch = attrRegex.exec(match);
          continue;
        }
      }

      if (attrName.toLowerCase() === "rel") {
        const relParts = value.split(/\s+/);
        const sanitizedRel = relParts.filter((p) =>
          ["noopener", "noreferrer", "nofollow"].includes(p),
        );
        cleanAttrs += ` rel="${sanitizedRel.join(" ")}"`;
      } else {
        const escapedValue = value
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        cleanAttrs += ` ${attrName}="${escapedValue}"`;
      }

      attrMatch = attrRegex.exec(match);
    }

    return `<${tagName}${cleanAttrs}>`;
  });

  sanitized = sanitized.replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, "");

  sanitized = sanitized.replace(/expression\s*\(/gi, "");

  return sanitized;
}
