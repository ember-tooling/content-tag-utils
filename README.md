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

## Usage

```js
import {
    transform,
    extractTemplates,
    replaceTemplates,
    coordinatesOf,
    reverseInnerCoordinates,
} from "content-tag-utils";
```

### transform

Transforms each template within a gjs or gts file in one go.

This is a convenience function that combines `extractTemplates`, `coordinatesOf`, and `replaceTemplates`

```js
import { transform } from 'content-tag-utils';

let file = `
export const Foo = <template>
    Hello there
</template>
`;

let result = transform(file, (contents) => `${contents}!`);
```
result ( a ! character is added right before the closing </template>):
```gjs
export const Foo = <template>
    Hello there
!</template>
```

### extractTemplates

Parses a given gjs / gts file and returns an object with character-indexes, the contents of each template, and the context in which that template was found (which is useful for reversing the coordinates of the inner content).

```js
import { extractTemplates } from 'content-tag-utils';

let file = `
export const Foo = <template>
    Hello there
</template>
`;

let result = extractTemplates(file);
```
result:
```gjs
[
    {
        contents: `
    Hello there
`,
        line: 2,
        column: 29,
        columnOffset: 0,

        characterRange: { start: 30, end: 47 },
        byteRange: { start: 30, end: 47 },
    }
]
```

### replaceTemplates

### coordinatesOf

For a given source document (gjs or gts), and a single parseResult (one of the entries from the array returned from content-tag's parse), what is the line/column number of the first character for that parseResult, and the columnOffset (useful for extracting templates to do work on and then put back, or giving pointers to errors present in the template).

```js
import { coordinatesOf } from 'content-tag-utils';
import { Preprocessor } from 'content/-tag'

let file = `
export const Foo = <template>
    Hello there
</template>
`;

let result = coordinatesOf(file);
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
