/**
 * Trims and levels indentation of a string to a minimal common level, while
 * preserving relative indentation.
 *
 * @param input - String to trim and level.
 * @returns Trimmed and leveled string.
 */
export function lit(input: string): string;

/**
 * Trims and levels indentation of a string to a minimal common level, while
 * preserving relative indentation.
 *
 * @param input - Template string to trim and level.
 * @param values - Values to interpolate into the template string.
 * @returns Trimmed and leveled string.
 */
export function lit(input: TemplateStringsArray, ...values: unknown[]): string;

export function lit(
  input: string | TemplateStringsArray,
  ...values: unknown[]
): string {
  return trimAndLevel(renderTemplate(input, values));
}

/**
 * Trims and levels indentation of a string to a minimal common level, while
 * preserving relative indentation.
 *
 * @param input - String to trim, level, and join.
 * @returns Trimmed and leveled string.
 */
export function txt(input: string): string;

/**
 * Trims and levels indentation of a string to a minimal common level, while
 * preserving relative indentation.
 *
 * @param input - Template string to trim, level, and join.
 * @param values - Values to interpolate into the template string.
 * @returns Trimmed and leveled string.
 */
export function txt(input: TemplateStringsArray, ...values: unknown[]): string;

export function txt(
  input: string | TemplateStringsArray,
  ...values: unknown[]
): string {
  const leveled = lit(renderTemplate(input, values));
  if (leveled === "") return "";

  const lines = leveled.split(NEWLINE_RE);
  const paragraphs: string[] = [];

  let paragraph: string[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      if (paragraph.length) {
        paragraphs.push(paragraph.join(" "));
        paragraph = [];
      }
      continue;
    }
    paragraph.push(line.trim());
  }

  if (paragraph.length) paragraphs.push(paragraph.join(" "));

  return paragraphs.join("\n\n");
}

/**
 * Trims and levels indentation of a string and joins Markdown paragraph wraps
 * while preserving structural block syntax.
 *
 * @param input - Markdown string to normalize.
 * @returns Normalized Markdown string.
 */
export function md(input: string): string;

/**
 * Trims and levels indentation of a string and joins Markdown paragraph wraps
 * while preserving structural block syntax.
 *
 * @param input - Markdown template string to normalize.
 * @param values - Values to interpolate into the template string.
 * @returns Normalized Markdown string.
 */
export function md(input: TemplateStringsArray, ...values: unknown[]): string;

export function md(
  input: string | TemplateStringsArray,
  ...values: unknown[]
): string {
  const leveled = lit(renderTemplate(input, values));
  if (leveled === "") return "";
  return joinMarkdown(leveled);
}

function renderTemplate(
  input: string | TemplateStringsArray,
  values: unknown[],
): string {
  if (typeof input === "string") return input;

  let result = "";
  for (let i = 0; i < input.length; i++) {
    result += input[i];
    if (i < values.length) result += String(values[i]);
  }
  return result;
}

function joinMarkdown(input: string): string {
  const lines = input.split(NEWLINE_RE);
  const output: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(paragraph.join(" "));
    paragraph = [];
  };

  const pushBlank = () => {
    if (!output.length || output.at(-1) === "") return;
    output.push("");
  };

  let i = 0;

  if (isFrontmatterStart(lines, 0)) {
    const end = consumeFrontmatter(lines, 0, output);
    i = end;
  }

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) {
      flushParagraph();
      pushBlank();
      i++;
      continue;
    }

    if (isFenceStart(line)) {
      flushParagraph();
      i = consumeFence(lines, i, output);
      continue;
    }

    if (isMathFence(line)) {
      flushParagraph();
      i = consumeMathFence(lines, i, output);
      continue;
    }

    if (isQuoteLine(line)) {
      flushParagraph();
      i = consumeQuote(lines, i, output);
      continue;
    }

    if (isSetextHeading(lines, i)) {
      flushParagraph();
      output.push((lines[i] ?? "").trimEnd());
      output.push((lines[i + 1] ?? "").trimEnd());
      i += 2;
      continue;
    }

    if (isTableHeader(lines, i)) {
      flushParagraph();
      i = consumeTable(lines, i, output);
      continue;
    }

    if (isReferenceDefinition(line) || isFootnoteDefinition(line)) {
      flushParagraph();
      i = consumeDefinition(lines, i, output);
      continue;
    }

    if (isHtmlBlockStart(line)) {
      flushParagraph();
      i = consumeHtmlBlock(lines, i, output);
      continue;
    }

    if (isListItemLine(line)) {
      flushParagraph();
      i = consumeList(lines, i, output);
      continue;
    }

    if (isStandaloneBlockLine(line)) {
      flushParagraph();
      output.push(line.trimEnd());
      i++;
      continue;
    }

    paragraph.push(line.trim());
    i++;
  }

  flushParagraph();

  while (output.length && !output[0]) output.shift();
  while (output.length && !output.at(-1)) output.pop();

  return output.join("\n");
}

