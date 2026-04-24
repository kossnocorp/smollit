import { txt } from "../txt/index.js";

/**
 * {@link txts} types namespace.
 */
export namespace txts {
  /**
   * The {@link txts} input type.
   */
  export type Input = string | number | bigint | false | null | undefined;
}

/**
 * Normalizes and joins multiple strings as paragraphs, filtering out non-string
 * and falsy values.
 *
 * When normalizing it uses {@link txt} to trim and levels indentation.
 *
 * @param inputs - Values to normalize and join as paragraphs.
 * @returns Trimmed and leveled string.
 */
export function txts(...inputs: txts.Input[]): string {
  const paragraphs: string[] = [];
  for (const input of inputs) {
    if (typeof input !== "string") continue;
    const normalized = txt(input);
    if (!normalized) continue;
    paragraphs.push(normalized);
  }
  return paragraphs.join("\n\n");
}
