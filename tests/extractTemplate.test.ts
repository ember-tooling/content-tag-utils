import { describe, it, expect } from 'vitest';
import { extractTemplates } from 'content-tag-utils';

describe('extractTemplates', function() {
  const script =
    /* 1 */ 'export const SomeComponent = <template>\n' +
    /* 2 */ '<button></button>\n' +
    /* 3 */ '</template>';

  it('returns the parsed template if the content could be parsed as a script', function() {
    expect(extractTemplates(script)).toMatchInlineSnapshot(`
        [
          {
            "column": 39,
            "columnOffset": 0,
            "contentRange": {
              "end": 58,
              "start": 39,
            },
            "contents": "
        <button></button>
        ",
            "end": 58,
            "line": 1,
            "start": 39,
          },
        ]
      `);
  });

  it('returns the entire content as the extension is a script file', function() {
    expect(extractTemplates(script)).toMatchInlineSnapshot(`
        [
          {
            "column": 39,
            "columnOffset": 0,
            "contentRange": {
              "end": 58,
              "start": 39,
            },
            "contents": "
        <button></button>
        ",
            "end": 58,
            "line": 1,
            "start": 39,
          },
        ]
      `);
  });
});

describe('extractTemplates with multiple templates', function() {
  const multiTemplateScript = [
    /* 1 */ `import type { TOC } from '@ember/component/template-only'`,
    /* 2 */ ``,
    /* 3 */ `export const A = <template>x</template>;`,
    /* 4 */ `export const B = <template>y</template>;`,
    /* 5 */ ``,
    /* 6 */ `export const C = <template>`,
    /* 7 */ `  {{yield}}`,
    /* 8 */ `</template> satisfies TOC<{ Blocks: { default: [] }}>`,
    /* 9 */ ``,
  ].join('\n');

  it('has correct templateInfos', function() {
    expect(extractTemplates(multiTemplateScript)).toMatchInlineSnapshot(`
      [
        {
          "column": 27,
          "columnOffset": 0,
          "contentRange": {
            "end": 87,
            "start": 86,
          },
          "contents": "x",
          "end": 87,
          "line": 3,
          "start": 86,
        },
        {
          "column": 27,
          "columnOffset": 0,
          "contentRange": {
            "end": 128,
            "start": 127,
          },
          "contents": "y",
          "end": 128,
          "line": 4,
          "start": 127,
        },
        {
          "column": 27,
          "columnOffset": 0,
          "contentRange": {
            "end": 182,
            "start": 169,
          },
          "contents": "
        {{yield}}
      ",
          "end": 182,
          "line": 6,
          "start": 169,
        },
      ]
    `);
  });
});

