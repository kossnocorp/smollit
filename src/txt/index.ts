import { lit } from "../lit/index.js";
import { renderTemplateLiteral, splitLines } from "../utils/index.js";

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
  const leveled = lit(renderTemplateLiteral(input, values));
  if (leveled === "") return "";

  const lines = splitLines(leveled);
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
