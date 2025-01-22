# content-tag-utils

Utilities for writing tools that work with [content-tag](https://github.com/embroider-build/content-tag) and converting bytes-indexes to character-indexes.

Aimed at sharing logic between:
- [eslint](https://eslint.org/) w/ [ember-eslint-parser](https://github.com/ember-tooling/ember-eslint-parser)
- [prettier](https://github.com/prettier/prettier) w/ [prettier-plugin-ember-template-tag](https://github.com/ember-tooling/prettier-plugin-ember-template-tag)
- [ember-template-lint](https://github.com/ember-template-lint/ember-template-lint)


## Install

```bash
npm add content-tag-utils
```

## Usage

```js
import {
    transform,
    extractTemplates,
    coordinatesOf,
    reverseInnerCoordinates,
} from "content-tag-utils";
```

### transform

Transforms each template within a gjs or gts file

```js
import { transform } from 'content-tag-utils';
```

### extractTemplates

Parses a given gjs / gts file and returns an object with character-indexes, the contents of each template, and the context in which that template was found (which is useful for reversing the coordinates of the inner content).

```js
import { extractTemplates } from 'content-tag-utils';
```

### coordinatesOf

For a given source document (gjs or gts), and a single parseResult (one of the entries from the array returned from content-tag's parse), what is the line/column number of the first character for that parseResult, and the columnOffset (useful for extracting templates to do work on and then put back, or giving pointers to errors present in the template).

```js
import { coordinatesOf } from 'content-tag-utils';
```


### reverseInnerCoordinates

Given inner coordinates scoped to a template, this function returns the coordinates in the overall source file.


```js
import { reverseInnerCoordinates } from 'content-tag-utils';
```
