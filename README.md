# Smol Lit

Tiny string template helpers. Trims the string content and levels its indentation, optionally joining lines Markdown-style, helpful when authoring large strings in JS/TS (e.g., prompts, source code, or marketing copy).

The package features dual CJS/ESM support and built-in TypeScript definitions.

## Installation

The package is available on npm:

```sh
npm install smollit
```

## Usage

### `lit`

The `lit` function trims and levels indentation of a string to a minimal common level, while preserving relative indentation.

```ts
import { lit } from "smollit";
// Also available as a module:
// import { lit } from "smollit/lit";

function poem() {
  console.log(lit`
    Two roads diverged in a wood, and I—
    I took the one less traveled by,
    And that has made all the difference.
  `);
  //=> "Two roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference."
}

function code() {
  console.log(lit`
    function hello() {
      console.log("Hello, cruel world!");
    }
  `);
  //=> "function hello() {\n  console.log(\"Hello, cruel world!\");\n}"
}
```

### `txt`

The `txt` function trims and levels indentation of a string to a minimal common level, while preserving relative indentation. **Also, it joins lines**, Markdown-style.

```ts
import { txt } from "smollit";
// Also available as a module:
// import { txt } from "smollit/txt";

function quote() {
  console.log(txt`
    One must still have chaos in oneself to be able to give birth to a dancing
    star, and I say unto you that you still have chaos in you, and that in this
    unrest there lies the possibility of creation, transformation, and becoming
    something greater than what you are.
  `);
  //=> "One must still have chaos in oneself to be able to give birth to a dancing star, and I say unto you that you still have chaos in you, and that in this unrest there lies the possibility of creation, transformation, and becoming something greater than what you are."
}

function text() {
  console.log(txt`
    You have power over your mind—not outside events. Realize this, and you will
    find strength.

    The happiness of your life depends upon the quality of your thoughts.
    Therefore, guard accordingly, and take care that you entertain no notions
    unsuitable to virtue and reasonable nature.
  `);
  //=> "You have power over your mind—not outside events. Realize this, and you will find strength.\n\nThe happiness of your life depends upon the quality of your thoughts. Therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature."
}
```

### `txts`

The `txts` function normalizes multiple paragraph inputs with `txt` and joins them with a blank line.

```ts
import { txts } from "smollit";
// Also available as a module:
// import { txts } from "smollit/txts";

function paragraphs() {
  console.log(
    txts(
      `
        First paragraph line one
        line two
      `,
      "Second paragraph",
    ),
  );
  //=> "First paragraph line one line two\n\nSecond paragraph"
}
```

It also filters out non-string, falsy values, and empty strings:

```ts
function paragraphs() {
  console.log(
    txts(
      `
        First paragraph line one
        line two
      `,
      "    ",
      "",
      null,
      undefined,
      false,
      1,
      2n,
      "Second paragraph",
    ),
  );
  //=> "First paragraph line one line two\n\nSecond paragraph"
}
```

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://koss.nocorp.me/mit/)
