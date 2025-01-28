import { describe, it, expect } from "vitest";
import { Transformer } from "content-tag-utils";

let simpleTest = [
  "test('it renders', async (assert) => {",
  "  await render(<template>",
  '  <div class="parent">',
  '    <div class="child"></div>',
  "  </div>",
  "  </template>);",
  "});",
].join("\n");

let multiTemplate = [
  "export const Name = <template>",
  "  {{@name}}",
  "</template>;",
  "",
  "export const Greeting = <template>",
  "  Hello, <Name @name={{@name}} />!",
  "</template>;",
  "",
].join("\n");

let inAClass = [
  "export class Foo {",
  "  <template>",
  "    hello there",
  "    {{log globalThis}}",
  "  </template>",
  "}",
  "",
].join("\n");

let multiWithClass = [
  "export class Foo {",
  "  <template>",
  "    hello there",
  "    {{log globalThis}}",
  "  </template>",
  "}",
  "",
  "export const Greeting = <template>",
  "  <fieldset>",
  "    <legend>Greeting</legend>",
  "    <Foo />!",
  "  </fieldset>",
  "</template>;",
  "",
].join("\n");

describe("Transformer", () => {
  describe("transformAllSync", () => {
    it("noop", () => {
      let t = new Transformer(simpleTest);

      t.transformAllSync((x) => x);

      expect(t.toString()).toMatchInlineSnapshot(`
        "test('it renders', async (assert) => {
          await render(<template><template>
          <div class="parent">
            <div class="child"></div>
          </div>
          </template></template>);
        });"
      `);
    });

    it("small replace", () => {
      let t = new Transformer(simpleTest);

      t.transformAllSync(() => "x");

      expect(t.toString()).toMatchInlineSnapshot(`
        "test('it renders', async (assert) => {
          await render(<template>x</template>);
        });"
      `);
    });

    it("multiple small replace", () => {
      let t = new Transformer(multiTemplate);

      t.transformAllSync(() => "x");

      expect(t.toString()).toMatchInlineSnapshot(`
        "export const Name = <template>x</template>;

        expport const Greeting = <template>x</template>;
        "
      `);
    });

    it("class small replace", () => {
      let t = new Transformer(inAClass);

      t.transformAllSync(() => "x");

      expect(t.toString()).toMatchInlineSnapshot(`
        "export class Foo {
          <template>x</template>
        }
        "
      `);
    });

    it("class w/ to small replace", () => {
      let t = new Transformer(multiWithClass);

      t.transformAllSync(() => "x");

      expect(t.toString()).toMatchInlineSnapshot(`
        "export class Foo {
          <template>x</template>
        }

        expport const Greeting = <template>x</template>;
        "
      `);
    });
  });

  describe("transformAllAsync", () => {
    it("noop", async () => {
      let t = new Transformer(simpleTest);

      await t.transformAll((x) => x);

      expect(t.toString()).toMatchInlineSnapshot(`
        "test('it renders', async (assert) => {
          await render(<template><template>
          <div class="parent">
            <div class="child"></div>
          </div>
          </template></template>);
        });"
      `);
    });

    it("small replace", async () => {
      let t = new Transformer(simpleTest);

      await t.transformAll(() => Promise.resolve("x"));

      expect(t.toString()).toMatchInlineSnapshot(`
        "test('it renders', async (assert) => {
          await render(<template>x</template>);
        });"
      `);
    });

    it("multiple small replace", async () => {
      let t = new Transformer(multiTemplate);

      await t.transformAll(() => Promise.resolve("x"));

      expect(t.toString()).toMatchInlineSnapshot(`
        "export const Name = <template>x</template>;

        expport const Greeting = <template>x</template>;
        "
      `);
    });

    it("class small replace", async () => {
      let t = new Transformer(inAClass);

      await t.transformAll(() => Promise.resolve("x"));

      expect(t.toString()).toMatchInlineSnapshot(`
        "export class Foo {
          <template>x</template>
        }
        "
      `);
    });

    it("class w/ to small replace", async () => {
      let t = new Transformer(multiWithClass);

      await t.transformAll(() => Promise.resolve("x"));

      expect(t.toString()).toMatchInlineSnapshot(`
        "export class Foo {
          <template>x</template>
        }

        expport const Greeting = <template>x</template>;
        "
      `);
    });
  });
});
