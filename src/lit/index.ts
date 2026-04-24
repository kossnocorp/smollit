import { renderTemplateLiteral, splitLines } from "../utils/index.js";

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
  return trimAndLevel(renderTemplateLiteral(input, values));
}

function trimAndLevel(input: string): string {
  const lines = splitLines(input);

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
