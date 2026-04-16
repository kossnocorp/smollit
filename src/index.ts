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
