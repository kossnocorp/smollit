/**
 * Renders a template literal by interpolating the provided values into
 * the template string. Plain strings are returned as-is.
 *
 * @param input - String or template literal to render.
 * @param values - Values to interpolate into the template literal.
 * @returns Interpolated string.
 */
export function renderTemplateLiteral(
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

/**
 * Splits a string into lines using a regular expression that matches different
 * newline characters, including Windows-style (`"\r\n"`), old Mac-style
 * (`"\r"`), and Unix-style (`"\n"`) newlines.
 *
 * @param input - String to split into lines.
 * @returns Array of lines from the input string.
 */
export function splitLines(input: string): string[] {
  return input.split(newlineRegExp);
}

/**
 * Regular expression to match different newline characters, including Windows-style (`"\r\n"`), old
 * Mac-style (`"\r"`), and Unix-style (`"\n"`) newlines.
 */
export const newlineRegExp = /\r\n|\r|\n/g;
