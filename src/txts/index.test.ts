import { describe, expect, it } from "vitest";
import { txts } from "./index.js";

describe("txts", () => {
  it("joins txts as paragraphs", () => {
    const result = txts("First paragraph", "Second paragraph");
    expect(result).toBe("First paragraph\n\nSecond paragraph");
  });

  it("trims and levels paragraphs", () => {
    const result = txts(
      `
        First paragraph line one
        line two
      `,
      "Second paragraph",
    );
    expect(result).toBe(
      "First paragraph line one line two\n\nSecond paragraph",
    );
  });

  it("filters out falsy values", () => {
    const result = txts(
      `
        First paragraph line one
        line two
      `,
      "",
      null,
      undefined,
      "Second paragraph",
    );
    expect(result).toBe(
      "First paragraph line one line two\n\nSecond paragraph",
    );
  });

  it("trims empty paragraphs", () => {
    const result = txts(
      `
        First paragraph line one
        line two
      `,
      "   ",
      "Second paragraph",
    );
    expect(result).toBe(
      "First paragraph line one line two\n\nSecond paragraph",
    );
  });

  it("rejects non-string non-falsy values", () => {
    // @ts-expect-error -- Type test
    txts({});
    // @ts-expect-error -- Type test
    txts([]);
  });

  it("accepts but filters out non-string non-falsy values", () => {
    const result = txts(
      `
        First paragraph line one
        line two
      `,
      1,
      2n,
      "Second paragraph",
    );
    expect(result).toBe(
      "First paragraph line one line two\n\nSecond paragraph",
    );
  });
});
