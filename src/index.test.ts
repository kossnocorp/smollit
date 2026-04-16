import { describe, expect, it } from "vitest";
import { lit, md, txt } from "./index.js";

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

describe("md", () => {
  it("joins wrapped paragraph lines", () => {
    expect(md`
      One must still have chaos in oneself to be able to give birth to a dancing
      star, and I say unto you that you still have chaos in you.
    `).toBe(
      "One must still have chaos in oneself to be able to give birth to a dancing star, and I say unto you that you still have chaos in you.",
    );
  });

  it("preserves headings and thematic breaks", () => {
    expect(md`
      # Title
      still title line

      ---

      body line one
      body line two
    `).toBe("# Title\nstill title line\n\n---\n\nbody line one body line two");
  });

  it("joins multiline list items", () => {
    expect(md`
      - This is a long item
        that continues on the next line
      - second
    `).toBe("- This is a long item that continues on the next line\n- second");
  });

  it("does not join nested list items into the parent", () => {
    expect(md`
      - parent line
        wraps
        - nested line one
          nested line two
      - sibling
    `).toBe("- parent line wraps\n  - nested line one nested line two\n- sibling");
  });

  it("preserves fenced code blocks", () => {
    expect(md`
      before line one
      before line two

      \`\`\`ts
      const x = 1
      const y = 2
      \`\`\`

      after line one
      after line two
    `).toBe(
      "before line one before line two\n\n```ts\nconst x = 1\nconst y = 2\n```\n\nafter line one after line two",
    );
  });

  it("preserves indented code in list items", () => {
    expect(md`
      - item line one
        item line two
          const x = 1;
      - another
    `).toBe("- item line one item line two\n    const x = 1;\n- another");
  });

  it("joins wrapped blockquote lines and keeps quote paragraph breaks", () => {
    expect(md`
      > Quote line one
      > line two
      >
      > second paragraph
      > wraps too
    `).toBe(
      "> Quote line one line two\n>\n> second paragraph wraps too",
    );
  });

  it("preserves tables, link refs and footnotes", () => {
    expect(md`
      | col a | col b |
      | :--- | ---: |
      | one | two |

      [id]: https://example.com
        title line

      [^1]: Footnote line one
        Footnote line two
    `).toBe(
      "| col a | col b |\n| :--- | ---: |\n| one | two |\n\n[id]: https://example.com\n  title line\n\n[^1]: Footnote line one\n  Footnote line two",
    );
  });

  it("preserves frontmatter, html blocks and interpolation", () => {
    const value = "world";
    expect(md`
      ---
      title: Demo
      ---

      <div>
      Hello
      </div>

      hello
      ${value}
    `).toBe("---\ntitle: Demo\n---\n\n<div>\nHello\n</div>\n\nhello world");
  });
});
