import { describe, expect, it } from "vitest";
import { newlineRegExp, renderTemplateLiteral, splitLines } from "./index.js";

describe("renderTemplateLiteral", () => {
  it("returns plain strings as-is", () => {
    expect(renderTemplateLiteral("hello", [])).toBe("hello");
  });

  it("renders template literals with interpolated values", () => {
    expect(render`a${1} b${2} c`).toBe("a1 b2 c");
  });

  it("stringifies interpolated values", () => {
    expect(render`a${false} b${null} c${2n} d${{ x: 1 }} e`).toBe(
      "afalse bnull c2 d[object Object] e",
    );
  });

  it("keeps trailing template segments when values are missing", () => {
    expect(
      renderTemplateLiteral(
        ["a", " b", " c"] as unknown as TemplateStringsArray,
        [1],
      ),
    ).toBe("a1 b c");
  });

  function render(input: TemplateStringsArray, ...values: unknown[]): string {
    return renderTemplateLiteral(input, values);
  }
});

describe("splitLines", () => {
  it("splits unix newlines", () => {
    expect(splitLines("a\nb\nc")).toEqual(["a", "b", "c"]);
  });

  it("splits windows newlines", () => {
    expect(splitLines("a\r\nb\r\nc")).toEqual(["a", "b", "c"]);
  });

  it("splits old mac newlines", () => {
    expect(splitLines("a\rb\rc")).toEqual(["a", "b", "c"]);
  });

  it("splits mixed newline styles", () => {
    expect(splitLines("a\nb\r\nc\rd")).toEqual(["a", "b", "c", "d"]);
  });

  it("preserves trailing empty lines", () => {
    expect(splitLines("a\n")).toEqual(["a", ""]);
  });

  it("returns one line when no newline is present", () => {
    expect(splitLines("abc")).toEqual(["abc"]);
  });
});

describe("newlineRegExp", () => {
  it("matches all supported newline styles", () => {
    expect("a\nb\r\nc\rd".match(newlineRegExp)).toEqual(["\n", "\r\n", "\r"]);
  });
});