function consumeFence(lines: string[], start: number, output: string[]): number {
  const marker = getFenceMarker(lines[start] ?? "");
  if (!marker) {
    output.push((lines[start] ?? "").trimEnd());
    return start + 1;
  }

  output.push((lines[start] ?? "").trimEnd());

  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    output.push(line.trimEnd());
    if (isFenceClose(line, marker)) return i + 1;
    i++;
  }

  return i;
}

function consumeMathFence(lines: string[], start: number, output: string[]): number {
  output.push((lines[start] ?? "").trimEnd());
  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    output.push(line.trimEnd());
    if (isMathFence(line)) return i + 1;
    i++;
  }
  return i;
}

function consumeQuote(lines: string[], start: number, output: string[]): number {
  const quoteContent: string[] = [];
  let i = start;

  while (i < lines.length && isQuoteLine(lines[i] ?? "")) {
    const match = (lines[i] ?? "").match(QUOTE_RE);
    quoteContent.push(match?.[1] ?? "");
    i++;
  }

  const processed = joinMarkdown(quoteContent.join("\n"));
  const processedLines = processed ? processed.split(NEWLINE_RE) : [""];

  for (const line of processedLines) {
    output.push(line ? `> ${line}` : ">");
  }

  return i;
}

function consumeTable(lines: string[], start: number, output: string[]): number {
  output.push((lines[start] ?? "").trimEnd());
  output.push((lines[start + 1] ?? "").trimEnd());

  let i = start + 2;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim() || !line.includes("|")) break;
    output.push(line.trimEnd());
    i++;
  }

  return i;
}

function consumeDefinition(lines: string[], start: number, output: string[]): number {
  output.push((lines[start] ?? "").trimEnd());

  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) break;
    if (indentWidth(line) >= 2 || line.startsWith("\t")) {
      output.push(line.trimEnd());
      i++;
      continue;
    }
    break;
  }

  return i;
}

function consumeFrontmatter(lines: string[], start: number, output: string[]): number {
  output.push((lines[start] ?? "").trimEnd());
  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    output.push(line.trimEnd());
    if (/^---\s*$/.test(line) || /^\.\.\.\s*$/.test(line)) return i + 1;
    i++;
  }
  return i;
}

function consumeHtmlBlock(lines: string[], start: number, output: string[]): number {
  output.push((lines[start] ?? "").trimEnd());

  if (/^\s*<!--/.test(lines[start] ?? "")) {
    let i = start + 1;
    while (i < lines.length) {
      const line = lines[i] ?? "";
      output.push(line.trimEnd());
      if (/-->\s*$/.test(line)) return i + 1;
      i++;
    }
    return i;
  }

  if (/^\s*<\/?[A-Za-z]/.test(lines[start] ?? "") && />\s*$/.test(lines[start] ?? "")) {
    return start + 1;
  }

  let i = start + 1;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) break;
    output.push(line.trimEnd());
    i++;
  }
  return i;
}

function consumeList(lines: string[], start: number, output: string[]): number {
  let i = start;
  let item: { indent: number; prefix: string; parts: string[] } | null = null;

  const flushItem = () => {
    if (!item) return;
    output.push(`${item.prefix}${item.parts.join(" ")}`.trimEnd());
    item = null;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) {
      flushItem();
      if (output.at(-1) !== "") output.push("");
      i++;
      continue;
    }

    const marker = parseListMarker(line);

    if (marker) {
      if (item && marker.indent <= item.indent) {
        flushItem();
      }

      if (!item) {
        item = {
          indent: marker.indent,
          prefix: marker.prefix,
          parts: marker.content ? [marker.content] : [],
        };
        i++;
        continue;
      }

      if (marker.indent > item.indent) {
        flushItem();
        item = {
          indent: marker.indent,
          prefix: marker.prefix,
          parts: marker.content ? [marker.content] : [],
        };
        i++;
        continue;
      }
    }

    if (!item) break;

    if (isFenceStart(line) || isMathFence(line) || isListIndentedCodeLine(line, item.indent)) {
      flushItem();
      output.push(line.trimEnd());
      i++;
      continue;
    }

    if ((isAtxHeading(line) || isThematicBreak(line)) || isQuoteLine(line) || isHtmlBlockStart(line)) {
      flushItem();
      break;
    }

    const nested = parseListMarker(line);
    if (nested && nested.indent > item.indent) {
      flushItem();
      item = {
        indent: nested.indent,
        prefix: nested.prefix,
        parts: nested.content ? [nested.content] : [],
      };
      i++;
      continue;
    }

    if (indentWidth(line) > item.indent) {
      item.parts.push(line.trim());
      i++;
      continue;
    }

    flushItem();
    break;
  }

  flushItem();

  return i;
}

