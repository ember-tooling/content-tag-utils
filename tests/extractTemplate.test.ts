import { describe, it, expect } from 'vitest';
import { extractTemplates } from 'content-tag-utils';

describe('extractTemplates', function() {
  const script =
    /* 1 */ 'export const SomeComponent = <template>\n' +
    /* 2 */ '<button></button>\n' +
    /* 3 */ '</template>';

  it('gives me the value for the README', () => {
    let file = `
export const Foo = <template>
    Hello there
</template>
`;

    expect(extractTemplates(file)).toMatchInlineSnapshot(`
      [
        {
          "byteRange": {
            "end": 47,
            "start": 30,
          },
          "characterRange": {
            "end": 47,
            "start": 30,
          },
          "column": 29,
          "columnOffset": 0,
          "contents": "
          Hello there
      ",
          "line": 2,
        },
      ]
    `);

  });

  it('returns the parsed template if the content could be parsed as a script', function() {
    expect(extractTemplates(script)).toMatchInlineSnapshot(`
      [
        {
          "byteRange": {
            "end": 58,
            "start": 39,
          },
          "characterRange": {
            "end": 58,
            "start": 39,
          },
          "column": 39,
          "columnOffset": 0,
          "contents": "
      <button></button>
      ",
          "line": 1,
        },
      ]
    `);
  });

  it('returns the entire content as the extension is a script file', function() {
    expect(extractTemplates(script)).toMatchInlineSnapshot(`
      [
        {
          "byteRange": {
            "end": 58,
            "start": 39,
          },
          "characterRange": {
            "end": 58,
            "start": 39,
          },
          "column": 39,
          "columnOffset": 0,
          "contents": "
      <button></button>
      ",
          "line": 1,
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
          "byteRange": {
            "end": 87,
            "start": 86,
          },
          "characterRange": {
            "end": 87,
            "start": 86,
          },
          "column": 27,
          "columnOffset": 0,
          "contents": "x",
          "line": 3,
        },
        {
          "byteRange": {
            "end": 128,
            "start": 127,
          },
          "characterRange": {
            "end": 128,
            "start": 127,
          },
          "column": 27,
          "columnOffset": 0,
          "contents": "y",
          "line": 4,
        },
        {
          "byteRange": {
            "end": 182,
            "start": 169,
          },
          "characterRange": {
            "end": 182,
            "start": 169,
          },
          "column": 27,
          "columnOffset": 0,
          "contents": "
        {{yield}}
      ",
          "line": 6,
        },
      ]
    `);
  });
});

