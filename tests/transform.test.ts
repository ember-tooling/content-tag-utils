import { describe, it, expect } from "vitest";
import { transformSync } from "content-tag-utils";

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
