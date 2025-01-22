import { describe, it, expect } from "vitest";
import { transform } from "content-tag-utils";
import { Preprocessor } from "content-tag";

const p = new Preprocessor();

describe(`transform`, () => {
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

    let result = transform(gjs, (hbs) => "replaced!");

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

    let result = transform(gjs, (hbs) => "replaced!");

    expect(result).to.deep.equal(
      [
        "test('it renders', async (assert) => {",
        "  await render(<template>replaced!</template>);",
        "});",
      ].join("\n"),
    );
  });

  it("handles a no-op transform", () => {
    const gjs = [
      "test('it renders', async (assert) => {",
      "  await render(<template>",
      '  <div class="parent">',
      '    <div class="child"></div>',
      "  </div>",
      "  </template>);",
      "});",
    ].join("\n");

    let result = transform(gjs, (x) => x);

    expect(result).toEqual(gjs);
  });

  it("applys a transform", () => {
    const gjs = [
      "test('it renders', async (assert) => {",
      "  await render(<template>",
      '  <div class="parent">',
      '    <div class="child"></div>',
      "  </div>",
      "  </template>);",
      "});",
    ].join("\n");

    let result = transform(gjs, () => "new content");

    expect(result).toMatchInlineSnapshot(`
      "test('it renders', async (assert) => {
        await render(<template>new content</template>);
      });"
    `);
  });
});
