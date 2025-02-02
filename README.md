# content-tag-utils

Utilities for writing tools that work with [content-tag](https://github.com/embroider-build/content-tag) and converting bytes-indexes to character-indexes.

Aimed at sharing logic between:

- [eslint](https://eslint.org/) w/ [ember-eslint-parser](https://github.com/ember-tooling/ember-eslint-parser)
- [prettier](https://github.com/prettier/prettier) w/ [prettier-plugin-ember-template-tag](https://github.com/ember-tooling/prettier-plugin-ember-template-tag)
- [ember-template-lint](https://github.com/ember-template-lint/ember-template-lint)

> [!NOTE]  
> This utility is meant for local tooling and not the browser, or transforming runtime code. No sourcemaps are involved. (Sourcemaps should be used when transforming code meant for runtime).

## Install

```bash
npm add content-tag-utils
```

Using from source / github, via package.json:

```js
{
    "dependencies": {
        "content-tag-utils": "github:NullVoxPopuli/content-tag-utils"
    }
}
```

## Usage

```js
import {
  transform,
  transformSync,
  coordinatesOf,
  Transformer,
} from "content-tag-utils";
```

### Transformer

A general utility for working with content-tag, keeping tracked of each template as you apply transformations.
Transformations are recorded and then applied later when calling `.toString()`.

For example:

```js
import { Transformer } from "content-tag-utils";

let file = `
export const Foo = <template>
    Hello there
</template>
`;

let t = new Transformer(file);

// apply some transformations, with their coordinates
await t.asyncMap((contents, coordinates => {
    /* ... */
    return 'new content';
});
t.map((contents, coordinates) => {
    /* ... */
    return 'new content 2';
});

// iterate over the templates, with their coordinates
await t.asyncEach((contents, coordinates => {
    /* ... */
});
t.each((contents, coordinates) => {
    /* ... */
});

// get the output
t.toString();

// can also do more transformations and get the output again later
await t.transform(/* ... */ )
t.toString();
```

Properties / Methods:

- `t.toString()` returns a string of the original file with all applied transforms
- `t.parseResults` output from `content-tag` , but frozen / read-only - these are used as keys for other methods
- `t.map()`
- `t.each()`
- `t.asyncMap()`
- `t.asyncEach()`
- `t.transformOneSync()`
- `t.transformOne()`
- `t.reverseInnerCoordinatesOf()` Given in-template coordinates, returns the coordinates in the context of the file

### transform + transformSync

Transforms each template within a gjs or gts file in one go.

These are convenience functions that wraps the `Transformer`.

The first argument to the callback will be the previous template-contents, and the second argument will be the coordinates of that template.

```js
import { transform, transformSync } from "content-tag-utils";

let file = `
export const Foo = <template>
    Hello there
</template>
`;

let result = await transform(file, (contents, coordinates) => `${contents}!`);
let result2 = transformSync(file, (contents, coordinates) => `${contents}!`);
```

result / result 2 ( a ! character is added right before the closing </template>):

```gjs
export const Foo = <template>
    Hello there
!</template>
```

### coordinatesOf

For a given source document (gjs or gts), and a single parseResult (one of the entries from the array returned from content-tag's parse), what is the line/column number of the first character for that parseResult, and the columnOffset (useful for extracting templates to do work on and then put back, or giving pointers to errors present in the template).

```js
import { coordinatesOf } from "content-tag-utils";
import { Preprocessor } from "content-tag";

let p = new Preprocessor();

let file = `
export const Foo = <template>
    Hello there
</template>
`;

let parsed = p.parse(file);

let result = coordinatesOf(file, parsed[0]);
```

result (all values are character-indexes):

```gjs
{
    line: 2,
    column: 29,
    columnOffset: 0,

    start: 30,
    end: 47,
}
```

### reverseInnerCoordinates

Given inner coordinates scoped to a template, this function returns the coordinates in the overall source file.

```js
import { reverseInnerCoordinates } from 'content-tag-utils';

let file = `
export const Foo = <template>
    Hello there
</template>
`;
// e.g.: a lint result
let innerCoordinates = {
    line: 2,
    column: 4,
    endColumn: 5,
    endLine: 2,
    // extraneous, but may be present in your tool
    error: 'no capital letters!',
};

const templateInfos = extractTemplates(file);
const result = reverseInnerCoordinates(templateInfos[0]!, innerCoordinates);
```

result:

```gjs
{
    column: 4,
    endColumn: 5,
    endLine: 3,
    line: 3,
}
```
