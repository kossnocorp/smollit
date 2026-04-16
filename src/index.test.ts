import { describe, expect, it } from "vitest";
import { lit, txt } from "./index.js";

describe("lit", () => {
  it("trims and levels indentation", () => {
    expect(lit`
      function hello() {
        console.log("Hello, cruel world!");
      }
    `).toBe('function hello() {\n  console.log("Hello, cruel world!");\n}');
  });

  it("accepts plain strings", () => {
    expect(lit("\n  a\n    b\n")).toBe("a\n  b");
  });

  it("handles tab indentation", () => {
    expect(lit("\n\t\talpha\n\t\t\tbeta\n")).toBe("alpha\n\tbeta");
  });

  it("preserves relative indentation and blank lines", () => {
    expect(lit`
      title

        details
      tail
    `).toBe("title\n\n  details\ntail");
  });

  it("supports interpolation", () => {
    const name = "world";
    expect(lit`
      hello, ${name}!
    `).toBe("hello, world!");
  });
});

describe("txt", () => {
  it("joins wrapped lines markdown-style", () => {
    expect(txt`
      One must still have chaos in oneself to be able to give birth to a dancing
      star, and I say unto you that you still have chaos in you.
    `).toBe(
      "One must still have chaos in oneself to be able to give birth to a dancing star, and I say unto you that you still have chaos in you.",
    );
  });

  it("accepts plain strings", () => {
    expect(txt("\n  a\n    b\n\n  c")).toBe("a b\n\nc");
  });

  it("handles tab indentation", () => {
    expect(txt("\n\t\talpha\n\t\t\tbeta\n")).toBe("alpha beta");
  });

  it("keeps paragraph breaks", () => {
    expect(txt`
      First paragraph line one
      line two

      Second paragraph
    `).toBe("First paragraph line one line two\n\nSecond paragraph");
  });

  it("removes extra blank lines", () => {
    expect(txt`
      First paragraph line one
      line two


      Second paragraph
    `).toBe("First paragraph line one line two\n\nSecond paragraph");
  });

  it("supports interpolation", () => {
    const value = 42;
    expect(txt`
      Value:
      ${value}
    `).toBe("Value: 42");
  });
});
