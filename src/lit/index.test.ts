import { describe, expect, it } from "vitest";
import { lit } from "./index.js";

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
