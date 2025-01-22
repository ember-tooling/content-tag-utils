import { describe, it, expect } from 'vitest';
import { coordinatesOf } from "content-tag-utils";
import { Preprocessor } from 'content-tag';

const p = new Preprocessor();

describe('coordinatesOf', function() {
  it('makes sense for one line components', function() {
    let js = '<template>{{book}}</template>';

    const parsed = p.parse(js);
    const result = coordinatesOf(js, parsed[0]);
    expect(result.line).toBe(1);
    expect(result.column).toBe(10);
    expect(result.columnOffset).toBe(0);
    expect(result).toMatchInlineSnapshot(`
      {
        "column": 10,
        "columnOffset": 0,
        "end": 18,
        "line": 1,
        "start": 10,
      }
    `);
  });

  it('should contain only valid rule configuration', function() {
    let typescript =
      /* 1 */ `import Component from '@glimmer/component';\n` +
      /* 2 */ '\n' +
      /* 3 */ 'interface Args {}\n' +
      /* 4 */ '\n' +
      /* 5 */ 'export class SomeComponent extends Component<Args> {\n' +
      /* 6 */ '  <template>\n' +
      /* 7 */ '    {{debugger}}\n' +
      /* 8 */ '  </template>\n' +
      /* 9 */ '}\n';

    const parsed = p.parse(typescript);
    const result = coordinatesOf(typescript, parsed[0]);
    expect(result.line).toBe(6);
    // this may look weird, but this 12th character on line 6 is the \n
    expect(result.column).toBe(12);
    expect(result.columnOffset).toBe(2);
    expect(result).toMatchInlineSnapshot(`
      {
        "column": 12,
        "columnOffset": 2,
        "end": 149,
        "line": 6,
        "start": 129,
      }
    `);
  });

  it('has correct templateInfos when in a function', function() {
    const multiTemplateScript = [
      /* 1 */ `export function foo() {`,
      /* 2 */ `  const bar = 2;`,
      /* 3 */ ``,
      /* 4 */ `  return <template>`,
      /* 5 */ `    {{yield}}`,
      /* 6 */ `  </template>`,
      /* 7 */ `}`,
      /* 8 */ ``,
    ].join('\n');
    const parsed = p.parse(multiTemplateScript);

    expect(coordinatesOf(multiTemplateScript, parsed[0])).toMatchInlineSnapshot(`
      {
        "column": 19,
        "columnOffset": 2,
        "end": 78,
        "line": 4,
        "start": 61,
      }
    `);
  });

  it('has correct templateInfos with multiple templates', function() {
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
    const parsed = p.parse(multiTemplateScript);

    expect(coordinatesOf(multiTemplateScript, parsed[0])).toMatchInlineSnapshot(`
      {
        "column": 27,
        "columnOffset": 0,
        "end": 87,
        "line": 3,
        "start": 86,
      }
    `);
    expect(coordinatesOf(multiTemplateScript, parsed[1])).toMatchInlineSnapshot(`
      {
        "column": 27,
        "columnOffset": 0,
        "end": 128,
        "line": 4,
        "start": 127,
      }
    `);
    expect(coordinatesOf(multiTemplateScript, parsed[2])).toMatchInlineSnapshot(`
      {
        "column": 27,
        "columnOffset": 0,
        "end": 182,
        "line": 6,
        "start": 169,
      }
    `);
  });

  it('should contain only valid rule configuration', function() {
    let typescript =
      /* 1  */ `import type { TOC } from '@ember/component/template-only';\n` +
      /* 2  */ '\n' +
      /* 3  */ 'interface Args {}\n' +
      /* 4  */ '\n' +
      /* 5  */ 'export const myComponent =\n' +
      /* 6  */ '  <template>\n' +
      /* 7  */ '    {{yield}}\n' +
      /* 8  */ '  </template> satisfies TOC<{\n' +
      /* 9  */ '    Blocks: { default: []; };\n' +
      /* 10 */ '  }>\n' +
      /* 11 */ '\n';

    const parsed = p.parse(typescript);
    const result = coordinatesOf(typescript, parsed[0]);
    expect(result.line).toBe(6);
    expect(result.column).toBe(12);
    expect(result.columnOffset).toBe(2);
    expect(result).toMatchInlineSnapshot(`
      {
        "column": 12,
        "columnOffset": 2,
        "end": 135,
        "line": 6,
        "start": 118,
      }
    `);
  });
});