function parseListMarker(line: string): {
  indent: number;
  prefix: string;
  content: string;
} | null {
  const match = line.match(/^([ \t]*)([*+-]|\d+[.)])([ \t]+)(.*)$/);
  if (!match) return null;
  const indent = match[1] ?? "";
  const marker = match[2] ?? "";
  const content = match[4] ?? "";
  return {
    indent: indentWidth(indent),
    prefix: `${indent}${marker} `,
    content: content.trim(),
  };
}

function indentWidth(line: string): number {
  let width = 0;
  for (const char of line) {
    if (char === " ") {
      width += 1;
      continue;
    }
    if (char === "\t") {
      width += 4;
      continue;
    }
    break;
  }
  return width;
}

function isSetextHeading(lines: string[], index: number): boolean {
  const title = lines[index];
  const marker = lines[index + 1];
  if (!title?.trim() || !marker?.trim()) return false;
  if (isStandaloneBlockLine(title) || isListItemLine(title) || isQuoteLine(title)) return false;
  return /^\s*(=+|-+)\s*$/.test(marker);
}

function isStandaloneBlockLine(line: string): boolean {
  return (
    isAtxHeading(line)
    || isThematicBreak(line)
    || isIndentedCodeLine(line)
  );
}

function isAtxHeading(line: string): boolean {
  return /^\s{0,3}#{1,6}(?:\s|$)/.test(line);
}

function isThematicBreak(line: string): boolean {
  return /^\s{0,3}(?:\*\s*){3,}$/.test(line)
    || /^\s{0,3}(?:-\s*){3,}$/.test(line)
    || /^\s{0,3}(?:_\s*){3,}$/.test(line);
}

function isFenceStart(line: string): boolean {
  return /^\s{0,3}(?:`{3,}|~{3,})/.test(line);
}

function getFenceMarker(line: string): string | null {
  const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
  return match?.[1] ?? null;
}

function isFenceClose(line: string, marker: string): boolean {
  if (marker.startsWith("`")) {
    return /^\s{0,3}`{3,}\s*$/.test(line);
  }
  return /^\s{0,3}~{3,}\s*$/.test(line);
}

function isMathFence(line: string): boolean {
  return /^\s*\$\$\s*$/.test(line);
}

function isQuoteLine(line: string): boolean {
  return QUOTE_RE.test(line);
}

function isListItemLine(line: string): boolean {
  return LIST_ITEM_RE.test(line);
}

function isTableHeader(lines: string[], index: number): boolean {
  const header = lines[index];
  const separator = lines[index + 1];
  if (!header || !separator) return false;
  return header.includes("|") && TABLE_SEPARATOR_RE.test(separator);
}

function isReferenceDefinition(line: string): boolean {
  return /^\s{0,3}\[[^\]]+\]:\s*\S/.test(line);
}

function isFootnoteDefinition(line: string): boolean {
  return /^\s{0,3}\[\^[^\]]+\]:\s*\S/.test(line);
}

function isFrontmatterStart(lines: string[], index: number): boolean {
  if (index !== 0) return false;
  if (!/^---\s*$/.test(lines[index] ?? "")) return false;
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^---\s*$/.test(line) || /^\.\.\.\s*$/.test(line)) return true;
    if (!line.trim()) return false;
  }
  return false;
}

function isIndentedCodeLine(line: string): boolean {
  return /^ {4,}\S/.test(line) || /^\t\S/.test(line);
}

function isListIndentedCodeLine(line: string, itemIndent: number): boolean {
  return line.trim() !== "" && indentWidth(line) >= itemIndent + 4;
}

function isHtmlBlockStart(line: string): boolean {
  return HTML_BLOCK_START_RE.test(line);
}

function trimAndLevel(input: string): string {
  const lines = input.split(NEWLINE_RE);

  while (lines.length && !lines.at(0)?.trim()) lines.shift();
  while (lines.length && !lines.at(-1)?.trim()) lines.pop();

  if (!lines.length) return "";

  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (!line.trim()) continue;
    const indent = line.search(/\S/) ?? 0;
    if (indent < minIndent) minIndent = indent;
  }

  if (!Number.isFinite(minIndent)) minIndent = 0;

  return lines.map((line) => line.slice(minIndent)).join("\n");
}

const NEWLINE_RE = /\r\n|\r|\n/g;
const LIST_ITEM_RE = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)(.*)$/;
const QUOTE_RE = /^\s{0,3}>[ \t]?(.*)$/;
const TABLE_SEPARATOR_RE = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/;
const HTML_BLOCK_START_RE = /^\s*(?:<!--|<\/?(?:address|article|aside|base|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)\b)/i;
