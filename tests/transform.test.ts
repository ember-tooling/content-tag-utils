import { describe, it, expect } from "vitest";
import { transform, transformSync } from "content-tag-utils";
import { unicodeMulti } from "./helpers.js";

describe("transform", () => {
  it("works with unicode", async () => {
    let result = await transform(unicodeMulti, () => "x");

    expect(result).toMatchInlineSnapshot(`
      "export const Run = <template>x</template>;

      export const Poo = <template>x</template>;

      export const Greeting = <template>
        Hello, <Name @name={{@name}} />!
        <R<template>x</template>"
    `);
  });
});

describe(`transformSync`, () => {
  it("works", () => {
    const gjs = [
      "test('it renders', async (assert) => {",
      "  await render(<template>",
      '  <div class="parent">',
      '    <div class="child"></div>',
      "  </div>",
      "  </template>);",
      "});",
    ].join("\n");

    let result = transformSync(gjs, () => "replaced!");

    expect(result).to.deep.equal(
      [
        "test('it renders', async (assert) => {",
        "  await render(<template>replaced!</template>);",
        "});",
      ].join("\n"),
    );
  });

  it("works on multiple", () => {
    const gjs = [
      "test('it renders', async (assert) => {",
      "  await render(<template>",
      '  <div class="parent">',
      '    <div class="child"></div>',
      "  </div>",
      "  </template>);",
      "});",
    ].join("\n");

    let result = transformSync(gjs, () => "replaced!");

    expect(result).to.deep.equal(
      [
        "test('it renders', async (assert) => {",
        "  await render(<template>replaced!</template>);",
        "});",
      ].join("\n"),
    );
  });

  it("handles a no-op transformSync", () => {
    const gjs = [
      "test('it renders', async (assert) => {",
      "  await render(<template>",
      '  <div class="parent">',
      '    <div class="child"></div>',
      "  </div>",
      "  </template>);",
      "});",
    ].join("\n");

    let result = transformSync(gjs, (x) => x);

    expect(result).toEqual(gjs);
  });

  it("applys a transformSync", () => {
    const gjs = [
      "test('it renders', async (assert) => {",
      "  await render(<template>",
      '  <div class="parent">',
      '    <div class="child"></div>',
      "  </div>",
      "  </template>);",
      "});",
    ].join("\n");

    let result = transformSync(gjs, () => "new content");

    expect(result).toMatchInlineSnapshot(`
      "test('it renders', async (assert) => {
        await render(<template>new content</template>);
      });"
    `);
  });
});
