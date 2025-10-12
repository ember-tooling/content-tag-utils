import { describe, it, expect } from "vitest";

import { Transformer } from "content-tag-utils";

import {
  implicitDefault,
  inAClass,
  multiTemplate,
  multiWithClass,
  simpleTest,
} from "./helpers.js";

it("simpleTest", () => {
  let t = new Transformer(simpleTest);

  let result = t.toStringWithTemplatePlaceholders();

  expect(result).toMatchInlineSnapshot(`
    "test('it renders', async (assert) => {
      await render(TEMPLATE_TEMPLATE(\`
        <div class="parent">
          <div class="child"></div>
        </div>
      \`));
    });"
  `);
  expect(simpleTest.length).toEqual(result.length);
});

it("implicitDefault.js", () => {
  let t = new Transformer(implicitDefault.js);

  let result = t.toStringWithTemplatePlaceholders();

  expect(result).toMatchInlineSnapshot(`"TEMPLATE_TEMPLATE(\`hi\`)"`);
  expect(implicitDefault.js.length).toEqual(result.length);
});

it("implicitDefault.satisfies", () => {
  let t = new Transformer(implicitDefault.satisfies);

  let result = t.toStringWithTemplatePlaceholders();

  expect(result).toMatchInlineSnapshot(`
    "
    import type { TOC } from '@ember/component/template-only';

    TEMPLATE_TEMPLATE(\`hi there\`) satisfies TOC<{
      /* ... */
    }>"
  `);
  expect(implicitDefault.satisfies.length).toEqual(result.length);
});

it("inAClass", () => {
  let t = new Transformer(inAClass);

  let result = t.toStringWithTemplatePlaceholders();

  expect(result).toMatchInlineSnapshot(`
    "export class Foo {
      [_TEMPLATE_(\`
        hello there
        {{log globalThis}}
      \`)] = 0;
    }
    "
  `);
  expect(inAClass.length).toEqual(result.length);
});

it("multiTemplate", () => {
  let t = new Transformer(multiTemplate);

  let result = t.toStringWithTemplatePlaceholders();

  expect(result).toMatchInlineSnapshot(`
    "export const Name = TEMPLATE_TEMPLATE(\`
      {{@name}}
    \`);

    export const Greeting = TEMPLATE_TEMPLATE(\`
      Hello, <Name @name={{@name}} />!
    \`);
    "
  `);
  expect(multiTemplate.length).toEqual(result.length);
});

it("multiWithClass", () => {
  let t = new Transformer(multiWithClass);

  let result = t.toStringWithTemplatePlaceholders();

  expect(result).toMatchInlineSnapshot(`
    "export class Foo {
      [_TEMPLATE_(\`
        hello there
        {{log globalThis}}
      \`)] = 0;
    }

    export const Greeting = TEMPLATE_TEMPLATE(\`
      <fieldset>
        <legend>Greeting</legend>
        <Foo />!
      </fieldset>
    \`);
    "
  `);
  expect(multiWithClass.length).toEqual(result.length);
});

describe("with transforms", () => {
  it("noop", () => {
    let t = new Transformer(simpleTest);

    t.map((x) => x);

    let result = t.toStringWithTemplatePlaceholders();

    expect(result).toMatchInlineSnapshot(`
      "test('it renders', async (assert) => {
        await render(TEMPLATE_TEMPLATE(\`
          <div class="parent">
            <div class="child"></div>
          </div>
        \`));
      });"
    `);

    expect(simpleTest.length).toEqual(result.length);
  });

  it("implicit default", () => {
    let t = new Transformer(implicitDefault.satisfies);

    t.map(() => "x");
    let result = t.toStringWithTemplatePlaceholders();

    expect(result).toMatchInlineSnapshot(`
      "
      import type { TOC } from '@ember/component/template-only';

      TEMPLATE_TEMPLATE(\`x\`) satisfies TOC<{
        /* ... */
      }>"
    `);
  });

  it("multiple small replace", () => {
    let t = new Transformer(multiTemplate);

    t.map(() => "x");

    expect(t.toStringWithTemplatePlaceholders()).toMatchInlineSnapshot(`
      "export const Name = TEMPLATE_TEMPLATE(\`x\`);

      export const Greeting = TEMPLATE_TEMPLATE(\`x\`);
      "
    `);
  });

  it("class small replace", () => {
    let t = new Transformer(inAClass);

    t.map(() => "x");

    expect(t.toStringWithTemplatePlaceholders()).toMatchInlineSnapshot(`
      "export class Foo {
        [_TEMPLATE_(\`x\`)] = 0;
      }
      "
    `);
  });

  it("class w/ to small replace", () => {
    let t = new Transformer(multiWithClass);

    t.map(() => "x");

    expect(t.toStringWithTemplatePlaceholders()).toMatchInlineSnapshot(`
      "export class Foo {
        [_TEMPLATE_(\`x\`)] = 0;
      }

      export const Greeting = TEMPLATE_TEMPLATE(\`x\`);
      "
    `);
  });
});
